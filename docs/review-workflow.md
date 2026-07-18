# Review workflow

Use `npm run review:repo` for a full repository packet sourced from Git's tracked and non-ignored file list. It excludes dependencies, output, secrets, reports, Vercel state, and old archives, and refuses suspicious private-key or certificate paths.

For prompt-sized review, establish a real boundary first: clean and checkpoint the work, then run `npm run review:mark -- "before descriptive prompt"`. The ignored baseline records HEAD, time, and label. After the work, `npm run review:change` includes status, stat, changed paths, deletions, a binary-capable patch, current file copies, screenshots when present, and core context. Unborn repositories use Git's empty tree. Git cannot reliably infer an unmarked prompt boundary afterward.

Archives land in ignored `repo-reviews/`. On macOS the scripts ask Finder to reveal the exact ZIP with `open -R`; elsewhere they print the absolute path. Temporary packet directories are removed after successful creation.
