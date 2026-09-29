# VELO — WHAT YOU ACTUALLY DO
# Plain English. Step by step. No tech jargon.
# This tells YOU what to do. Claude Code does the rest.

---

## THE SIMPLE TRUTH

You do not need to understand the backend prompt.
You do not need to write any code.
You do not need to understand TypeScript, MongoDB, or APIs.

Your job is:
1. Create accounts on websites
2. Copy API keys into a file
3. Open a terminal and type a few commands
4. Review what Claude Code builds
5. Test it on your phone

That is everything. Claude Code writes 95% of the code.
The backend prompt is a letter TO Claude Code, not to you.

---

## BEFORE YOU START — WHAT YOU NEED ON YOUR PERSONAL MACHINE

Install these (one-time, takes 20 minutes):

1. Node.js 20 — download from nodejs.org, click the LTS version, install like any app
2. Git — download from git-scm.com, install like any app
3. VS Code — download from code.visualstudio.com (optional but helps you review code)
4. Claude Code — after installing Node.js, open Terminal and type:
   npm install -g @anthropic-ai/claude-code

5. Check everything works — open Terminal and type these one by one:
   node --version       (should show v20.something)
   git --version        (should show git version 2.something)
   claude --version     (should show claude version)

---

## WEEK 1 — YOUR ONLY JOB THIS WEEK: CREATE ACCOUNTS AND GET API KEYS

No code this week. Just creating accounts and copying keys.
Follow velo-services-setup.md for exact click-by-click instructions.

Open velo-services-setup.md and do each section in order:

### Account 1 — MongoDB Atlas (your database)
Website: cloud.mongodb.com
What you get: a connection string that looks like:
mongodb+srv://velo_user:PASSWORD@cluster0.abc12.mongodb.net/velo_production?retryWrites=true&w=majority
Time: 15 minutes

### Account 2 — Upstash Redis (speed cache)
Website: console.upstash.com
What you get: a URL and a token
Time: 5 minutes

### Account 3 — Anthropic API (Claude AI for the app)
Website: console.anthropic.com
What you get: a key starting with sk-ant-
IMPORTANT: set a $20/month spending limit here — prevents surprise bills
Time: 5 minutes

### Account 4 — Google Gemini (cheaper AI for simple tasks)
Website: aistudio.google.com
What you get: a key starting with AIzaSy
Time: 3 minutes

### Account 5 — Firebase (Android push notifications)
Website: console.firebase.google.com
What you get: a project ID, a long private key, and an email address
Also download: google-services.json (goes in your Android app later)
Time: 15 minutes

### Account 6 — Resend (emails to your users)
Website: resend.com
What you get: a key starting with re_
For now use: onboarding@resend.dev as the from address (no domain needed yet)
Time: 5 minutes

---

## CREATING YOUR .ENV FILE

After all accounts are created, make a file called .env in your velo-backend folder.
This file stores all your secret keys. It NEVER goes to GitHub.

Open any text editor (Notepad, VS Code, TextEdit) and create this file:
Save it as: velo-backend/.env

```
NODE_ENV=development
PORT=3000
API_VERSION=v1
FRONTEND_URL=http://localhost:4200
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000

JWT_ACCESS_SECRET=PASTE_YOUR_GENERATED_SECRET_HERE
JWT_REFRESH_SECRET=PASTE_YOUR_OTHER_GENERATED_SECRET_HERE
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

MONGODB_URI=PASTE_YOUR_ATLAS_CONNECTION_STRING_HERE
MONGODB_DB_NAME=velo_production

UPSTASH_REDIS_REST_URL=PASTE_YOUR_UPSTASH_URL_HERE
UPSTASH_REDIS_REST_TOKEN=PASTE_YOUR_UPSTASH_TOKEN_HERE

ANTHROPIC_API_KEY=PASTE_YOUR_ANTHROPIC_KEY_HERE
GEMINI_API_KEY=PASTE_YOUR_GEMINI_KEY_HERE

FIREBASE_PROJECT_ID=PASTE_YOUR_FIREBASE_PROJECT_ID_HERE
FIREBASE_PRIVATE_KEY="PASTE_YOUR_FIREBASE_PRIVATE_KEY_HERE"
FIREBASE_CLIENT_EMAIL=PASTE_YOUR_FIREBASE_CLIENT_EMAIL_HERE

RESEND_API_KEY=PASTE_YOUR_RESEND_KEY_HERE
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Velo

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10

LOG_LEVEL=debug
LOG_FORMAT=json
```

### Generating the JWT secrets (2 random secret codes)
Open Terminal and run this command TWICE — get two different outputs:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

Copy the first output → paste as JWT_ACCESS_SECRET
Copy the second output → paste as JWT_REFRESH_SECRET
They must be different.

### The Firebase private key — easy to get wrong
When you download the Firebase service account JSON, open it and find "private_key".
It looks like: "-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
Copy the ENTIRE value including the quotes and the \n characters.
In your .env file it must be on ONE line inside double quotes.

---

## WEEK 2 — STARTING CLAUDE CODE FOR THE BACKEND

Once your .env is complete, you start Claude Code.

### Step 1 — Open Terminal in your velo-backend folder

Mac: open Terminal, type: cd path/to/velo-backend
Windows: open Command Prompt, type: cd path\to\velo-backend

### Step 2 — Start Claude Code
Type: claude
Press Enter. Claude Code starts up.

### Step 3 — Paste the backend prompt
Open the file: velo-backend-handoff.md
Select ALL the text (Ctrl+A or Cmd+A)
Copy it (Ctrl+C or Cmd+C)
Click in the Claude Code terminal
Paste it (Ctrl+V or Cmd+V)
Press Enter

Claude Code will now start building your backend. This takes 30-60 minutes.
You can watch it create files. You do not need to do anything while it runs.

### Step 4 — FIRST CHECKPOINT (Claude Code will stop and wait for you)

Claude Code will stop after creating the environment validation file and say
something like: "Environment setup complete. Please confirm all env vars validate."

You need to test it. In a NEW terminal window (keep Claude Code open), type:
cd velo-backend
npm install
npm run dev

You should see:
✅ MongoDB connected
✅ Upstash Redis connected  
✅ Server running on port 3000

If you see errors, they will say which key is wrong. Fix the .env file and try again.

Once it works, go back to Claude Code and type: "All env vars validate. Continue."

### Step 5 — SECOND CHECKPOINT (Claude Code stops again after auth is built)

Claude Code will stop after building the login/register system and say something
like: "Auth module complete. Please test register and login manually."

Test it. Open a new terminal and type these commands one by one:

Test register:
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123!"}'

You should get back: {"success":true,"data":{"accessToken":"...","refreshToken":"..."}}

Test login:
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

You should get back another pair of tokens.

If both work, go back to Claude Code and type: "Auth works. Continue."

Claude Code will then build all the remaining modules automatically.

---

## WEEK 3 — STARTING CLAUDE CODE FOR THE FRONTEND

After the backend is working, start a SECOND Claude Code session for the frontend.

### Step 1 — Open a new Terminal in your velo-frontend folder
cd path/to/velo-frontend

### Step 2 — Start Claude Code
Type: claude

### Step 3 — Paste the frontend prompt
Open: velo-frontend-handoff.md
Copy ALL the text and paste it into Claude Code
Press Enter

Claude Code will first READ your existing Angular code to understand it.
It will list all the Google Sheets calls it finds.
It will STOP and ask you to confirm the plan before changing anything.

Review what it found and type: "That looks correct. Proceed with migration."

### Step 4 — THIRD CHECKPOINT (after Google Sheets replaced)

Claude Code stops after replacing all Google Sheets calls with new API calls.
Test that your existing app features still work:
- Open the Angular app in your browser
- Log in
- Create a habit
- Check that it saves correctly

If existing features work, type: "Migration confirmed. Build new screens."

Claude Code will then build: onboarding wizard, AI dashboard, companion panel,
upgrade modal, discover page, achievements page.

---

## WEEK 4 — ANDROID SETUP AND GOING LIVE

### What Claude Code does
Capacitor setup (connects Angular app to Android)
Push notification service
CI/CD pipeline (auto-deploys when you push to GitHub)

### What YOU do

1. Create a Google Play Console account
   Go to: play.google.com/console
   Pay: £16 one-time registration fee
   This is mandatory to publish Android apps

2. Install Android Studio on your personal machine
   Download from: developer.android.com/studio
   This lets you run the app on your phone for testing

3. Put google-services.json in the right place
   The file you downloaded from Firebase in Week 1
   Copy it to: velo-frontend/android/app/google-services.json

4. Connect your Android phone and test
   Enable "Developer options" on your Android phone
   Enable "USB debugging"
   Connect phone to laptop with USB cable
   In Terminal, run: cd velo-frontend && npx cap run android

5. Submit to Google Play internal testing
   Claude Code will build the APK file (the Android app file)
   Upload it to Google Play Console
   Set it to "Internal testing" (only you can download it)
   Test it on your real phone via Play Store

### Deploying the backend (what Claude Code sets up, you click deploy)

Render.com (backend hosting):
- Go to render.com, connect your GitHub account
- Click "New Web Service", select your velo-backend repo
- Add all your .env variables in the Render dashboard
- Click Deploy — Render deploys automatically on every push to main

Cloudflare Pages (frontend hosting):
- Go to pages.cloudflare.com, connect your GitHub account
- Click "Create a project", select your velo-frontend repo
- Set build command: npm run build -- --configuration production
- Set output directory: dist/velo-frontend/browser
- Click Deploy

---

## THE DAY OF LAUNCH — 1 NOVEMBER

### Your checklist for launch day

Google Play:
[ ] Change your app from "Internal testing" to "Production" in Play Console
[ ] Write your Play Store listing (title, description, screenshots)
[ ] Privacy policy URL (you need a simple privacy policy page)
[ ] Submit — Google reviews take 2-7 days (submit 28-29 October for 1 Nov launch)

Web app:
[ ] Buy your domain (eg velotracker.app) — ~£10/year from Namecheap or Porkbun
[ ] Point domain to Cloudflare Pages (Cloudflare shows you how — 2 DNS records)
[ ] Test everything works at your new domain

Marketing (do these on launch day):
[ ] Post on r/selfimprovement: "I built an app that tells you why you keep failing at habits"
[ ] Post on X/Twitter: "Week 1 of Velo Life Tracker being live. Here's what I learned."
[ ] Tell friends and family to download and leave a review

---

## IF SOMETHING BREAKS — HOW TO GET HELP

### If Claude Code stops mid-sprint and seems confused
Type: "Summarise what you've built so far and what comes next"
This reorients it. Then type: "Continue from where you left off."

### If the backend won't start (npm run dev shows errors)
The error message will name the problem. Most common:
- "MongoServerError: Authentication failed" → your MongoDB password in .env is wrong
- "UpstashError: Unauthorized" → your Upstash token was cut off when copying
- "Invalid PEM" → your Firebase private key has actual line breaks instead of \n

### If Claude Code uses API billing instead of your subscription
Check: open a terminal and type: echo $ANTHROPIC_API_KEY
If anything prints → type: unset ANTHROPIC_API_KEY
Then restart Claude Code. Now it uses your $20 subscription, not API billing.

### If you're stuck on anything
Open a new Claude chat, paste velo-handover-complete.md as the first message,
then describe exactly what is happening and what you see on your screen.

---

## SUMMARY — WHAT YOU DO EACH WEEK

WEEK 1 (now → 5 Oct):
  YOU: Create 6 accounts, get 6 API keys, fill in .env file, test health check

WEEK 2 (6 → 12 Oct):
  CLAUDE CODE: Builds entire backend (you watch, confirm 2 checkpoints, test auth)
  YOUR TIME: ~2 hours total

WEEK 3 (13 → 19 Oct):
  CLAUDE CODE: Builds all feature modules + migrates frontend
  YOUR TIME: ~2 hours (confirm migration, test existing features)

WEEK 4 (20 → 26 Oct):
  CLAUDE CODE: Builds new screens (onboarding, AI dashboard, companion panel)
  YOUR TIME: ~1 hour reviewing

WEEK 5 (27 → 31 Oct):
  CLAUDE CODE: Android + deployment setup
  YOU: Create Play Console account, connect phone, test APK, submit to Play Store
  YOUR TIME: ~4 hours

1 NOVEMBER:
  YOU: Press publish on Play Console, post on Reddit and Twitter
  YOUR TIME: ~2 hours

---

## THE ONE THING TO DO RIGHT NOW

Open velo-services-setup.md
Go to Section 1 — MongoDB Atlas
Create your account
Follow every step

That is all. Start there. Everything else follows from that.
