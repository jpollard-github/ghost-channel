---
name: export-repo-review
description: Export and verify a full Ghost Channel repository review ZIP.
---

Read `AGENTS.md` and `docs/review-workflow.md`. Run the existing `npm run review:repo`; do not recreate its logic. Verify the exact printed archive exists, is a readable ZIP, and contains `README.md`, `AGENTS.md`, and `package.json`. On macOS use `open -R` only through the existing script; elsewhere report the absolute path. Never claim checks not run, and never commit the archive.
