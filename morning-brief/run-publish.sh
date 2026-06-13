#!/usr/bin/env bash
# Morning Brief — publish step (encrypt + inject + commit + push)
# Usage: run-publish.sh /tmp/mb-data.json
# Prints the encrypt summary JSON on stdout (for LINE flex).
# Self-contained so the whole step is ONE allow-listed command (no permission prompts).
set -euo pipefail

DATA_JSON="${1:?usage: run-publish.sh <data.json>}"
LIVE_DIR="/Users/ckawin/Documents/Claude/Projects/AI Business/06_Website/live"
cd "$LIVE_DIR"

# Load ADMIN_PASS etc.
set -a
# shellcheck disable=SC1090
source "$HOME/.config/morning-brief/.env"
set +a

# Encrypt + inject into the static page; capture summary for downstream LINE flex
SUMMARY="$(ADMIN_PASS="$ADMIN_PASS" node morning-brief/lib/encrypt-and-inject.mjs "$DATA_JSON")"

# Commit + push as the tonpalearn GitHub identity
gh auth switch --user tonpalearn >/dev/null 2>&1 || true
git add morning-brief/
DATE="$(TZ=Asia/Bangkok date +%Y-%m-%d)"
if git diff --cached --quiet; then
  echo "[run-publish] nothing to commit" >&2
else
  git commit -m "morning brief $DATE" >&2
  git push origin main >&2 || { gh auth switch --user tonpalearn >/dev/null 2>&1; git push origin main >&2; }
fi

# Emit summary JSON last so the caller can capture just this line
printf '%s\n' "$SUMMARY"
