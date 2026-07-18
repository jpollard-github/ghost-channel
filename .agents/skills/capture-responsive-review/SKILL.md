---
name: capture-responsive-review
description: Capture, inspect, and package Ghost Channel responsive screenshots for configured desktop, tablet, and phone profiles. Use for responsive review, physical-device measurement updates, screenshot packets, or pre-change-review visual QA.
---

1. Read `AGENTS.md` and `docs/review-workflow.md`.
2. Confirm `config/review-devices.local.json` exists when physical measurements are available; otherwise copy `config/review-devices.example.json` and retain its provisional notes.
3. Run `npm run test:responsive` for focused layout assertions.
4. Run `npm run review:screenshots` to replace only `review-artifacts/screenshots/current`, write the manifest, and package the timestamped ZIP.
5. Inspect every generated PNG. Report clipping, document overflow, unreachable controls, inconsistent spacing, and diagnostics-panel problems. Never infer visual success from file existence alone.
6. When the screenshots belong to the marked change, run `npm run review:change` afterward so the current images accompany the change packet.

Use the package commands as the implementation. Never recreate their logic, call live sources, claim unrun checks passed, or commit generated review artifacts.
