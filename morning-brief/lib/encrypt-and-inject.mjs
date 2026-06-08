#!/usr/bin/env node
/**
 * Morning Brief — Encrypt + Inject + Snapshot + Manifest
 *
 * Usage:
 *   ADMIN_PASS=xxx node encrypt-and-inject.mjs <data.json>
 *
 * Reads:
 *   - <data.json>          : the brief payload (see PROMPT.md schema)
 *   - ../index.html        : template (placeholder __BRIEF_*__ markers)
 *   - ../archive/*.html    : existing snapshots (for manifest rebuild)
 *   - ../archive/index.html: archive index template
 *
 * Writes:
 *   - ../index.html                 : today's brief (overwritten)
 *   - ../archive/YYYY-MM-DD.html    : snapshot copy of today
 *   - ../archive/index.html         : rebuilt index with updated manifest
 *
 * Output (stdout): JSON summary for downstream LINE notification
 *
 * Encryption: AES-256-CBC, OpenSSL-compatible (Salted__ + 8-byte salt + ciphertext, base64)
 * Decryption-compatible with browser CryptoJS.AES.decrypt(b64, password)
 */

import { readFileSync, writeFileSync, copyFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, '_src');
const SRC_INDEX_PATH = path.join(SRC_DIR, 'index.html');       // template with __BRIEF_* placeholders
const SRC_ARCHIVE_PATH = path.join(SRC_DIR, 'archive.html');    // template with __MANIFEST_* placeholder
const OUT_INDEX_PATH = path.join(ROOT, 'index.html');           // today's brief (written)
const ARCHIVE_DIR = path.join(ROOT, 'archive');
const ARCHIVE_INDEX_PATH = path.join(ARCHIVE_DIR, 'index.html'); // archive listing (written)

// ====== Encryption (OpenSSL-compatible Salted__ format) ======
function aesEncrypt(plaintext, password) {
  const salt = crypto.randomBytes(8);
  const passBuf = Buffer.from(password, 'utf8');
  // OpenSSL EVP_BytesToKey with MD5
  let derived = Buffer.alloc(0);
  let last = Buffer.alloc(0);
  while (derived.length < 48) {
    last = crypto.createHash('md5').update(Buffer.concat([last, passBuf, salt])).digest();
    derived = Buffer.concat([derived, last]);
  }
  const key = derived.subarray(0, 32);
  const iv = derived.subarray(32, 48);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const out = Buffer.concat([Buffer.from('Salted__', 'utf8'), salt, enc]);
  return out.toString('base64');
}

function escapeForJsonString(s) {
  return JSON.stringify(s).slice(1, -1);
}

// ====== Date helpers (BKK timezone) ======
const TH_WEEKDAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const EN_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function bkkNow() {
  // Use Asia/Bangkok timezone
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
}

function ymd(d = bkkNow()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function bkkTimestamp() {
  const d = bkkNow();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} BKK`;
}

// ====== Main ======
async function main() {
  const dataPath = process.argv[2];
  if (!dataPath) {
    console.error('Usage: ADMIN_PASS=xxx node encrypt-and-inject.mjs <data.json>');
    process.exit(1);
  }

  const adminPass = process.env.ADMIN_PASS;
  if (!adminPass) {
    console.error('ERROR: ADMIN_PASS env var is required');
    process.exit(1);
  }

  if (!existsSync(dataPath)) {
    console.error(`ERROR: data file not found: ${dataPath}`);
    process.exit(1);
  }

  const rawData = JSON.parse(readFileSync(dataPath, 'utf8'));

  // Validate minimal shape
  const date = rawData.date || ymd();
  const dateObj = new Date(date + 'T00:00:00+07:00');
  const weekday_th = TH_WEEKDAYS[dateObj.getDay()];
  const weekday_en = EN_WEEKDAYS[dateObj.getDay()];

  // Add computed stats if not provided
  if (!rawData.stats) {
    const events = (rawData.today_events || []).length;
    const emails = (rawData.emails || []).length;
    const tasks = (rawData.task_groups || []).reduce((s, g) => s + (g.tasks || []).length, 0);
    const news = ['ai','health','world'].reduce((s, k) => s + ((rawData.news?.[k] || []).length), 0);
    const firstLeave = (rawData.today_events || []).find(e => e.travel?.leave_at);
    rawData.stats = {
      events_today: events,
      important_emails: emails,
      pending_tasks: tasks,
      news_count: news,
      first_leave_at: firstLeave?.travel?.leave_at || null
    };
  }

  // Encrypt payload (just the data — not the metadata)
  const plaintext = JSON.stringify(rawData);
  const encrypted = aesEncrypt(plaintext, adminPass);

  // Read template (always from _src/ — never from output)
  let template = readFileSync(SRC_INDEX_PATH, 'utf8');

  // Inject metadata
  const generatedAt = bkkTimestamp();
  template = template
    .replace('__BRIEF_DATE__', escapeForJsonString(date))
    .replace('__BRIEF_WEEKDAY_TH__', escapeForJsonString(weekday_th))
    .replace('__BRIEF_WEEKDAY_EN__', escapeForJsonString(weekday_en))
    .replace('__BRIEF_GENERATED_AT__', escapeForJsonString(generatedAt))
    .replace('__BRIEF_ENCRYPTED_PAYLOAD__', escapeForJsonString(encrypted));

  // Write today's brief (OUTPUT path — separate from template)
  writeFileSync(OUT_INDEX_PATH, template, 'utf8');

  // Snapshot copy to archive
  const archivePath = path.join(ARCHIVE_DIR, `${date}.html`);
  writeFileSync(archivePath, template, 'utf8');

  // Rebuild manifest by scanning archive/*.html
  const files = readdirSync(ARCHIVE_DIR).filter(f => /^\d{4}-\d{2}-\d{2}\.html$/.test(f));
  const items = files
    .map(f => {
      const fdate = f.replace('.html', '');
      const fdateObj = new Date(fdate + 'T00:00:00+07:00');
      const fstat = statSync(path.join(ARCHIVE_DIR, f));

      // Try to extract preview metadata from each file's brief-meta script
      let preview = '', events = null, emails = null, tasks = null;
      try {
        const content = readFileSync(path.join(ARCHIVE_DIR, f), 'utf8');
        const metaMatch = content.match(/<script id="brief-meta"[^>]*>([\s\S]*?)<\/script>/);
        if (metaMatch) {
          // Stats live in separate plaintext if we add them. For now, leave nulls.
          // (We could also embed plaintext stats in meta — see future enhancement)
        }
        // Look for `stats_plain` JSON block (optional, for archive metadata)
        const statsMatch = content.match(/<script id="brief-stats-plain"[^>]*>([\s\S]*?)<\/script>/);
        if (statsMatch) {
          try {
            const stats = JSON.parse(statsMatch[1]);
            events = stats.events_today;
            emails = stats.important_emails;
            tasks = stats.pending_tasks;
            preview = stats.preview || '';
          } catch (e) {}
        }
      } catch (e) {}

      // For today, use the fresh stats
      if (fdate === date) {
        events = rawData.stats.events_today;
        emails = rawData.stats.important_emails;
        tasks = rawData.stats.pending_tasks;
        preview = rawData.greeting?.slice(0, 120) || '';
      }

      return {
        date: fdate,
        weekday_th: TH_WEEKDAYS[fdateObj.getDay()],
        weekday_en: EN_WEEKDAYS[fdateObj.getDay()],
        events, emails, tasks, preview,
        size_kb: Math.round(fstat.size / 1024)
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Inject a plaintext stats block in today's snapshot for future manifest builds
  // (re-read & patch archive copy)
  const todaySnapshot = readFileSync(archivePath, 'utf8');
  const statsPlain = {
    events_today: rawData.stats.events_today,
    important_emails: rawData.stats.important_emails,
    pending_tasks: rawData.stats.pending_tasks,
    news_count: rawData.stats.news_count,
    preview: rawData.greeting?.slice(0, 120) || ''
  };
  const statsBlock = `<script id="brief-stats-plain" type="application/json">${JSON.stringify(statsPlain)}</script>`;
  const patchedSnapshot = todaySnapshot.replace(
    '<script id="brief-meta"',
    `${statsBlock}\n<script id="brief-meta"`
  );
  writeFileSync(archivePath, patchedSnapshot, 'utf8');

  // Also patch the today (index.html) with the same plaintext stats
  const todayIndex = readFileSync(OUT_INDEX_PATH, 'utf8');
  if (!todayIndex.includes('id="brief-stats-plain"')) {
    const patched = todayIndex.replace(
      '<script id="brief-meta"',
      `${statsBlock}\n<script id="brief-meta"`
    );
    writeFileSync(OUT_INDEX_PATH, patched, 'utf8');
  }

  // Rebuild archive/index.html manifest
  const manifest = {
    generated_at: generatedAt,
    total_count: items.length,
    items
  };

  // Read archive index template — read from _src/, write to public archive/index.html
  let archiveIndex = readFileSync(SRC_ARCHIVE_PATH, 'utf8');
  const manifestJson = JSON.stringify(manifest, null, 2);
  archiveIndex = archiveIndex.replace(
    /<script id="archive-manifest"[^>]*>[\s\S]*?<\/script>/,
    `<script id="archive-manifest" type="application/json">\n${manifestJson}\n</script>`
  );
  writeFileSync(ARCHIVE_INDEX_PATH, archiveIndex, 'utf8');

  // Output summary for downstream LINE notification
  const firstEv = (rawData.today_events || [])[0];
  const topNews = (rawData.news?.ai?.[0] || rawData.news?.world?.[0] || rawData.news?.health?.[0]);
  const summary = {
    date,
    weekday_th,
    generated_at: generatedAt,
    stats: rawData.stats,
    first_event: firstEv ? {
      time: firstEv.time_start,
      title: firstEv.title,
      location: firstEv.location || null,
      leave_at: firstEv.travel?.leave_at || null
    } : null,
    top_email: (rawData.emails || [])[0]?.subject || null,
    top_task: (rawData.task_groups?.[0]?.tasks?.[0]?.title) || null,
    top_news: topNews ? { title: topNews.title, source: topNews.source } : null,
    archive_count: items.length,
    files_written: [
      'morning-brief/index.html',
      `morning-brief/archive/${date}.html`,
      'morning-brief/archive/index.html'
    ]
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
