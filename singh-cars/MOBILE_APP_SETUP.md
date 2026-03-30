# Singh Car Bazar Mobile App Setup

This project now supports:

- iPhone Safari "Add to Home Screen"
- Android installable PWA
- future Capacitor Android and iOS app packaging

## 1. Required environment

Set these in local development and Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL=https://singhcarbazar.com`

Optional for native wrappers:

- `CAPACITOR_SERVER_URL=https://singhcarbazar.com`

## 2. Test the mobile web app locally

Run:

```bash
npm run dev
```

Open the app on a phone using your local network URL or a tunnel. Test:

- bottom navigation
- new file flow
- document uploads
- file search
- WhatsApp share buttons

## 3. Test on iPhone

1. Open the deployed site in Safari.
2. Go to `/admin/login` or `/admin`.
3. Sign in.
4. Use Safari Share menu.
5. Tap `Add to Home Screen`.
6. Launch the icon from the home screen.

What to verify:

- app opens full-screen / standalone
- bottom nav stays visible
- file uploads work in Safari
- WhatsApp share opens correctly

## 4. Test on Android

1. Open the deployed site in Chrome.
2. Visit `/admin/login` or `/admin`.
3. Sign in.
4. Use Chrome install prompt or the in-app install button.
5. Open the app from the home screen / app drawer.

What to verify:

- standalone display
- fast launch
- uploads from gallery/camera
- WhatsApp share button

## 5. Capacitor Android wrapper

Install dependencies:

```bash
npm install
```

Sync Capacitor:

```bash
npm run cap:sync
```

Open Android project:

```bash
npm run cap:open:android
```

In Android Studio:

1. Wait for Gradle sync.
2. Select an emulator or connected phone.
3. Run the app.

To generate an APK:

1. In Android Studio open `Build`.
2. Choose `Build Bundle(s) / APK(s)`.
3. Choose `Build APK(s)` for testing.
4. For Play Store later, use `Generate Signed Bundle / APK`.

## 6. Future iPhone / TestFlight prep

This project is prepared for a future Capacitor iOS wrapper.

To add iOS later:

1. Install CocoaPods first:

```bash
brew install cocoapods
```

2. Then run:

```bash
npm run cap:sync
npx cap add ios
npm run cap:open:ios
```

3. Then in Xcode:

1. Set team and signing.
2. Set bundle identifier.
3. Run on simulator or device.
4. Archive the build.
5. Upload to App Store Connect / TestFlight.

## 7. Notes about the current setup

- The native wrapper is configured to load the live site URL.
- This keeps the current Next.js + Supabase backend unchanged.
- The dealer workflow stays the same across web, PWA, Android, and future iOS builds.
