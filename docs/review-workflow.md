# Review workflow

Use `npm run review:repo` for a full repository packet sourced from Git's tracked and non-ignored file list. It excludes dependencies, output, secrets, reports, Vercel state, and old archives, and refuses suspicious private-key or certificate paths.

For prompt-sized review, establish a real boundary first: clean and checkpoint the work, then run `npm run review:mark -- "before descriptive prompt"`. The ignored baseline records HEAD, time, and label. After the work, `npm run review:change` includes status, stat, changed paths, deletions, a binary-capable patch, current file copies, screenshots when present, and core context. Unborn repositories use Git's empty tree. Git cannot reliably infer an unmarked prompt boundary afterward.

Archives land in ignored `repo-reviews/`. On macOS the scripts ask Finder to reveal the exact ZIP with `open -R`; elsewhere they print the absolute path. Temporary packet directories are removed after successful creation.

## Responsive screenshot review

The ordinary `npm run test:e2e` suite remains a fast Chromium behavior check. `npm run test:responsive` uses `playwright.review.config.ts` to run only `tests/responsive/` across the validated profiles loaded from ignored `config/review-devices.local.json`, or the tracked example when no override exists. The example tablet and iPhone values are provisional. The emulated iPhone/WebKit projects do not replace physical Safari and installed-PWA testing.

Run `npm run playwright:install:review` once to install WebKit. Run `npm run review:screenshots` to remove only the prior `review-artifacts/screenshots/current`, capture stable viewport PNG names, write `manifest.json`, verify a timestamped ZIP under `review-artifacts/screenshot-packets/`, and reveal that exact packet on macOS. The responsive data and clock are deterministic and all source requests are mocked; screenshots do not prove live NWS or USGS health.

Inspect all 16 PNGs for clipping, overflow, unreachable controls, spacing, and diagnostics usability. Current screenshots remain in place so a subsequent `npm run review:change` includes them. Old timestamped screenshot packets are outside `screenshots/current` and are never copied into change-review packets. Generated screenshot and review artifacts are ignored and must not be committed.

For physical measurement, run `npm run dev:lan` on a trusted network, open the printed Network URL with `/?diagnostics=1`, rotate the device, and use **Copy device profile** in ordinary browser and standalone PWA modes. Adapt the relevant entry in `config/review-devices.local.json`, then recapture and inspect the review screenshots.
