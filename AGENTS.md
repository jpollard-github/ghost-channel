# Ghost Channel working rules

Read `README.md`, `TODO.md`, and `docs/architecture.md` before changing behavior. Make the smallest coherent change and report exactly which checks ran.

- Never import from sibling repositories or depend on their internal trees.
- Adapters own raw external payloads, validation, and normalization. UI receives only Ghost Channel models.
- Every source reports health and timestamps. Never turn a failure into an empty success.
- Automated tests never call live external networks; use deterministic fixtures.
- Preserve upstream attribution, credit, rights, and licensing metadata.
- Never commit secrets, `.env.local`, generated review archives, or review artifacts.
- Prefer platform features and minimal dependencies.
- Keep keyboard and screen-reader access, reduced motion, safe areas, 1280×800 and 1440×900 landscape, and 390×844 mobile in scope. Never autoplay audio.
- Keep ordinary E2E fast. Put multi-device screenshot assertions in the responsive review configuration, use deterministic mocked source data, and visually inspect every generated PNG.
- Treat `config/review-devices.local.json` and generated screenshot/review artifacts as local, ignored files that must never be committed.

Verification ladder: `npm run verify:fast`, `npm run verify`, `npm run verify:full`, then `npm run test:e2e` for browser-impacting work. Never claim an unrun check passed. Generated review artifacts must never be committed.
