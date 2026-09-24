# 🌱 Daily Learning Habit Tracker

> **Built for Sathiyaseelan K** — A personal learning system that turns daily study into an unstoppable habit. Track GCP sessions, read books, build life habits, earn XP, and never break the streak.

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-3d7fff?style=flat-square)](https://sathiyaseelanK.github.io/learning-tracker/)
[![Offline First](https://img.shields.io/badge/Offline-First-1fcc6e?style=flat-square)](#)
[![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-f5a623?style=flat-square)](#)
[![Google Sheets Sync](https://img.shields.io/badge/Sync-Google%20Sheets-34a853?style=flat-square)](#)

---

## 📋 Table of Contents

- [Live Demo](#-live-demo)
- [Repository Structure](#-repository-structure)
- [Quick Start](#-quick-start)
- [Features Overview](#-features-overview)
- [Learning Plans](#-learning-plans)
- [Habit Tracker](#-habit-tracker)
- [Books & Reading](#-books--reading)
- [Gamification](#-gamification--xp-system)
- [Productivity Tools](#-productivity-tools)
- [Sync & Data](#-sync--data)
- [PWA — Install as App](#-pwa--install-as-native-app)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Tech Stack](#-tech-stack)
- [Configuration](#-configuration)
- [Changelog](#-changelog)

---

## 🌐 Live Demo

| Page | URL |
|------|-----|
| Main Tracker | `https://sathiyaseelanK.github.io/learning-tracker/` |
| Habit Tracker | `https://sathiyaseelanK.github.io/learning-tracker/habits.html` |
| Documentation | `https://sathiyaseelanK.github.io/learning-tracker/docs.html` |

---

## 📁 Repository Structure

```
learning-tracker/
│
├── index.html          ← Main app (Today, Plans, Books, Quotes, Dashboard)
├── habits.html         ← Dedicated habit tracker (standalone page)
├── docs.html           ← Full in-app documentation
│
├── sw.js               ← Service worker (offline support + caching)
├── manifest.json       ← PWA manifest (installable as native app)
├── icon-192.png        ← App icon 192×192 (Android, PWA)
├── icon-512.png        ← App icon 512×512 (splash screen)
├── icon-maskable.png   ← Maskable icon (Android adaptive icons)
│
└── README.md           ← This file
```

> **Why two HTML files?** `index.html` is focused on learning (sessions, books, quotes). `habits.html` is focused on daily life habits (exercise, sleep, water). Keeping them separate means faster load times and clearer purpose. Both sync to the same Google Sheet automatically.

---

## ⚡ Quick Start

### Option 1 — Use on any browser (recommended)
1. Go to `https://sathiyaseelanK.github.io/learning-tracker/`
2. Enter your email: `sathiya14ooty@gmail.com`
3. Enter your token: `GCPSathiya@Tracker26`
4. Done — your progress loads from Google Sheets automatically

### Option 2 — Install as native app (iPhone)
1. Open the URL above in **Safari**
2. Tap the **Share** button → **Add to Home Screen**
3. It opens full-screen like a native app, works offline

### Option 3 — Install as native app (Android / Chrome)
1. Open the URL in **Chrome**
2. Tap the **⋮ menu** → **Add to Home Screen** (or look for the install prompt)
3. The app installs with its own icon and splash screen

### Option 4 — Run locally
```bash
# Just open the file — no server needed
open index.html   # macOS
start index.html  # Windows
```

---

## 🎯 Features Overview

### 📅 Today Tab — Your Daily Home Screen
Opens every morning and shows everything needed for the day in one place:

| Section | What it shows |
|---------|---------------|
| Day summary bar | Streak 🔥, sessions done, remaining, freeze tokens 🧊 |
| Week grid | Mon–Sun dots — green (done), yellow (skipped), grey (missed) |
| Habits card | Emoji grid of today's habits — tap any icon to instantly mark done |
| Learning session | Today's GCP/Azure/etc session with Done/Skip/Open buttons |
| Reading card | Current book + progress toward 60-min daily reading goal |
| Smart insights | AI-driven coaching — streak warnings, pattern detection, nudges |
| Quote strip | Fresh motivational quote from Quotable.io API |
| Tools row | Pomodoro, Timer, Journal, Freeze, Focus Mode, Shortcuts |

### 📊 Dashboard Tab
- 🔥 Streak hero with flame animation and best-streak tracking
- ⭐ XP level bar with progress to next level
- 📈 52-week activity heatmap (GitHub-style)
- 📚 Progress bar per learning plan
- 🏆 Achievements grid with progress bars for locked ones

### 🎓 Plans Tab
- Full GCP learning plan — 22 sessions with step-by-step guidance, direct links, Node.js code
- 6 additional plans queued: Azure, AWS, GitHub Copilot, Sitecore, NestJS, React
- 🛠️ Custom plan builder — create any plan with your own sessions
- 🔍 Search bar to find any session by keyword
- 🔖 Bookmark specific guidance steps for quick reference
- 📊 Monthly report, roadmap view

### 📖 Books Tab
- Library with Want / Reading / Finished status
- ▶ Reading timer (counts up toward 60-min goal)
- Reading log with pages + notes per session
- Finish-date prediction based on your reading pace
- ⭐ Ratings and reviews for finished books

### 💭 Quotes Tab
- **Today** — daily live quote from Quotable.io with shuffle
- **Browse** — fetch 10 fresh quotes by category (Learning, Consistency, Tech, Growth, Career)
- **Saved** — your personal quote collection, exportable as PDF

---

## 🎓 Learning Plans

| Plan | Sessions | Status | Starts |
|------|----------|--------|--------|
| ☁️ Google Cloud (GCP) | 22 | **Full content** with step-by-step guidance | 25 Sep 2026 |
| 🔷 Microsoft Azure | 18 | Placeholder — add after GCP completes | After GCP |
| 🟠 Amazon AWS | 20 | Placeholder | After Azure |
| 🤖 GitHub Copilot & AI | 10 | Placeholder | Queued |
| 🌐 Sitecore CMS | 15 | Placeholder | Queued |
| 🐈 NestJS | 12 | Placeholder | Queued |
| ⚛️ React JS | 14 | Placeholder | Queued |
| 🛠️ Custom | You define | Build your own | Anytime |

### Scheduling logic
- Sessions run **Mon–Fri only** (weekdays), starting 25 Sep 2026
- Skip a session → it moves to the end of the plan, nothing is lost
- Complete multiple in one day → future sessions pull forward automatically
- Miss a day → sessions reschedule to today without breaking history

### GCP Plan — 22 sessions across 5 weeks
```
Week 1: Cloud overview, console tour, core services
Week 2: IAM, VPC, Cloud Functions, Secret Manager
Week 3: BigQuery, Pub/Sub, Firestore, Cloud Scheduler
Week 4: 4× official Skills Boost labs + mini pipeline project
Week 5: Real project codebase walkthrough + gap filling + certificate
```
Each session includes:
- 📋 Topics to cover in 2 hours
- 💡 Focus tip
- 📖 Step-by-step guide with direct documentation links
- 🔗 Node.js code samples
- 🔖 Bookmarkable steps

---

## ✅ Habit Tracker

Lives at `habits.html` — a completely separate page so it doesn't clutter the learning view.

### Creating habits
- **Quick presets** (⚡ one tap): Morning Walk, Meditation, Drink Water, Exercise, No Social Media, Sleep by 10 PM, Gratitude Journal, No Junk Food, Call Family, Save Money
- **Custom habits**: name, icon, color, category, frequency, daily goal + unit

### Frequency options
| Option | When it appears |
|--------|----------------|
| Every day | All 7 days |
| Mon–Fri | Weekdays only |
| Weekends | Sat + Sun only |
| Custom | Pick exact days |

### Habit detail page
- 🔥 Current streak and 7/30-day completion rates
- 13-week activity heatmap
- Full log with notes history
- Edit, archive, or delete

### Habit summary on Today tab
A compact emoji grid appears on the main Today tab — tap any emoji to instantly mark that habit done without leaving the learning view.

---

## 📖 Books & Reading

### Daily reading habit
- Goal: **1 hour per day**
- Reading card appears on Today tab showing current book + progress bar
- Timer turns yellow at 30 min, green at 60 min 🎉

### Reading timer
1. Tap **▶ Start Reading** on Today card or in book detail
2. Read for 60 minutes
3. Stop timer → modal asks for pages read + note
4. Session logs automatically

### Book finish prediction
Based on your average pages per session and pages remaining, the detail page shows an estimated finish date. Example: *"At 24 pages/session you'll finish in 8 sessions — around Oct 4"*

### Manual logging
If you read on Kindle or paper without the app: tap **✍️ Log manually** and enter minutes + pages.

---

## ⭐ Gamification — XP System

### Earning XP
| Action | XP |
|--------|----|
| Complete a learning session | +100 |
| Maintain streak (per day) | +25 |
| Write notes on a session | +20 |
| Complete a Pomodoro | +15 |
| Unlock an achievement | +250 |
| Complete daily challenge | +50–150 |

### 10 Levels
| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | 🌱 Cloud Rookie | 0 |
| 2 | 🔭 GCP Explorer | 500 |
| 3 | ⚙️ Cloud Apprentice | 1,200 |
| 4 | ⚡ Function Builder | 2,500 |
| 5 | 📊 Data Engineer | 4,000 |
| 6 | ☁️ Cloud Developer | 6,000 |
| 7 | 🔷 Multi-Cloud Pro | 9,000 |
| 8 | 🏗️ Cloud Architect | 13,000 |
| 9 | 🎯 Tech Lead | 18,000 |
| 10 | 🏆 Full Stack Legend | 25,000 |

### Achievements (34 total)

**Learning**
👶 First Step · 🔥 3-Day Streak · 📅 First Week · ⚡ Week Warrior · 🎯 Halfway · 🚀 Speed Runner · 🏅 Fortnight · 💯 Century Club · 💯 Perfect Week · ☁️ GCP Complete · 🔷 Azure Ready · 🟠 AWS Certified · 🎓 Multi-Cloud · 🌟 Full Stack Hero

**Writing & Focus**
📝 Note Taker · 🍅 Pomodoro Master

**Books**
📖 First Book · ⏰ 1 Hour Reader · 🏅 Page Turner · 📚 Bookworm · 📅 Reading Streak

**Habits**
✅ Habit Starter · 🌟 Habit Builder · 📅 Habit Week · 🏆 Habit Month · 💎 Perfect Day · 💯 100 Done

---

## 🛠️ Productivity Tools

### 🍅 Pomodoro Timer
Classic focus/break cycle with XP rewards:
- **Focus**: 25 minutes of deep work
- **Short break**: 5 minutes
- **Long break**: 15 minutes (after every 4 Pomodoros)

### ⏱️ Session Timer
2-hour countdown for your 3–4 PM daily study slot:
- Green → Yellow (30 min left) → Red (10 min left)

### 🎯 Focus Mode
Press `F` to hide all UI chrome — only your session content remains. Exits with `F` or the Exit button.

### 🧊 Streak Freeze
Earn 1 freeze token per 5 completed sessions. Use on a day you can't study to protect your streak. Tap 🧊 in the Today tools row.

### 🔁 Spaced Repetition
After completing any session, reviews are automatically scheduled at **day +3, +7, and +30**. Due reviews appear as a notification on login and via the Reviews shortcut. This is the most evidence-backed way to actually retain what you study.

### 💡 Smart Insights
Appears on the Today tab automatically — analyses your patterns and shows actionable coaching:
- ⚠️ Streak at risk (it's past 3 PM and nothing marked today)
- 📈 Best/worst day of week for completing sessions
- ⏱️ Average session duration vs your 2-hour target
- 📝 Notes rate nudge (low note-writing = lower retention)
- 📖 Reading consistency gaps

### 🔍 Command Palette
Press `Ctrl+K` (Mac: `⌘K`) anywhere in the app to open a fast search over:
- All sessions (by title, topic, or course name)
- Session notes content
- Books (by title or author)
- Quick actions (Pomodoro, Journal, Reviews, etc.)

### 📔 Daily Reflection Journal
Press `J` or tap 📔 in Today tools. Three prompts:
1. What did you learn today?
2. What was challenging?
3. Tomorrow's focus

Plus a mood selector (😴 → 🚀). Builds a searchable learning diary over time.

---

## 🔄 Sync & Data

### Architecture
```
Browser (localStorage + sessionStorage)
        ↕  HTTPS POST/GET
Google Apps Script (deployed web app)
        ↕  Sheets API
Google Sheets (your private spreadsheet)
```

### Sync engine
The sync engine uses a **persistent offline write queue** — if you mark a session done with no internet, it queues the write to localStorage and automatically retries with backoff when you reconnect. You never lose a data point.

| Feature | Detail |
|---------|--------|
| Offline queue | Survives page refresh, retries on reconnect |
| Retry backoff | 600ms, 1200ms, then error |
| Conflict resolution | Server wins if its `updatedAt` is newer than local |
| Background sync | Re-fetches from Sheets every 90s — two devices stay in sync |
| Optimistic UI | Local state updates immediately; network write happens in background |

### Sync status indicator (top-right dot)
| Colour | Meaning |
|--------|---------|
| 🟢 Green | All changes saved |
| 🟡 Yellow (pulsing) | Saving in progress |
| 🔴 Red | Sync failed (shows pending count if any) |

### Data stored where
| Data | Primary store | Backup |
|------|--------------|--------|
| Session progress | Google Sheets | localStorage |
| Session notes | Google Sheets | localStorage |
| Books library + log | localStorage | Google Sheets (meta) |
| Habits + logs | localStorage | Google Sheets (meta) |
| Saved quotes | localStorage | — |
| Journal entries | localStorage | — |
| Bookmarks | localStorage | — |
| Spaced repetition schedule | localStorage | — |
| Theme, preferences | localStorage | — |
| Login token | sessionStorage (tab only) | — |

### Your Google Sheet
- **URL**: https://docs.google.com/spreadsheets/d/1lA6tH0HK8G185UP2Dn4MmQaJCOLXVI4rF4qPOPTfRQE
- **Columns**: `moduleId` | `status` | `note` | `updatedAt` | `email`
- **Session keys**: `gcp:1`, `gcp:2`, … `azure:1`, etc.
- **Meta keys**: `meta:books`, `meta:habits`, `meta:enabledPlans`, `meta:activePlan`

### Data versioning
```javascript
const DATA_VERSION = 2;
// migrations[n] runs once to upgrade data from version n to n+1
```
Version is stamped in localStorage. Future data shape changes run migrations automatically — no manual intervention needed.

---

## 📱 PWA — Install as Native App

The tracker is a full **Progressive Web App** — installable on any device with a proper icon, splash screen, and offline support.

### What the service worker does
- **Caches** `index.html`, `habits.html`, `docs.html`, `manifest.json`, and icons on first load
- **Serves from cache** when offline — the app loads even with no internet
- **API calls** (Google Sheets, Quotable.io) always go to network — never cached
- **Auto-updates** — detects new versions and shows a "refresh for latest" toast

### iPhone installation
1. Open `https://sathiyaseelanK.github.io/learning-tracker/` in **Safari** (not Chrome)
2. Tap the **Share icon** (square with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **"Add"** — the app appears on your home screen with the green icon
5. Opens full-screen, no browser bar

### Android installation
1. Open in **Chrome**
2. Tap **⋮ menu** → **"Add to Home Screen"** or accept the install banner
3. App installs with adaptive icon (uses `icon-maskable.png`)

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl/⌘ + K` | Open command palette |
| `1` | Switch to Today tab |
| `2` | Switch to Dashboard tab |
| `3` | Switch to Habits tab |
| `4` | Switch to Plans tab |
| `5` | Switch to Books tab |
| `P` | Start Pomodoro (25 min) |
| `T` | Start 2-hour session timer |
| `F` | Toggle Focus Mode |
| `J` | Open Daily Journal |
| `B` | Open Bookmarks |
| `R` | Open Monthly Report |
| `?` | Show all shortcuts |
| `Esc` | Close any modal |

Shortcuts are disabled when typing in any input or textarea.

---

## 🔧 Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | Vanilla HTML/CSS/JS | Zero build step, zero dependencies, works anywhere |
| Backend | Google Apps Script | Free, private, auto-scalable, no server to manage |
| Database | Google Sheets | Your own data, always readable, spreadsheet-viewable |
| Quotes API | Quotable.io + ZenQuotes | Free, no API key, 1500+ curated quotes |
| Offline | Service Worker + Cache API | PWA-standard offline caching |
| Storage | localStorage + sessionStorage | Instant local reads, session-scoped auth |
| Icons | Python Pillow (generated) | Custom branded icons matching the dark theme |

### Why single-file HTML?
- No npm install, no webpack, no CI/CD pipeline
- Deploy by dragging one file into GitHub — done in 30 seconds
- Works on any computer, any browser, any OS
- 247KB total (half is GCP session data) — loads in under 1 second on WiFi

---

## ⚙️ Configuration

All config is at the top of `index.html` (and mirrored in `habits.html`):

```javascript
const WEBAPP_URL = 'https://script.google.com/macros/s/...your-script-id.../exec';
const ALLOWED_EMAIL = 'sathiya14ooty@gmail.com';
const SESSION_KEY = 'lt_habit_v1';        // localStorage namespace
const DATA_VERSION = 2;                    // bump when data shape changes
```

### Apps Script (backend)
The deployed Apps Script web app handles three actions:
- `GET ?action=get&token=...` → returns all rows for this user
- `POST {action:'save', moduleId, status, note}` → upserts a row
- `POST {action:'delete', moduleId}` → removes a row

Token validation happens server-side — the token must match `SECRET_TOKEN` in the Apps Script and the email must match `ALLOWED_EMAIL`.

### Adding a new learning plan
1. Open `index.html`
2. Add an entry to `PLAN_REGISTRY`:
```javascript
myplan: {
  id: 'myplan',
  name: 'My Custom Plan',
  icon: '🐳',
  color: '#0db7ed',
  desc: 'What this plan covers',
  sessions: placeholder('myplan', 'My Custom Plan', 10) // or write full sessions
}
```
3. Or use the **🛠️ Custom Plan** builder inside the app — no code needed.

---

## 📊 Exports & Reports

| Export | How to access | Format |
|--------|--------------|--------|
| Weekly summary | Today tab → 📊 Summary | Copy to clipboard |
| Monthly report | Plans tab → 📊 Monthly | Copy to clipboard |
| Progress PDF | Plans tab → Print-ready HTML | Browser print dialog |
| Notes PDF | Plans tab → 📝 Notes → Export | Browser print dialog |
| Saved quotes PDF | Quotes tab → ❤️ Saved → Export | Browser print dialog |

---

## 📝 Changelog

### v3.0 — Sep 2026 (current)
**Architecture fixes**
- Fixed critical JS hoisting bug affecting 10 functions — eliminated all `_orig` wrapper chains that caused infinite recursion
- Merged all function patches into single, clean definitions
- Added data versioning with migration scaffolding

**New features**
- 📱 PWA — installable on iPhone/Android, works offline with service worker
- 🔄 Sync engine — offline queue, retry-with-backoff, conflict resolution, background sync
- 💡 Smart insights — streak warnings, day-of-week pattern detection, duration coaching
- 🔁 Spaced repetition — auto-schedules reviews at day +3, +7, +30
- 🔍 Command palette — `Ctrl+K` search across sessions, notes, books
- ⏱️ Session time tracking — records actual minutes spent per session
- 📅 Book finish prediction — estimates finish date from reading pace
- 📳 Haptic feedback — vibration on completions (Android/iOS)
- 🎓 First-time onboarding — welcome walkthrough on first login
- 📦 Quote pre-cache — bulk-fetches 60 quotes on login for instant Browse tab
- ♿ Accessibility — aria-live region, aria-labels, role attributes

### v2.0 — Aug 2026
- 📖 Books tracker — library, reading timer, log, ratings, reviews
- 🍅 Pomodoro timer — 25/5/15 phases with XP rewards
- 📱 Mobile-first rebuild — bottom nav, swipe gestures, full responsive layout
- ✅ Habits tracker — standalone habits.html with full CRUD, presets, heatmaps
- ⭐ XP & Levels — 10-level progression system
- 🏆 Achievements — 34 achievements across learning, books, habits
- 📔 Daily reflection journal — prompts, mood, history
- 🧊 Streak freeze — earn tokens, protect streak on busy days
- ⭐ Session rating — 1–5 stars + difficulty after completion
- 🎯 Focus mode — distraction-free session view
- 🛠️ Custom plan builder — create any learning plan in-app
- 🔖 Bookmarks — save specific guide steps
- 🗺️ Learning roadmap — visual timeline of all 7 plans
- 💭 Live quotes — Quotable.io API, category filter, save collection
- 📊 Monthly & weekly reports
- ⌨️ Keyboard shortcuts
- 📚 In-app documentation (docs.html)

### v1.0 — Jul 2026
- Initial release: GCP learning plan (22 sessions with full guidance)
- Google Sheets sync via Apps Script
- Session scheduling with skip/complete/undo
- Streak tracking and achievements

---

## 🙏 Credits

Built with:
- [Quotable.io](https://quotable.io) — Open source quote API
- [Google Apps Script](https://script.google.com) — Serverless backend
- [Google Sheets API](https://sheets.google.com) — Database
- [Inter Font](https://rsms.me/inter/) — Typography (system fallback)

---

## 📄 License

Personal use only. Built specifically for Sathiyaseelan K's learning journey at Accenture.

---

*"We are what we repeatedly do. Excellence, then, is not an act, but a habit." — Aristotle*
