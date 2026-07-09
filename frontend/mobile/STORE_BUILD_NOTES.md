# Mobile Store Build Notes

Last updated: July 7, 2026

Use this file when building or submitting the Altuhealth mobile app to Google Play Store or Apple App Store.

## Project Directories

For Android store builds, run commands from the mobile project root:

```bash
cd /Users/mac/Downloads/DEV/altuhealth/frontend/mobile
```

For iOS, keep using the temporary build directory from the original iOS attempt:

```bash
cd /tmp/altuhealth-mobile-build
```

Because the repository root `.gitignore` excludes most of `frontend/mobile`, use both of these environment variables when running EAS from this repo:

```bash
EAS_NO_VCS=1
EAS_PROJECT_ROOT=/Users/mac/Downloads/DEV/altuhealth/frontend/mobile
```

For iOS in `/tmp/altuhealth-mobile-build`, `EAS_PROJECT_ROOT` is not required because the temp directory is already the Expo project root.

## App Details

```txt
Expo account: mostcharming
Expo project: @mostcharming/altuhealth
EAS project ID: 2ed75f54-e690-401f-b965-a94533650977
App name: Altuhealth
Slug: altuhealth
Version: 1.0.0
Android package: com.mostcharming.altuhealth
iOS bundle ID: com.mostcharming.altuhealth
Production API URL: https://api.altuhealth.com/api/v1
```

## Important Config

Production Android builds are configured as Play Store bundles:

```json
"android": {
  "buildType": "app-bundle"
}
```

Production env values are configured in `eas.json`:

```json
"env": {
  "EXPO_PUBLIC_APP_ENV": "production",
  "EXPO_PUBLIC_API_BASE_URL": "https://api.altuhealth.com/api/v1",
  "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
}
```

`.npmrc` also contains:

```txt
legacy-peer-deps=true
```

## Current Android Store Build

This is the latest Android build started from the real project directory:

```txt
Build ID: 7595e692-e870-44f5-9558-84492ce1ce9c
Platform: Android
Profile: production
Output: .aab app bundle
Version code: 10
Status at last check: IN_QUEUE
Message: Production Android store build from project directory
```

Previous Android build from `/tmp` was cancelled:

```txt
Cancelled build ID: 55a6f1ff-2f7c-4936-87cd-83b6da3186d1
Version code: 9
```

## Check Android Build Status

```bash
cd /Users/mac/Downloads/DEV/altuhealth/frontend/mobile

EAS_NO_VCS=1 \
EAS_PROJECT_ROOT=/Users/mac/Downloads/DEV/altuhealth/frontend/mobile \
npx eas build:view 7595e692-e870-44f5-9558-84492ce1ce9c
```

## Download Android AAB

Run this only after the build status is `FINISHED`:

```bash
cd /Users/mac/Downloads/DEV/altuhealth/frontend/mobile

EAS_NO_VCS=1 \
EAS_PROJECT_ROOT=/Users/mac/Downloads/DEV/altuhealth/frontend/mobile \
npx eas build:download --build-id 7595e692-e870-44f5-9558-84492ce1ce9c
```

## Start A New Android Store Build

Use this when you need a fresh Play Store `.aab` build:

```bash
cd /Users/mac/Downloads/DEV/altuhealth/frontend/mobile

EAS_NO_VCS=1 \
EAS_PROJECT_ROOT=/Users/mac/Downloads/DEV/altuhealth/frontend/mobile \
EAS_BUILD_NO_EXPO_GO_WARNING=true \
EXPO_PUBLIC_APP_ENV=production \
NODE_ENV=production \
npx eas build --platform android --profile production --message "Production Android store build from project directory"
```

If you want the terminal to wait until the build finishes:

```bash
cd /Users/mac/Downloads/DEV/altuhealth/frontend/mobile

EAS_NO_VCS=1 \
EAS_PROJECT_ROOT=/Users/mac/Downloads/DEV/altuhealth/frontend/mobile \
EAS_BUILD_NO_EXPO_GO_WARNING=true \
EXPO_PUBLIC_APP_ENV=production \
NODE_ENV=production \
npx eas build --platform android --profile production --wait --message "Production Android store build from project directory"
```

## Submit Android To Play Store With Expo

Google Play often requires the first upload to be done manually in Play Console before API submissions work.

Manual first upload:

1. Go to <https://play.google.com/console>
2. Create or open the Altuhealth app.
3. Confirm package name is `com.mostcharming.altuhealth`.
4. Go to `Release > Testing > Internal testing`.
5. Create a new release.
6. Upload the downloaded `.aab`.
7. Add release notes.
8. Review and roll out to internal testing.

After Google Play API/service account setup is complete, submit with EAS:

```bash
cd /Users/mac/Downloads/DEV/altuhealth/frontend/mobile

EAS_NO_VCS=1 \
EAS_PROJECT_ROOT=/Users/mac/Downloads/DEV/altuhealth/frontend/mobile \
npx eas submit --platform android --id 7595e692-e870-44f5-9558-84492ce1ce9c --profile production
```

Submit the latest Android build instead:

```bash
cd /Users/mac/Downloads/DEV/altuhealth/frontend/mobile

EAS_NO_VCS=1 \
EAS_PROJECT_ROOT=/Users/mac/Downloads/DEV/altuhealth/frontend/mobile \
npx eas submit --platform android --latest --profile production
```

## iOS Build Status

iOS is not completed yet.

The iOS build was blocked because EAS required Apple Developer login to validate or set up the Apple distribution certificate.

The iOS build attempt was run from:

```txt
/tmp/altuhealth-mobile-build
```

Leave iOS commands pointed at that temp directory unless the iOS setup is intentionally moved later.

Required before iOS can finish:

```txt
Apple Developer account access
App Store Connect access
Apple ID login during EAS prompt
```

The app already has:

```txt
iOS bundle ID: com.mostcharming.altuhealth
ITSAppUsesNonExemptEncryption: false
Face ID usage description configured
```

## Start iOS Store Build

Run this from the temp mobile build directory and log in to Apple when prompted:

```bash
cd /tmp/altuhealth-mobile-build

EAS_NO_VCS=1 \
EAS_BUILD_NO_EXPO_GO_WARNING=true \
EXPO_PUBLIC_APP_ENV=production \
NODE_ENV=production \
npx eas build --platform ios --profile production --wait --message "Production iOS store build"
```

If asked:

```txt
iOS app only uses standard/exempt encryption? yes
Do you want to log in to your Apple account? yes
```

## Submit iOS With Expo

After the iOS build finishes:

```bash
cd /tmp/altuhealth-mobile-build

EAS_NO_VCS=1 \
npx eas submit --platform ios --latest --profile production
```

EAS Submit uploads the iOS binary to App Store Connect/TestFlight. Final App Store review and release steps are still completed in App Store Connect.

## Useful EAS Commands

List recent Android builds:

```bash
cd /Users/mac/Downloads/DEV/altuhealth/frontend/mobile

EAS_NO_VCS=1 \
EAS_PROJECT_ROOT=/Users/mac/Downloads/DEV/altuhealth/frontend/mobile \
npx eas build:list --platform android --limit 5
```

List recent iOS builds:

```bash
cd /tmp/altuhealth-mobile-build

EAS_NO_VCS=1 \
npx eas build:list --platform ios --limit 5
```

Inspect the Android archive before uploading to EAS:

```bash
cd /Users/mac/Downloads/DEV/altuhealth/frontend/mobile

rm -rf /tmp/altuhealth-projectdir-novcs-archive

EAS_NO_VCS=1 \
EAS_PROJECT_ROOT=/Users/mac/Downloads/DEV/altuhealth/frontend/mobile \
EXPO_PUBLIC_APP_ENV=production \
NODE_ENV=production \
npx eas build:inspect --platform android --profile production --stage archive --output /tmp/altuhealth-projectdir-novcs-archive --force
```

Verify expected archive files:

```bash
test -f /tmp/altuhealth-projectdir-novcs-archive/app.json && echo app-json-ok
test -f /tmp/altuhealth-projectdir-novcs-archive/eas.json && echo eas-json-ok
test -f /tmp/altuhealth-projectdir-novcs-archive/.npmrc && echo npmrc-ok
test -f /tmp/altuhealth-projectdir-novcs-archive/assets/images/icon.png && echo icon-ok
test -f /tmp/altuhealth-projectdir-novcs-archive/lib/config.ts && echo config-ok
test -f /tmp/altuhealth-projectdir-novcs-archive/package-lock.json && echo lock-ok
```

Run Expo Doctor:

```bash
cd /Users/mac/Downloads/DEV/altuhealth/frontend/mobile
npx expo-doctor
```

Run production JS export check:

```bash
cd /Users/mac/Downloads/DEV/altuhealth/frontend/mobile

rm -rf /tmp/altuhealth-mobile-export

EXPO_PUBLIC_APP_ENV=production \
NODE_ENV=production \
npx expo export --platform all --output-dir /tmp/altuhealth-mobile-export
```

## Notes

- The Android Play Store artifact must be `.aab`, not `.apk`.
- The production build profile is configured for `.aab`.
- Keep `EXPO_PUBLIC_API_BASE_URL` pointed at `https://api.altuhealth.com/api/v1` for store builds.
- EAS auto-increments Android `versionCode` for production builds.
- EAS auto-increments iOS `buildNumber` for production builds.
- For Android from the repo project directory, if EAS packages the repo root instead of the mobile app, make sure both `EAS_NO_VCS=1` and `EAS_PROJECT_ROOT=/Users/mac/Downloads/DEV/altuhealth/frontend/mobile` are present.
- For iOS, keep using `/tmp/altuhealth-mobile-build` unless the iOS setup is intentionally moved later.
