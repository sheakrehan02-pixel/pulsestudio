# Deploy Music Lab to Vercel

## Quick Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New** → **Project**
4. Import your repository
5. Click **Deploy** (no config needed)

Your app will be live at `https://your-project.vercel.app`

## Download Options for Users

After deployment, users can:

- **Use in browser** – Visit the URL and click "Enter the Lab"
- **Install (PWA)** – Click "Download / Install" → "Install Music Lab" (Chrome/Edge on desktop)
- **Add to Home Screen** – On mobile: Share → Add to Home Screen (works on iOS & Android)
- **Download APK** – Android users can download the APK (see below)

## Adding the Android APK (Optional)

To offer a direct APK download:

1. **Install Android SDK** (Android Studio or command-line tools)

2. **Add Android platform:**
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```

3. **Build the APK:**
   ```bash
   npm run build:android
   ```

4. **Copy APK to public folder:**
   ```bash
   cp android/App/build/outputs/apk/release/app-release-unsigned.apk public/downloads/MusicLab.apk
   ```
   
   Or if signed:
   ```bash
   cp android/App/build/outputs/apk/release/app-release.apk public/downloads/MusicLab.apk
   ```

5. **Rebuild and redeploy:**
   ```bash
   npm run build
   # Push to GitHub – Vercel will auto-deploy
   ```

The APK will be available at `https://your-project.vercel.app/downloads/MusicLab.apk`

## Environment

- **Framework:** Next.js (auto-detected)
- **Build Command:** `next build` (default)
- **Output Directory:** Leave empty (Next.js handles it)
- **Node.js:** 18.x or 20.x (Vercel default)

## Troubleshooting 404

If you see **404: NOT_FOUND** after deploy:

1. **Framework Preset** – In Vercel → Project Settings → General → Framework Preset must be **Next.js**. If it's "Other", change it to Next.js and redeploy.

2. **Output Directory** – In Project Settings → Build & Development Settings, leave **Output Directory** empty. Do not set it to `dist`, `.next`, or anything else.

3. **Redeploy** – Push the latest code (includes `trailingSlash: true` fix) and trigger a new deployment.
