---
name: export-change-review
description: Export and verify a baseline-scoped Ghost Channel change review ZIP.
---

Read `AGENTS.md` and `docs/review-workflow.md`. Confirm `.review-baseline.json` exists, then run the existing `npm run review:change`; do not reconstruct a prompt boundary or rewrite the exporter. Verify the exact printed ZIP is readable and contains `REVIEW.md` and `changes.patch`. Let the script use `open -R` only on macOS. Never claim checks not run, and never commit artifacts.
