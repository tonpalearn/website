# Morning Brief — Personal Daily Dashboard

**Path:** `tonpalearn.com/morning-brief/`
**Trigger:** 07:00 BKK daily via Claude scheduled task
**Audience:** ต้น (single user, password-gated)
**Owner:** ต้น
**Version:** v1.0 — 2026-06-08

---

## Problem Statement

ต้นมีหลาย project (TONPALEARN, UP Wellness, JR ERP, Marubeni audit, AI PMS) + นัดหมายกระจายในหลาย calendar + email สำคัญหายในกล่อง + Notion tasks กระจัดกระจาย. ตอนเช้าต้องเปิด 5-6 แอปเพื่อ get-up-to-speed = เสียเวลาวันละ 20-30 นาที + พลาด context ที่สำคัญ.

ต้องการ **single pane of glass** ตอน 07:00 ที่บอก "วันนี้มีอะไรต้องทำ ต้องไปไหน ต้องตอบใคร" — เปิดครั้งเดียวจบ.

## Goals

1. **Eliminate morning context-gathering time** — จาก 20-30 นาที → < 3 นาที (read brief)
2. **Zero missed important emails** — surface email สำคัญทุกฉบับพร้อม draft reply
3. **Travel buffer awareness** — รู้ล่วงหน้าว่าต้องออกจากบ้าน/ที่ก่อนหน้ากี่โมง
4. **Notion task follow-through** — task ที่ค้างไม่หลุดจากเรดาร์
5. **Weak-signal news pickup** — เห็นข่าว AI/Health/World ที่สำคัญ 3 ข่าวต่อวัน (ไม่เลอะเทอะ)

## Non-Goals

1. ❌ **Two-way edit** (v1 read-only) — ติ๊กงานเสร็จต้องไปทำใน Notion โดยตรง
2. ❌ **Live refresh** — brief เป็น snapshot ของ 07:00 · ไม่ update intra-day
3. ❌ **Multi-user** — เฉพาะต้น
4. ❌ **Mobile app** — web only (responsive)
5. ❌ **AI auto-reply send** — แค่ draft reply · ต้องกด send เอง (privacy)

## User Stories

### As ต้น (founder/multi-role)
- **Daily wake-up**: เปิด `tonpalearn.com/morning-brief` ตอน 07:00 → ใส่ password → เห็นวันนี้ทั้งวันใน 1 หน้า
- **Travel planning**: เห็นนัดที่มีสถานที่ → บอกว่าต้องออกกี่โมงจากที่ก่อนหน้า → ไม่สาย
- **Email triage**: เห็น 5-10 emails สำคัญ + suggested reply → กดปุ่ม → เปิด Gmail compose พร้อม draft → review/send
- **Task awareness**: เห็น Notion tasks ค้างจากทุก database → click เปิดไปที่ Notion
- **News briefing**: 3 ข่าว AI + 3 ข่าว Health & Longevity + 3 ข่าว World · cite source
- **LINE highlight**: รับ Flex card บน LINE OA — เห็น highlight ไม่ต้องเปิด browser ก็พอใช้ได้
- **Archive browsing**: ย้อนดู brief เก่าได้ผ่าน `/morning-brief/archive/`

## Requirements

### P0 — Must Have

**M1. Today's Schedule with Travel**
- Pull events จาก Google Calendar (primary + all connected) ที่อยู่ในวันนี้ (00:00 – 23:59 BKK)
- Display: เวลา, title, location, attendees count
- ถ้ามี location → คำนวณ travel buffer:
  - Default: 30 นาที BKK in-city, 60 นาที out-of-city
  - V1 heuristic — ไม่ใช้ Google Maps API ในก่อน (P2)
- Highlight "leave by HH:MM" สำหรับนัดที่มีสถานที่
- Sort by start time
- Empty state: "🌴 วันนี้ไม่มีนัด — เป็นวันสบายๆ"

**M2. Reminders (next 1-2 days)**
- All-day events + tasks with due dates ที่อยู่ในวันพรุ่งนี้และมะรืน
- รวมจาก Notion (filter: status != Done, due in 1-2 days) + Calendar all-day
- Display: date · title · source (Calendar/Notion DB name) · click → open source

**M3. Upcoming Schedule (next 2 days)**
- Brief view ของนัดวันพรุ่งนี้ + มะรืน
- Display: date · time · title (ย่อ) · location ถ้ามี
- Collapsible (collapsed by default ในมือถือ)

**M4. Important Unread Emails**
- Pull จาก Gmail: unread, last 24h, importance markers + heuristics:
  - **In** (สำคัญ): จากบุคคล (ไม่ใช่ noreply), มีคำว่า "deadline/urgent/asap/important", reply needed
  - **Out** (โฆษณา): จาก newsletter/marketing/promotion, jobs, social media notifications
- Display top 5-10
- For each: from · subject · 2-line snippet · suggested reply (AI-drafted, in Thai/English matching original)
- **Reply button** → opens Gmail compose URL (`https://mail.google.com/mail/?view=cm&to=X&su=Re:Y&body=...`) with prefilled draft
- Mark "read in Gmail" link

**M5. Notion Tasks Waiting Action**
- Query Notion API: all databases ที่มี Status field
- Filter: Status in {"To Do", "In Progress", "Waiting", "Pending"} OR similar
- Group by database/project
- Display: title · status · due (if any) · click → open Notion page

**M6. News Section (AI + Health & Longevity + World)**
- 3 ข่าวต่อหมวด · total 9 ข่าว
- **Trusted sources only**:
  - **AI**: Anthropic blog, OpenAI blog, Google DeepMind, MIT Tech Review, Ars Technica AI, Stratechery
  - **Health & Longevity**: Peter Attia, Bryan Johnson Blueprint, David Sinclair, Stanford Medicine, NIH
  - **World**: Reuters, AP, BBC, Bloomberg, FT
- Display: source · title · 2-line summary · link · published date
- Generated via Claude WebSearch + filter by source allowlist
- Cache: if exact same headline appeared in last 3 days → skip

**M7. Password Gate**
- Page loads encrypted (AES via crypto-js)
- Password prompt on load
- Wrong password → error toast, try again
- Correct → decrypt + render
- localStorage remembers password for 7 days (per browser, opt-in checkbox)

**M8. LINE Flex Notification**
- Sent at ~07:05 BKK after generation completes
- Flex card with:
  - Header: 🌅 Morning Brief · วันที่
  - Body summary:
    - 📅 X นัด · ⏰ ต้องออก HH:MM
    - 📧 Y emails สำคัญ
    - ✅ Z tasks ค้าง
    - 📰 Top headline
  - Footer button: "เปิด Full Brief" → `https://tonpalearn.com/morning-brief/`

**M9. Archive**
- After generation, copy previous day's `/morning-brief/index.html` → `/morning-brief/archive/YYYY-MM-DD.html`
- Update `/morning-brief/archive/index.html` — list ทุก brief เรียงจากใหม่→เก่า · grouped by month
- Same password gate applies to archives
- Retention: keep all (cheap — 1 HTML per day)

### P1 — Nice to Have (v1.1+)

- N1. Google Maps travel time API integration (real traffic) — แทน heuristic
- N2. Weather forecast for outdoor events
- N3. "Send draft for me" button (auth + Gmail send) — กด 1 ครั้ง send ได้เลย
- N4. Voice mode — TTS อ่าน brief ตอนแต่งตัว
- N5. Custom news topic filters (Thai politics, Crypto, etc.)
- N6. Quick actions in LINE (reply via LINE → forward to Gmail draft)

### P2 — Future

- F1. Cross-reference: ถ้า email mention ชื่อคนในนัด → highlight + show นัด
- F2. Yesterday recap: "วานนี้ทำอะไรไป" (calendar + completed Notion tasks)
- F3. Habit tracker (UP Wellness exercise, hs-CRP log, etc.)
- F4. Decision queue (questions awaiting answer)
- F5. Weekly brief (Sunday 19:00) — week ahead + last week metrics

## Architecture

### Stack
- HTML5 + Tailwind CDN + React 18 UMD + Babel (เหมือนทั้ง website)
- crypto-js CDN สำหรับ AES decrypt
- ไม่มี backend — pure static
- Hosting: Vercel auto-deploy

### Data Flow

```
07:00 BKK — Claude Scheduled Task triggers
   │
   ├─→ Google Calendar MCP — list_events today + 2 days
   ├─→ Gmail MCP — search_threads label:INBOX is:unread newer_than:1d
   ├─→ Notion MCP — search + fetch tasks
   └─→ WebSearch — fetch news from trusted sources
   │
   ▼
Build JSON payload + AES-encrypt with ADMIN_PASS
   │
   ▼
Render HTML template with encrypted data baked in
   │
   ├─→ Save /morning-brief/index.html (today)
   ├─→ Move yesterday's → /morning-brief/archive/YYYY-MM-DD.html
   └─→ Update /morning-brief/archive/index.html
   │
   ▼
git add + commit + push (auto-deploy via Vercel)
   │
   ▼
LINE Flex push (line-message skill)
```

### File Structure

```
06_Website/live/morning-brief/
├── index.html              # Today's brief (gated, encrypted data inline)
├── archive/
│   ├── index.html          # List of all past briefs
│   ├── 2026-06-08.html     # Today's snapshot
│   ├── 2026-06-07.html
│   └── ...
└── README.md               # How to regenerate manually
```

### Encryption
- Algorithm: AES-256-CBC via crypto-js
- Key: ADMIN_PASS (same as /admin)
- Encrypted: full JSON data payload
- Decrypted in browser only after password entry

### Generation Orchestrator

The scheduled task is a Claude session triggered by cron at 07:00 BKK. Prompt is stored at:
`/Users/ckawin/Library/Application Support/Claude/.../morning-brief-prompt.md`

Or inlined into the schedule definition.

Workflow per run:
1. Compute today's date in BKK timezone
2. Fetch Calendar events (today + next 2 days)
3. Fetch Gmail unread (last 24h)
4. Fetch Notion tasks (all DBs with Status field)
5. Fetch news (WebSearch each source, filter to last 24h, max 3 per category)
6. AI-draft replies for important emails
7. Build JSON payload
8. AES-encrypt with ADMIN_PASS env var
9. Read template HTML, inject encrypted payload + plaintext metadata (date, stats for LINE)
10. Write `index.html` + copy to `archive/YYYY-MM-DD.html` + regenerate archive index
11. `git add . && git commit -m "morning brief YYYY-MM-DD" && git push`
12. Send LINE Flex with stats + link

### LINE Flex Card Schema

```json
{
  "type": "flex",
  "altText": "🌅 Morning Brief 2026-06-08",
  "contents": {
    "type": "bubble",
    "header": {
      "type": "box",
      "layout": "vertical",
      "backgroundColor": "#08080F",
      "contents": [
        {"type": "text", "text": "🌅 MORNING BRIEF", "color": "#F5D67A", "size": "sm", "weight": "bold"},
        {"type": "text", "text": "Mon · 8 Jun 2026", "color": "#67E8F9", "size": "xs"}
      ]
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "spacing": "md",
      "contents": [
        {"type": "text", "text": "📅 3 นัด · ออก 08:30 → Bangkok Hospital", "size": "sm", "wrap": true},
        {"type": "text", "text": "📧 5 emails สำคัญ", "size": "sm"},
        {"type": "text", "text": "✅ 12 tasks ค้าง", "size": "sm"},
        {"type": "separator"},
        {"type": "text", "text": "📰 Top: Anthropic เปิดตัว Claude 5...", "size": "xs", "color": "#666"}
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "contents": [{
        "type": "button",
        "style": "primary",
        "color": "#E6B84B",
        "action": {
          "type": "uri",
          "label": "เปิด Full Brief",
          "uri": "https://tonpalearn.com/morning-brief/"
        }
      }]
    }
  }
}
```

## Success Metrics

### Leading (week 1-2)
- ⏰ Open rate: % of days ต้นเปิด brief ภายใน 09:00 → target ≥ 90%
- 📧 Reply-button click rate: % suggested replies ที่ใช้ → target ≥ 30%
- 🔗 LINE → web click-through: % LINE notifications ที่ click → target ≥ 50%

### Lagging (month 1+)
- 🕐 Self-reported morning routine time: 30 min → < 5 min
- 📉 Missed important email count: หลักหน่วยต่อสัปดาห์ → 0
- 🚗 "Sai เพราะไม่รู้ว่าต้องออก" → 0 ครั้ง/เดือน

## Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| Q1 | บ้าน address ที่ใช้คำนวณ travel from-home คืออะไร? | ต้น | No (ใช้ heuristic 30min default ไปก่อน) |
| Q2 | Notion workspace มีกี่ DB ที่มี Status field? และอยากกรองแค่ DB ไหน? | ต้น + auto-discover | No (v1 = all DBs) |
| Q3 | "สำคัญ" สำหรับ email มี keyword/sender list อะไรพิเศษ? | ต้น | No (v1 = heuristic) |
| Q4 | LINE OA ID ที่จะส่ง brief ไป? | ต้น + line-message skill | Yes — ต้องระบุก่อน |
| Q5 | News sources ขยายเพิ่ม Thai politics / Crypto / Finance ไหม? | ต้น | No (v1 = AI+Health+World ตามที่ขอ) |

## Timeline

- **Day 0 (today)**: Spec + Template + Generator script + Schedule
- **Day 1 (07:00 tomorrow)**: First auto-run → verify
- **Week 1**: Iterate based on what's missing/noisy
- **Week 2**: Add P1 items (Google Maps travel, send-draft button)

## Dependencies

- ✅ Vercel hosting (already)
- ✅ Google Calendar MCP (connected)
- ✅ Gmail MCP (connected)
- ✅ Notion MCP (connected)
- ✅ `line-message` skill (Toni LINE OA)
- ✅ ADMIN_PASS env var (already set up for /admin)
- ⚠️ Claude scheduled task at 07:00 BKK (set up via `schedule` skill)

## Risks

| Risk | Mitigation |
|------|-----------|
| Generation script fails at 07:00 → no brief | Retry 3x at 5-min intervals · fallback LINE "brief failed" alert |
| Calendar/Gmail rate limits | Cache results · use minimal fields |
| Sensitive data leak (public URL) | AES encryption with ADMIN_PASS · gitignore raw data |
| News source goes stale (no new posts) | Skip source · don't pad with low-quality |
| LINE Flex too long → truncated | Cap at 5 highlights · link to full brief for rest |
