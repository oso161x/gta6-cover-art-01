# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/oso161x/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/oso161x/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio** — a free, offline web app that turns your photos and a caption into GTA 6-style cover art: the multi-panel poster look, bold sunset-gradient lettering, and a Vice City sunset/neon colour grade, exported as a PNG to share. It runs entirely in your desktop browser from its own static files — your photos never leave your machine, and nothing is uploaded anywhere.

What it does:

- **Any photo, up to 4** — upload your own or try the two bundled samples; click a panel to select it, drag to reposition the photo, scroll (or use the slider) to zoom, and reset the crop any time.
- **6 multi-panel layouts** — Hero + Three, Four-Panel Grid, Nine-Panel Grid, Full Bleed, Tilted Snapshots, and Triple Band — with one photo filling several panels or a different photo in each.
- **5 gradient-map colour grades** — Vice Sunset, Neon Night, Golden Hour, Miami Teal, Hot Pink — remapping each photo through a sunset/neon gradient while keeping faces recognisable.
- **Caption editing** — a big Anton title with a sunset gradient, dark outline and halftone title block, plus a glowing Pacifico neon subtitle. Both are live as you type.
- **Fast to a PNG** — one click exports the current size, or all three post sizes at once: 1080 × 1080, 1080 × 1350, and 1920 × 1080.
- **Undo / redo** — every layout, grade, caption and crop change can be stepped back (Ctrl+Z / Ctrl+Shift+Z).
- **Polish** — deterministic film grain and a vignette finish every cover; the lettering uses vendored Anton and Pacifico fonts (SIL Open Font License, texts beside them under `app/fonts/`).

Everything is original: no Rockstar Games logo, artwork, character or font is used anywhere.

Layouts: Hero + Three · Four-Panel Grid · Nine-Panel Grid · Full Bleed · Tilted Snapshots · Triple Band. Grades: Vice Sunset · Neon Night · Golden Hour · Miami Teal · Hot Pink.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Or try the app directly:

```sh
node serve.ts
```

then open http://localhost:8080 — add photos, pick a layout and grade, type your caption, and hit **Export PNG**.

---

<sub>Entered on [make.fun](https://make.fun/?ref=4s86eynw&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
