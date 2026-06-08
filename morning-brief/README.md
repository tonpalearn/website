# Morning Brief — Personal Daily Dashboard

**Live:** https://tonpalearn.com/morning-brief/ (password gated)
**Archive:** https://tonpalearn.com/morning-brief/archive/

## What it is

A daily personal dashboard for ต้น generated at **07:00 BKK** that aggregates:
- 📅 Today's schedule (with travel times)
- ⏰ Reminders for next 1-2 days
- 📆 Upcoming schedule (next 2 days, brief view)
- 📧 Important unread emails (with AI-drafted replies + Gmail compose button)
- ✅ Notion tasks waiting action (all DBs with Status field)
- 📰 News brief — 3 AI + 3 Health/Longevity + 3 World, trusted sources only

Plus: 🔐 AES-256 encryption · 📱 LINE Flex notification · 📚 archive of past briefs.

## Architecture

- **Static HTML + React 18 UMD + Babel + Tailwind CDN** (no build step)
- **AES-256-CBC encryption** — data baked into HTML, decrypted in browser with ADMIN_PASS
- **Daily snapshot** copied to `archive/YYYY-MM-DD.html` after each generation
- **Manifest** auto-rebuilt from `archive/*.html` for the archive index
- **Theme system** — Auto (follow OS) · Light · Dark · cycle button in top bar, persists via localStorage, pre-paint script avoids FOUC

## File structure

```
morning-brief/
├── _src/                       # ★ SOURCE templates (never overwritten)
│   ├── index.html              # Brief template — has __BRIEF_* placeholders + theme system
│   └── archive.html            # Archive template — has __MANIFEST_* placeholder + theme
├── index.html                  # OUTPUT — today's brief (regenerated each run)
├── archive/
│   ├── index.html              # OUTPUT — list of past briefs (manifest baked in)
│   └── YYYY-MM-DD.html         # OUTPUT — daily snapshots
├── lib/
│   └── encrypt-and-inject.mjs  # Node helper — reads _src/, writes outputs, rebuilds manifest
├── data/                       # gitignored — temp raw JSON
├── PROMPT.md                   # The scheduled task prompt
└── README.md                   # This file
```

**Important**: Always edit `_src/` files for layout/CSS/theme changes. The output files
(`index.html`, `archive/*.html`) are regenerated each run and your edits would be lost.

## How it runs

### Automatic (07:00 BKK every day)
A Claude scheduled task fires `PROMPT.md`, which:
1. Gathers data via MCPs (Calendar, Gmail, Notion, WebSearch)
2. Writes `/tmp/mb-data.json`
3. Runs `node lib/encrypt-and-inject.mjs /tmp/mb-data.json`
4. `git commit` + `git push` to `tonpalearn/website` main
5. Sends LINE Flex card via `line-message` skill

### Manual regeneration (for testing)
```bash
# 1. Prepare a data.json matching the schema in PROMPT.md
cp data/sample.json /tmp/mb-data.json

# 2. Encrypt + inject + snapshot
ADMIN_PASS=your_password node morning-brief/lib/encrypt-and-inject.mjs /tmp/mb-data.json

# 3. Commit + push
gh auth switch --user tonpalearn
git add morning-brief/
git commit -m "morning brief manual regen $(date +%Y-%m-%d)"
git push
```

## Encryption details

- **Algorithm**: AES-256-CBC
- **Format**: OpenSSL-compatible Salted__ + 8-byte random salt + ciphertext, base64
- **Key derivation**: EVP_BytesToKey with MD5 (matches CryptoJS default)
- **Decryption**: `CryptoJS.AES.decrypt(b64, password)` in browser
- **Password**: `ADMIN_PASS` env var (same as `/admin`)

The `data` payload is encrypted; metadata (date, weekday, generated_at) is plaintext for display in the password gate.

## Privacy

- ✅ Page bodies encrypted at rest (in git, on Vercel CDN)
- ✅ `<meta name="robots" content="noindex">` on all pages
- ✅ localStorage password cache opt-in only (7 days)
- ⚠️ URL path is guessable — but content useless without password
- ⚠️ Plaintext stats (event counts) are visible in archive index for browsing

## Adding new news sources

Edit the trusted sources allowlist in `PROMPT.md`. The scheduled task only pulls from sources listed there.

## Adding new sections

1. Update `PROMPT.md` schema with new field
2. Update React component in `index.html` to render it
3. Test with manual regen

## Troubleshooting

**"Brief ยังไม่ถูก generate" shown on /morning-brief/**
→ Template still has `__BRIEF_ENCRYPTED_PAYLOAD__` placeholder. Run the generator.

**"Password ไม่ถูกต้อง" but I'm sure it's right**
→ Check `ADMIN_PASS` in your `.env` matches Vercel env. The encryption uses whatever was passed at generation time.

**LINE notification didn't arrive**
→ Check the `line-message` skill config + LINE OA channel access token in Vercel env.

**Archive index shows 0 briefs**
→ Manifest is rebuilt by scanning `archive/*.html`. Check files exist + filenames match `YYYY-MM-DD.html` pattern.
