---
name: verify-change
description: Apply the Ghost Channel verification ladder and report exact results.
---

Read `AGENTS.md`, `README.md`, and `docs/architecture.md`. Inspect the changed scope, then run the smallest applicable rung: `npm run verify:fast`, `npm run verify`, `npm run verify:full`, and `npm run test:e2e` for browser behavior. Use existing scripts. Report exact commands, pass/fail counts, and skipped checks; never claim an unrun check passed. Generated review artifacts remain ignored and uncommitted.
