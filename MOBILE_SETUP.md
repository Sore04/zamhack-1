# ZamHack Mobile App Setup (Capacitor + Android)

## Overview

The ZamHack mobile app uses Capacitor on top of the existing Next.js project. It wraps the live site at https://zamhack.vercel.app in a native Android shell. No separate codebase needed — web and mobile share the same repo.

---

## What We Did (Summary)

1. Installed Capacitor packages inside `zamhack-platform`
2. Ran `npx cap init` with app name `zamhack-app` and ID `com.zamhack.app`
3. Updated `capacitor.config.ts` to point to the live Vercel URL
4. Ran `npx cap add android` to generate the `android/` folder
5. Ran `npx cap sync android` then `npx cap open android`

---

## For Anyone Forking This Project

### Prerequisites

| Tool | Link | Notes |
|---|---|---|
| Node.js v18+ | https://nodejs.org | Required to run the project |
| Git | https://git-scm.com | To clone the repo |
| Android Studio | https://developer.android.com/studio | Required for Android builds |
| JDK 17+ | Bundled with Android Studio | No separate install needed |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-org/zamhack.git
cd zamhack/zamhack-platform
```

---

### Step 2 — Install Dependencies

```bash
npm install
```

---

### Step 3 — Set Up Environment Variables

Create a `.env.local` file in `zamhack-platform/` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### Step 4 — Verify Web App Works (Optional)

```bash
npm run dev
```

Visit http://localhost:3000 to confirm it runs.

---

### Step 5 — Set Up Android SDK

1. Open Android Studio
2. Go to File > Settings > Android SDK
3. Install Android 14 (API 34) under SDK Platforms
4. Under SDK Tools, check: Build-Tools, Platform-Tools, Emulator
5. Click Apply and let it download

---

### Step 6 — Sync Capacitor

Always run from the root of `zamhack-platform/`, never from inside `android/`.

```bash
npx cap sync android
```

---

### Step 7 — Open in Android Studio

```bash
npx cap open android
```

---

### Step 8 — Run the App

1. Wait for Gradle sync to finish
2. If prompted "Gradle files changed" click Sync Now
3. Connect a physical device via USB (enable USB Debugging) OR create an emulator via Device Manager
4. Click the green Run button

The app loads https://zamhack.vercel.app inside the native Android shell.

---

## capacitor.config.ts

```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zamhack.app',
  appName: 'ZamHack',
  webDir: 'out',
  server: {
    url: 'https://zamhack.vercel.app',
    cleartext: true
  }
};

export default config;
```

---

## Common Issues and Fixes

| Error | Fix |
|---|---|
| capacitor.settings.gradle does not exist | Run npx cap sync android from project root |
| android platform has not been added yet | Wrong folder — cd back to zamhack-platform/ |
| Cannot launch Android Studio | Set CAPACITOR_ANDROID_STUDIO_PATH env variable pointing to studio64.exe |
| Cannot resolve symbol File | File > Sync Project with Gradle Files in Android Studio |
| SDK not found | File > Project Structure > SDK Location |

---

## Quick Reference Commands

```bash
# Always run from zamhack-platform/

npx cap sync android     # Sync changes to Android
npx cap open android     # Open Android Studio
npm run dev              # Run web app locally
```
