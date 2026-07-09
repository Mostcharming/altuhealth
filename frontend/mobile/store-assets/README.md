# AltuHealth Play Store Assets

Generated on 2026-07-07.

Regenerate from the mobile project root:

```sh
python3 scripts/generate_store_assets.py
```

Upload map:

- App icon: `icon/play-store-icon-512.png`
- Feature graphic: `feature-graphic/play-store-feature-graphic-1024x500.png`
- Phone screenshots: `screenshots/phone/*.png`
- 7-inch tablet screenshots: `screenshots/7-inch-tablet/*.png`
- 10-inch tablet screenshots: `screenshots/10-inch-tablet/*.png`

Format notes:

- App icon is 512x512 PNG with alpha.
- Feature graphic is 1024x500 PNG with no alpha.
- Screenshots are 9:16 PNG files with no alpha.
- `manifest.json` lists every generated asset and its dimensions.
