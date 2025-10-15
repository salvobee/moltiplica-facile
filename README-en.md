# Moltiplica Facile

Moltiplica Facile is an educational web app for Italian pupils and families who want to practice long multiplication without losing the playful vibe of a classroom notebook. The grid background, friendly visuals, and animated feedback keep motivation high while the guided logic supports every single step of the procedure.

## ✨ Why you'll love it
- **Interactive guided flow** – Enter two numbers and follow the step-by-step walkthrough with contextual instructions and real-time error checks.
- **Quick challenges with growing difficulty** – Pick a level (easy, medium, hard) and generate random exercises to test yourself in minutes.
- **Clear and motivating stats** – Review completed exercises, total points, averages, and difficulty breakdown, with a gentle nudge to climb the leaderboard.
- **Celebration moments** – Each solved exercise ends with confetti, scores, and encouraging messages to reinforce success.

## 🎮 Practice modes
- **Guided exercises** – Perfect for revising with a digital tutor: restart anytime and unlock progressive hints whenever you need them.
- **Random exercises** – Ideal for self-practice: choose the difficulty and the app prepares a fresh multiplication instantly.

## 📊 Progress tracking & gamification
Performance is saved automatically for both guest users and authenticated students. Dashboards highlight totals, averages, and invite players to log in to sync their progress with the upcoming class leaderboard.

## 🔐 Sign-in & sync
Logging in with Google or Apple syncs any offline practice to the cloud, keeping scores and histories aligned across devices. Prefer to stay a guest? Your data stays in the browser and can be migrated later.

## 🛠️ Tech stack
- **Framework**: React + TypeScript with Wouter routing and TanStack Query for data management.
- **Build**: Vite with Tailwind CSS 4 delivers a modern UI and reusable notebook pattern.
- **Backend-as-a-Service**: Firebase powers authentication, exercise sync, and the upcoming leaderboard.

## 🚀 Run it locally
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Build for production: `npm run build`
4. Type-check the project: `npm run check`

Every script lives in `package.json` and relies on the Vite toolchain.

## 📁 Project structure
- `src/App.tsx` handles layout, routing, and tabbed navigation.
- `src/pages/` groups the main modes (guided, random, stats).
- `src/components/` holds the interactive experience: numeric inputs, hints, celebrations.
- `src/lib/` covers multiplication logic, local storage, and Firebase integration.

## 🤝 Contributing
Issues and pull requests are welcome! Keep the friendly educational tone, build accessible components, and test changes with real students or families whenever possible before proposing major updates.

Have fun multiplying!
