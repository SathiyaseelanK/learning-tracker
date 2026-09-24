// ═══════════════════════════════════════════════════════════════════════════════
// DAILY LEARNING HABIT TRACKER — Google Apps Script Backend
// ═══════════════════════════════════════════════════════════════════════════════
//
// HOW TO DEPLOY:
//   1. Go to script.google.com → New project → paste this entire file
//   2. Replace SHEET_ID below with your actual Google Sheet ID
//   3. Click Deploy → New deployment → Web app
//      • Execute as: Me
//      • Who has access: Anyone
//   4. Copy the deployment URL → paste into WEBAPP_URL in index.html
//
// SHEET COLUMNS (auto-created on first run):
//   A: moduleId   B: status   C: note   D: updatedAt   E: email   F: clientUpdatedAt
//
// REQUEST SHAPES FROM THE APP:
//   GET  ?action=get&token=...
//   POST { action:'save',   token, moduleId, status, note, clientUpdatedAt }
//   POST { action:'delete', token, moduleId, clientUpdatedAt }
//
// RESPONSE SHAPE EXPECTED BY THE APP:
//   { success: true,  data: [ {moduleId, status, note, updatedAt, email}, ... ] }
//   { success: false, error: 'message' }
//
// ═══════════════════════════════════════════════════════════════════════════════

// ── CONFIGURATION ────────────────────────────────────────────────────────────

const CONFIG = {
  SHEET_ID      : '1lA6tH0HK8G185UP2Dn4MmQaJCOLXVI4rF4qPOPTfRQE',
  SHEET_NAME    : 'Progress',
  SECRET_TOKEN  : 'Sathiya@Tracker26',  // must match exactly what your Apps Script already has
  ALLOWED_EMAIL : 'sathiya14ooty@gmail.com',

  // Weekly digest email (used by sendWeeklyDigest trigger)
  DIGEST_EMAIL  : 'sathiya14ooty@gmail.com',

  // Column indices (1-based, matches spreadsheet columns A–F)
  COL : {
    MODULE_ID         : 1,   // A — e.g. "gcp:1", "meta:books"
    STATUS            : 2,   // B — "completed" | "skipped" | "pending" | JSON blob
    NOTE              : 3,   // C — session notes text
    UPDATED_AT        : 4,   // D — ISO timestamp of last server write
    EMAIL             : 5,   // E — user email (for multi-user future support)
    CLIENT_UPDATED_AT : 6,   // F — ISO timestamp from client (conflict resolution)
  },
};

// ── CORS HEADERS ─────────────────────────────────────────────────────────────

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin'  : '*',
    'Access-Control-Allow-Methods' : 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers' : 'Content-Type',
  };
}

function jsonResponse(obj, code) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── ENTRY POINTS ─────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    const params = e.parameter || {};

    // Handle preflight / health check
    if (!params.action) {
      return jsonResponse({ success: true, message: 'Learning Tracker API is running.' });
    }

    if (params.action === 'get') {
      return handleGet(params);
    }

    return jsonResponse({ success: false, error: 'Unknown GET action: ' + params.action });

  } catch (err) {
    logError('doGet', err);
    return jsonResponse({ success: false, error: err.message });
  }
}

function doPost(e) {
  try {
    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (_) {
      return jsonResponse({ success: false, error: 'Invalid JSON body.' });
    }

    if (body.action === 'save')   return handleSave(body);
    if (body.action === 'delete') return handleDelete(body);

    return jsonResponse({ success: false, error: 'Unknown POST action: ' + body.action });

  } catch (err) {
    logError('doPost', err);
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

/**
 * Returns true if the token is valid.
 * Simple single-token auth — extend to per-user tokens for multi-user support.
 */
function isValidToken(token) {
  if (!token) return false;
  return token === CONFIG.SECRET_TOKEN;
}

// ── GET — load all rows for the user ─────────────────────────────────────────

function handleGet(params) {
  if (!isValidToken(params.token)) {
    return jsonResponse({ success: false, error: 'Invalid or missing token.' });
  }

  const sheet = getSheet();
  ensureHeaders(sheet);

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    // Sheet is empty — return empty data (first login)
    return jsonResponse({ success: true, data: [] });
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  const data = [];

  rows.forEach(row => {
    const moduleId = String(row[CONFIG.COL.MODULE_ID - 1] || '').trim();
    if (!moduleId) return; // skip blank rows

    data.push({
      moduleId        : moduleId,
      status          : String(row[CONFIG.COL.STATUS           - 1] || ''),
      note            : String(row[CONFIG.COL.NOTE             - 1] || ''),
      updatedAt       : String(row[CONFIG.COL.UPDATED_AT       - 1] || ''),
      email           : String(row[CONFIG.COL.EMAIL            - 1] || ''),
      clientUpdatedAt : String(row[CONFIG.COL.CLIENT_UPDATED_AT - 1] || ''),
    });
  });

  return jsonResponse({ success: true, data: data });
}

// ── SAVE — upsert a single row ────────────────────────────────────────────────

function handleSave(body) {
  if (!isValidToken(body.token)) {
    return jsonResponse({ success: false, error: 'Invalid or missing token.' });
  }

  const moduleId = String(body.moduleId || '').trim();
  if (!moduleId) {
    return jsonResponse({ success: false, error: 'moduleId is required.' });
  }

  const status          = String(body.status          || '');
  const note            = String(body.note            || '');
  const clientUpdatedAt = String(body.clientUpdatedAt || '');
  const serverNow       = new Date().toISOString();
  const email           = CONFIG.ALLOWED_EMAIL;

  const sheet   = getSheet();
  ensureHeaders(sheet);
  const rowIdx  = findRow(sheet, moduleId);

  if (rowIdx > 0) {
    // ── CONFLICT RESOLUTION ─────────────────────────────────────────────────
    // Rule: if the server has a NEWER updatedAt than what the client sent as
    // clientUpdatedAt, the server wins — reject the overwrite silently.
    // This handles: mark done on phone → laptop syncs stale state → phone wins.
    const existingUpdatedAt = sheet.getRange(rowIdx, CONFIG.COL.UPDATED_AT).getValue();
    if (existingUpdatedAt && clientUpdatedAt) {
      const serverTime = new Date(existingUpdatedAt).getTime();
      const clientTime = new Date(clientUpdatedAt).getTime();
      if (!isNaN(serverTime) && !isNaN(clientTime) && serverTime > clientTime) {
        // Server is newer — return current server data so client can reconcile
        const currentRow = sheet.getRange(rowIdx, 1, 1, 6).getValues()[0];
        return jsonResponse({
          success   : true,
          conflict  : true,
          serverRow : {
            moduleId        : currentRow[0],
            status          : currentRow[1],
            note            : currentRow[2],
            updatedAt       : currentRow[3],
            email           : currentRow[4],
            clientUpdatedAt : currentRow[5],
          },
        });
      }
    }

    // Update existing row
    sheet.getRange(rowIdx, CONFIG.COL.STATUS).setValue(status);
    sheet.getRange(rowIdx, CONFIG.COL.NOTE).setValue(note);
    sheet.getRange(rowIdx, CONFIG.COL.UPDATED_AT).setValue(serverNow);
    sheet.getRange(rowIdx, CONFIG.COL.EMAIL).setValue(email);
    sheet.getRange(rowIdx, CONFIG.COL.CLIENT_UPDATED_AT).setValue(clientUpdatedAt);

  } else {
    // Insert new row
    sheet.appendRow([
      moduleId,
      status,
      note,
      serverNow,
      email,
      clientUpdatedAt,
    ]);
  }

  return jsonResponse({ success: true, updatedAt: serverNow });
}

// ── DELETE — remove a row (used when resetting a session to 'pending') ────────

function handleDelete(body) {
  if (!isValidToken(body.token)) {
    return jsonResponse({ success: false, error: 'Invalid or missing token.' });
  }

  const moduleId = String(body.moduleId || '').trim();
  if (!moduleId) {
    return jsonResponse({ success: false, error: 'moduleId is required.' });
  }

  const sheet  = getSheet();
  const rowIdx = findRow(sheet, moduleId);

  if (rowIdx > 0) {
    sheet.deleteRow(rowIdx);
  }
  // If row doesn't exist, delete is a no-op — still success

  return jsonResponse({ success: true });
}

// ── SHEET HELPERS ─────────────────────────────────────────────────────────────

/**
 * Returns the Progress sheet, creating it if it doesn't exist.
 */
function getSheet() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet   = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    Logger.log('Created sheet: ' + CONFIG.SHEET_NAME);
  }

  return sheet;
}

/**
 * Writes the header row if the sheet is completely empty.
 */
function ensureHeaders(sheet) {
  if (sheet.getLastRow() < 1) {
    sheet.appendRow(['moduleId', 'status', 'note', 'updatedAt', 'email', 'clientUpdatedAt']);
    // Freeze header row
    sheet.setFrozenRows(1);
    // Style header
    const headerRange = sheet.getRange(1, 1, 1, 6);
    headerRange.setBackground('#1a1f36');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    // Set column widths
    sheet.setColumnWidth(1, 200); // moduleId
    sheet.setColumnWidth(2, 120); // status
    sheet.setColumnWidth(3, 400); // note
    sheet.setColumnWidth(4, 200); // updatedAt
    sheet.setColumnWidth(5, 200); // email
    sheet.setColumnWidth(6, 200); // clientUpdatedAt
    Logger.log('Headers created.');
  }
}

/**
 * Finds the row index (1-based) of a given moduleId.
 * Returns -1 if not found.
 * Uses a direct column scan — fast for < 10,000 rows.
 */
function findRow(sheet, moduleId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const values = sheet.getRange(2, CONFIG.COL.MODULE_ID, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === moduleId) {
      return i + 2; // +2 because data starts at row 2 (row 1 is header)
    }
  }
  return -1;
}

// ── WEEKLY DIGEST EMAIL ───────────────────────────────────────────────────────
//
// TO ENABLE:
//   Apps Script editor → Triggers (clock icon) → Add trigger
//   Function: sendWeeklyDigest
//   Event source: Time-driven
//   Type: Week timer
//   Day: Friday
//   Time: 6pm – 7pm
//   → Save
//
// This runs every Friday evening and emails a summary of the week's progress.

function sendWeeklyDigest() {
  try {
    const sheet   = getSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log('No data yet — skipping digest.');
      return;
    }

    const rows    = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    const now     = new Date();

    // ── THIS WEEK'S DATA ──────────────────────────────────────────────────
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    weekEnd.setHours(23, 59, 59, 999);

    let sessionsThisWeek  = 0;
    let skippedThisWeek   = 0;
    let notesThisWeek     = 0;
    let totalCompleted    = 0;
    let totalSkipped      = 0;
    const completedTitles = [];

    rows.forEach(row => {
      const moduleId  = String(row[0] || '').trim();
      const status    = String(row[1] || '').trim();
      const note      = String(row[2] || '').trim();
      const updatedAt = row[3] ? new Date(row[3]) : null;

      if (!moduleId || moduleId.startsWith('meta:')) return;

      if (status === 'completed') totalCompleted++;
      if (status === 'skipped')   totalSkipped++;

      if (updatedAt && updatedAt >= weekStart && updatedAt <= weekEnd) {
        if (status === 'completed') {
          sessionsThisWeek++;
          if (note) notesThisWeek++;
          completedTitles.push(moduleId);
        }
        if (status === 'skipped') skippedThisWeek++;
      }
    });

    // ── STREAK CALCULATION ────────────────────────────────────────────────
    const completionDates = rows
      .filter(r => String(r[1]) === 'completed' && r[3])
      .map(r => {
        const d = new Date(r[3]);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

    const uniqueDays = [...new Set(completionDates)].sort((a, b) => b - a);
    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let check   = today.getTime();

    for (const dayTs of uniqueDays) {
      // skip weekends in streak
      const d = new Date(dayTs);
      if (d.getDay() === 0 || d.getDay() === 6) { check = dayTs - 86400000; continue; }
      if (dayTs === check) {
        streak++;
        check -= 86400000;
        // skip back over weekends
        while (new Date(check).getDay() === 0 || new Date(check).getDay() === 6) {
          check -= 86400000;
        }
      } else {
        break;
      }
    }

    // ── NEXT WEEK SESSIONS (simple message) ──────────────────────────────
    const remaining = rows
      .filter(r => {
        const mid    = String(r[0] || '').trim();
        const status = String(r[1] || '').trim();
        return mid && !mid.startsWith('meta:') && (!status || status === 'pending');
      })
      .slice(0, 5)
      .map(r => '  • ' + String(r[0]).replace(':', ' Day '))
      .join('\n');

    // ── BUILD EMAIL ───────────────────────────────────────────────────────
    const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      + ' – ' + weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const subject = '📊 Weekly Learning Summary — ' + weekLabel;

    const body = [
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '🌱 Daily Learning Habit Tracker',
      'Weekly Summary — ' + weekLabel,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      '📅 THIS WEEK',
      '  ✅ Sessions completed : ' + sessionsThisWeek,
      '  ↷  Sessions skipped   : ' + skippedThisWeek,
      '  📝 Sessions with notes: ' + notesThisWeek,
      '',
      '📈 ALL TIME',
      '  ✅ Total completed    : ' + totalCompleted,
      '  ↷  Total skipped      : ' + totalSkipped,
      '  🔥 Current streak     : ' + streak + ' day' + (streak !== 1 ? 's' : ''),
      '',
      sessionsThisWeek > 0
        ? '✅ COMPLETED THIS WEEK\n' + completedTitles.map(id => '  • ' + id.replace(':', ' Day ')).join('\n')
        : '⚠️  No sessions completed this week.',
      '',
      remaining
        ? '📚 UP NEXT (pending sessions)\n' + remaining
        : '🎉 All sessions complete! Time to add your next plan.',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      streak >= 5
        ? '🔥 You\'re on a ' + streak + '-day streak. Don\'t break it this week!'
        : streak >= 1
          ? '💪 Keep the streak alive — show up every day, even for 30 minutes.'
          : '⚡ Start a new streak this week. One session is all it takes.',
      '',
      '"We are what we repeatedly do. Excellence, then, is not an act, but a habit."',
      '— Aristotle',
      '',
      '🌐 Open your tracker: https://sathiyaseelanK.github.io/learning-tracker/',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'This email is sent every Friday at 6 PM by your personal Apps Script.',
      'To stop: Apps Script editor → Triggers → delete the sendWeeklyDigest trigger.',
    ].join('\n');

    GmailApp.sendEmail(CONFIG.DIGEST_EMAIL, subject, body);
    Logger.log('Weekly digest sent to ' + CONFIG.DIGEST_EMAIL);

  } catch (err) {
    logError('sendWeeklyDigest', err);
  }
}

// ── DATA BACKUP ───────────────────────────────────────────────────────────────
//
// Runs every Sunday midnight and copies the Progress sheet to a backup sheet
// named "Backup_YYYY-MM-DD". Keeps the last 8 backups.
//
// TO ENABLE:
//   Triggers → Add trigger → backupData → Time-driven → Week timer → Sunday midnight

function backupData() {
  try {
    const ss          = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const source      = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!source) { Logger.log('No Progress sheet to back up.'); return; }

    const today       = new Date().toISOString().slice(0, 10);
    const backupName  = 'Backup_' + today;

    // Don't duplicate if already backed up today
    if (ss.getSheetByName(backupName)) {
      Logger.log('Backup already exists: ' + backupName);
      return;
    }

    source.copyTo(ss).setName(backupName);
    Logger.log('Backup created: ' + backupName);

    // Prune old backups — keep only the 8 most recent
    const allSheets   = ss.getSheets();
    const backups     = allSheets
      .filter(s => s.getName().startsWith('Backup_'))
      .sort((a, b) => b.getName().localeCompare(a.getName())); // newest first

    backups.slice(8).forEach(old => {
      Logger.log('Deleting old backup: ' + old.getName());
      ss.deleteSheet(old);
    });

  } catch (err) {
    logError('backupData', err);
  }
}

// ── MONTHLY REPORT EMAIL ──────────────────────────────────────────────────────
//
// TO ENABLE:
//   Triggers → Add trigger → sendMonthlyReport → Time-driven → Month timer → 1st of month

function sendMonthlyReport() {
  try {
    const sheet   = getSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const rows    = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    const now     = new Date();
    const prev    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const mStart  = new Date(prev.getFullYear(), prev.getMonth(), 1);
    const mEnd    = new Date(prev.getFullYear(), prev.getMonth() + 1, 0, 23, 59, 59);
    const mName   = prev.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    let completed = 0, skipped = 0, withNotes = 0;
    const weekMap = {};

    rows.forEach(row => {
      const mid       = String(row[0] || '').trim();
      const status    = String(row[1] || '').trim();
      const note      = String(row[2] || '').trim();
      const updatedAt = row[3] ? new Date(row[3]) : null;
      if (!mid || mid.startsWith('meta:') || !updatedAt) return;
      if (updatedAt < mStart || updatedAt > mEnd)        return;

      if (status === 'completed') {
        completed++;
        if (note) withNotes++;
        const wk = 'W' + Math.ceil(updatedAt.getDate() / 7);
        weekMap[wk] = (weekMap[wk] || 0) + 1;
      }
      if (status === 'skipped') skipped++;
    });

    const weekBreakdown = Object.entries(weekMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([wk, n]) => '  ' + wk + ': ' + n + ' session' + (n !== 1 ? 's' : ''))
      .join('\n') || '  No sessions this month.';

    const subject = '📈 Monthly Report — ' + mName;
    const body = [
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '🌱 Daily Learning Habit Tracker',
      'Monthly Report — ' + mName,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      '📊 SUMMARY',
      '  ✅ Sessions completed : ' + completed,
      '  ↷  Sessions skipped   : ' + skipped,
      '  📝 Sessions with notes: ' + withNotes,
      '',
      '📅 WEEKLY BREAKDOWN',
      weekBreakdown,
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '🌐 https://sathiyaseelanK.github.io/learning-tracker/',
    ].join('\n');

    GmailApp.sendEmail(CONFIG.DIGEST_EMAIL, subject, body);
    Logger.log('Monthly report sent for ' + mName);

  } catch (err) {
    logError('sendMonthlyReport', err);
  }
}

// ── DATA EXPORT (manual use) ──────────────────────────────────────────────────
//
// Run this manually from the Apps Script editor to get a full JSON export
// of all your data — useful before making big changes or migrating.
//
// Run: Editor → Select 'exportAllData' from the function dropdown → Run

function exportAllData() {
  const sheet   = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) { Logger.log('No data.'); return; }

  const rows = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  const data = rows
    .filter(r => String(r[0]).trim())
    .map(r => ({
      moduleId        : r[0],
      status          : r[1],
      note            : r[2],
      updatedAt       : r[3],
      email           : r[4],
      clientUpdatedAt : r[5],
    }));

  Logger.log('=== FULL DATA EXPORT ===');
  Logger.log(JSON.stringify(data, null, 2));
  Logger.log('Total rows: ' + data.length);

  // Also write to a new sheet for easy viewing
  const ss        = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const exportTs  = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
  const expSheet  = ss.insertSheet('Export_' + exportTs);
  expSheet.appendRow(['moduleId', 'status', 'note', 'updatedAt', 'email', 'clientUpdatedAt']);
  data.forEach(row => expSheet.appendRow([row.moduleId, row.status, row.note, row.updatedAt, row.email, row.clientUpdatedAt]));
  Logger.log('Export written to sheet: Export_' + exportTs);
}

// ── RESET DATA (DANGER — manual use only) ────────────────────────────────────
//
// Clears ALL progress rows from the Progress sheet.
// Only run this if you want to start completely fresh.
// The header row is preserved.
//
// SAFETY: this function will NOT run from a trigger — must be run manually.

function resetAllData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚠️ DANGER: Reset all data?',
    'This will permanently delete ALL progress rows. This cannot be undone.\n\nAre you absolutely sure?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    Logger.log('Reset cancelled.');
    return;
  }

  const sheet   = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
    Logger.log('All data rows deleted. Header preserved.');
  } else {
    Logger.log('Sheet already empty.');
  }
}

// ── ERROR LOGGING ─────────────────────────────────────────────────────────────

function logError(context, err) {
  const msg = '[ERROR] ' + context + ': ' + err.message + '\n' + (err.stack || '');
  Logger.log(msg);
  console.error(msg);
}

// ── SELF-TEST (run manually to verify the script is working) ─────────────────
//
// Run: Editor → Select 'selfTest' → Run → View → Logs

function selfTest() {
  Logger.log('=== SELF TEST START ===');

  // 1. Token check
  Logger.log('Token valid: ' + isValidToken(CONFIG.SECRET_TOKEN));
  Logger.log('Bad token rejected: ' + !isValidToken('wrong-token'));

  // 2. Sheet access
  const sheet = getSheet();
  ensureHeaders(sheet);
  Logger.log('Sheet name: ' + sheet.getName());
  Logger.log('Sheet rows: ' + sheet.getLastRow());

  // 3. Write a test row
  const testId = 'selftest:' + Date.now();
  const saveResult = handleSave({
    token           : CONFIG.SECRET_TOKEN,
    moduleId        : testId,
    status          : 'completed',
    note            : 'Self-test note',
    clientUpdatedAt : new Date().toISOString(),
  });
  const saveJson = JSON.parse(saveResult.getContent());
  Logger.log('Save result: ' + JSON.stringify(saveJson));

  // 4. Read it back
  const getResult = handleGet({ token: CONFIG.SECRET_TOKEN });
  const getData   = JSON.parse(getResult.getContent());
  const found     = getData.data.find(r => r.moduleId === testId);
  Logger.log('Read back: ' + (found ? '✅ FOUND' : '❌ NOT FOUND'));

  // 5. Delete test row
  const delResult = handleDelete({ token: CONFIG.SECRET_TOKEN, moduleId: testId });
  const delJson   = JSON.parse(delResult.getContent());
  Logger.log('Delete result: ' + JSON.stringify(delJson));

  // 6. Confirm deleted
  const getResult2 = handleGet({ token: CONFIG.SECRET_TOKEN });
  const getData2   = JSON.parse(getResult2.getContent());
  const stillThere = getData2.data.find(r => r.moduleId === testId);
  Logger.log('Confirmed deleted: ' + (stillThere ? '❌ STILL THERE' : '✅ GONE'));

  Logger.log('=== SELF TEST COMPLETE ===');
}
