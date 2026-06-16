#!/usr/bin/env bash
# Morning Brief — publish + notify (encrypt + inject + commit + push + LINE Flex carousel)
# Usage: run-publish.sh /tmp/mb-data.json [--no-line]
# Builds the full-brief LINE carousel from the SAME data JSON and sends it, so the
# whole daily step is ONE allow-listed command (no permission prompts, no model-authored flex).
# Prints the encrypt summary JSON, then a "LINE: ..." line, on stdout.
set -euo pipefail

DATA_JSON="${1:?usage: run-publish.sh <data.json> [--no-line]}"
SEND_LINE=1
[[ "${2:-}" == "--no-line" ]] && SEND_LINE=0
LIVE_DIR="/Users/ckawin/Documents/Claude/Projects/AI Business/06_Website/live"
SEND_LINE_PY="$HOME/.claude/skills/line-message/scripts/send_line.py"
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

# Build the full-brief LINE carousel from the same data JSON and send it.
LINE_RESULT="skipped"
if [[ "$SEND_LINE" == "1" ]]; then
  FLEX_JSON="/tmp/mb-line-flex.json"
  if node morning-brief/lib/build-line-flex.mjs "$DATA_JSON" > "$FLEX_JSON" 2>/dev/null; then
    LINE_RESULT="$(python3 "$SEND_LINE_PY" raw @"$FLEX_JSON" 2>&1 || echo "send failed")"
  else
    LINE_RESULT="flex build failed"
  fi
  echo "[run-publish] LINE: $LINE_RESULT" >&2
fi

# Emit summary JSON, then the LINE result, so the caller can capture both
printf '%s\n' "$SUMMARY"
printf 'LINE: %s\n' "$LINE_RESULT"
