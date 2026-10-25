# ⚔️ QuestLearn — Gamified Learning Management System

A fully client-side gamified LMS built with **HTML, CSS and vanilla JavaScript** — no frameworks, no build step, no backend. Progress is saved in your browser's `localStorage`.

## ▶️ How to run in VS Code

**Option 1 — Live Server (recommended)**
1. Unzip and open the `questlearn-lms` folder in VS Code (`File → Open Folder`).
2. Install the **Live Server** extension (VS Code will suggest it automatically).
3. Right-click `index.html` → **Open with Live Server**.

**Option 2 — npm**
```bash
npm start        # runs: npx serve .   then open http://localhost:3000
```

**Option 3 — Just double-click `index.html`.** It works straight from the file system too.

## ✨ Features

| Area | What it does |
|---|---|
| 🎮 Onboarding | Pick a hero name & avatar; starter rewards |
| 🏠 Dashboard | Animated level ring, XP stats with count-up, weekly activity chart, quest preview, course progress, recent badges |
| 📚 Courses | 4 courses × 3 lessons (Web Dev, JavaScript, Python, Cyber Security) with 3D-tilt cards |
| 🗺️ Course map | Unlockable lesson timeline, star ratings, final trophy node |
| 📖 Lessons | Rich content with code samples & tips |
| ⚔️ Challenges | 20-second timed questions, **combo multiplier (up to ×2.5)**, speed bonus, 50/50 hints, 2× XP boost, keyboard shortcuts (1–4, Enter), confetti & floating XP |
| ⭐ Results | 1–3 stars, pass at 60% to unlock the next lesson; replays give half XP |
| 📈 Levels | Quadratic XP curve, level titles (Novice → Legend), level-up celebration with coin bonus |
| 🔥 Streaks | Daily streak, 7-day calendar, Streak Freeze protection |
| 🎯 Daily quests | 5 quests resetting at midnight with live countdown & claimable rewards |
| 🏆 Achievements | 16 badges in 4 rarities (common → legendary) with progress tracking |
| 📊 Leaderboard | Animated podium, leagues, "XP to overtake" nudges |
| 🛍️ Reward shop | Avatars, 5 colour themes (re-skin the whole app), power-ups |
| 🎓 Certificates | Printable / save-as-PDF certificate per completed course |
| 👤 Profile | Editable name, accuracy & stats, inventory, reset |
| 🔊 Sound | Web-Audio sound effects (toggle in the top bar) |
| 📱 Responsive | Mobile drawer navigation; respects reduced-motion settings |

## 📁 Structure
```
questlearn-lms/
├── index.html        App shell
├── css/styles.css    All styling & animations
└── js/
    ├── data.js       Courses, quizzes, badges, quests, shop items  ← edit content here
    ├── state.js      Game engine (XP, levels, streaks, badges, saves)
    ├── effects.js    Particles, confetti, toasts, tilt, sounds
    └── app.js        Router & all page views
```

## ➕ Adding a course
Open `js/data.js` and add an object to `COURSES` with `id`, `title`, `icon`, `level`, `color`, `description` and `lessons` (each with `content` HTML and a `quiz` array of `{ q, o: [4 options], a: correctIndex, e: explanation }`).

## 🔄 Reset progress
Profile → **Reset**, or clear the site's localStorage.
