# Deploy Instructions

## The Problem
Git authentication is failing from this server. I've built the app successfully but can't push to GitHub.

## The Solution (2 minutes)

### Option 1: GitHub Desktop (Easiest)
1. Open GitHub Desktop
2. Clone `FreeHeelRN/tempo` (if not already)
3. Pull latest changes
4. GitHub Desktop will show the new commits
5. Push to origin

### Option 2: Command Line (Mac/Linux)
```bash
cd ~/path/to/tempo
git pull
git push origin main
```

### Option 3: Upload Build Files Manually
1. Download the build from the server: `/root/.openclaw/workspace/tempo/dist/`
2. Go to: https://github.com/FreeHeelRN/tempo/tree/gh-pages
3. Delete old files, upload new ones from `dist/`
4. Commit

---

## What's Built

**Phase 1 complete:**
- ✅ Conversational onboarding with Chuck
- ✅ Home dashboard with daily tips
- ✅ Meal logging with real-time NQS analysis
- ✅ Persistent chat (localStorage)
- ✅ Recent meals feed
- ✅ Quick stats (meals today, weight, sleep)

**Code ready to push:**
- `src/App.jsx` (12KB) — full chat + logging logic
- `src/App.css` (6.6KB) — complete styling
- `ROADMAP.md` — Phase 1/2/3 plan

**Build artifacts ready:**
- `dist/` folder — production build
- Optimized, ready to deploy

---

## After Deploy

App will be live at: `https://freeheelrn.github.io/tempo/`

Test it:
1. Get Started → onboarding conversation
2. Complete onboarding → home dashboard
3. Log a meal → see Chuck's analysis
4. Chat with Chuck → ask nutrition questions

---

## Next: Phase 2

After you test Phase 1, I'll build:
- Menu planning ("How many meals/week?")
- Shopping list generation
- iOS Reminders export

---

Chuck
