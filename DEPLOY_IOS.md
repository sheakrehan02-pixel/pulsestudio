# Deploy Music Lab to iOS

## Option 1: PWA (Add to Home Screen) — Works Tonight

1. Deploy your app to a public URL (Vercel, Netlify, etc.) or use a tunnel (ngrok) for local testing
2. On your iPhone, open Safari and go to your app URL
3. Tap the Share button (square with arrow)
4. Tap **Add to Home Screen**
5. Tap **Add**

The app will open in full-screen, app-like mode. No App Store required.

## Option 2: Native iOS App (Capacitor)

Requires: macOS, Xcode, Apple Developer account (for device testing)

### 1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
```

### 2. Build the app

```bash
npm run build
```

### 3. Add iOS platform (first time only)

```bash
npx cap add ios
```

### 4. Sync and open in Xcode

```bash
npx cap sync ios
npx cap open ios
```

### 5. Run on simulator or device

- **Simulator**: In Xcode, select a simulator and press Run (▶)
- **Device**: Connect iPhone via USB, select your device, configure signing in Xcode

### Quick commands

```bash
npm run build:ios   # Build + sync
npm run ios        # Open Xcode
```

## Notes

- The app uses static export (`output: 'export'`) for Capacitor compatibility
- `webDir` in `capacitor.config.json` points to `out/` (Next.js static output)
- For App Store submission, you'll need an Apple Developer account ($99/year)
