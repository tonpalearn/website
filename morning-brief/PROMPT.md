# Morning Brief — Daily Generation Prompt

This is the prompt the **scheduled Claude session** runs at **07:00 BKK** every day to produce `tonpalearn.com/morning-brief`.

---

## Run order

```
1. Gather data (in parallel where possible):
   • Google Calendar  → today + next 2 days events
   • Gmail            → unread important (last 24h)
   • Notion           → tasks (all DBs with Status field)
   • WebSearch        → 3 news per category from trusted sources

2. AI-draft replies for important emails (Thai or English, matching original)

3. Compose greeting (1-2 sentences, situational)

4. Write data JSON to /tmp/mb-data.json (schema below)

5. ADMIN_PASS=xxx node /Users/ckawin/Documents/Claude/Projects/AI\ Business/06_Website/live/morning-brief/lib/encrypt-and-inject.mjs /tmp/mb-data.json
   → captures summary JSON on stdout

6. cd "/Users/ckawin/Documents/Claude/Projects/AI Business/06_Website/live"
   gh auth switch --user tonpalearn
   git add morning-brief/
   git commit -m "morning brief YYYY-MM-DD"
   git push

7. Use line-message skill — send Flex card with summary
```

---

## Data JSON Schema

```jsonc
{
  "date": "2026-06-08",                  // YYYY-MM-DD (BKK)
  "greeting": "วันจันทร์เช้านี้มี 3 นัด...",  // 1-2 sentences, situational

  "weather": {                           // optional v1.1+
    "icon": "☀️",
    "summary": "แดดดี อากาศ 28-34°C",
    "temp": 30
  },

  "today_events": [
    {
      "time_start": "09:00",
      "time_end": "10:00",
      "title": "Meeting with John",
      "location": "Bangkok Hospital Suite 5",
      "calendar": "Personal",            // optional
      "attendees_count": 3,              // optional
      "url": "https://calendar.google.com/...",
      "notes": "เตรียมผลเลือดไป",       // optional
      "travel": {                        // include if location is known
        "from_label": "บ้าน",
        "duration_min": 30,
        "leave_at": "08:30"
      }
    }
  ],

  "reminders": [                         // 1-2 days ahead — all-day + due tasks
    {
      "when_label": "พรุ่งนี้",
      "due": "2026-06-09",
      "title": "ส่งใบกำกับภาษี Amway",
      "source": "Notion · UP Tax",
      "url": "https://notion.so/..."
    }
  ],

  "next_days": [                         // 2 days summary
    {
      "date": "2026-06-09",
      "date_label": "พรุ่งนี้ (อังคาร)",
      "events": [
        { "time_start": "14:00", "title": "ITGR audit kickoff", "location": "Autocorp HQ" }
      ]
    },
    {
      "date": "2026-06-10",
      "date_label": "มะรืน (พุธ)",
      "events": []
    }
  ],

  "emails": [                            // top 5-10 important unread
    {
      "id": "thread_id_or_msg_id",
      "from": "client@example.com",
      "from_name": "John Doe",
      "subject": "Re: Proposal",
      "snippet": "Two-line preview of body...",
      "received_at": "2026-06-08T05:30:00+07:00",
      "importance": "high",              // high | normal
      "category": "Client",              // Client | Team | Vendor | etc.
      "suggested_reply": "เรียนคุณ John,\n\nขอบคุณสำหรับ proposal...",
      "thread_url": "https://mail.google.com/mail/u/0/#inbox/..."
    }
  ],

  "task_groups": [                       // grouped by Notion DB
    {
      "source": "tonpalearn_tasks",
      "source_label": "TONPALEARN Tasks",
      "source_url": "https://notion.so/...",
      "tasks": [
        {
          "title": "Review booking analytics dashboard",
          "status": "In Progress",      // To Do | In Progress | Waiting | Pending
          "due": "2026-06-10",
          "overdue": false,
          "notes": "context note",
          "url": "https://notion.so/..."
        }
      ]
    }
  ],

  "news": {
    "ai": [
      {
        "source": "Anthropic",          // must be in trusted list
        "title": "Claude 4.5 Sonnet เปิดตัว",
        "summary": "2-3 ประโยคสรุป",
        "url": "https://...",
        "published_at": "2026-06-07T14:00:00Z",
        "why_matters": "เกี่ยวกับเราเพราะ..."    // optional, 1 line
      }
    ],
    "health": [ /* same shape */ ],
    "world":  [ /* same shape */ ]
  }
}
```

---

## Trusted news sources (allowlist)

### AI
- Anthropic (anthropic.com/news)
- OpenAI (openai.com/blog)
- Google DeepMind (deepmind.google/discover)
- MIT Technology Review (technologyreview.com)
- Ars Technica AI (arstechnica.com/ai/)
- Stratechery (stratechery.com)

### Health & Longevity
- Peter Attia (peterattiamd.com)
- Bryan Johnson Blueprint (protocol.bryanjohnson.com)
- David Sinclair Lab (lifespanpodcast.com)
- Stanford Medicine News
- NIH News

### World
- Reuters
- AP News
- BBC
- Bloomberg
- Financial Times

Filter: published within last 24h. Skip if duplicate of prior 3 days.

---

## Email importance heuristics

**IN (high)**:
- From real person (not noreply@, marketing@, notifications@)
- Subject contains: deadline, urgent, asap, important, ด่วน, ขอ, รบกวน, เรียน, follow up, action needed
- Reply required (asking question, requesting decision)
- From known clients/partners/team members

**OUT (skip)**:
- Newsletter / mailing list (List-Unsubscribe header)
- Marketing / promotion
- Social media notifications (LinkedIn, FB, Twitter, etc.)
- GitHub/automated CI/CD bots
- Receipts unless > 50,000฿

If unsure: include but mark `importance: "normal"`.

---

## Reply drafting guidelines

- Match the original email's language (Thai/English)
- Tone: warm, professional, concise (3-5 sentences max)
- For decision questions: provide a recommendation, not just "thanks let me think"
- For meeting requests: propose 2 alternative times if conflict
- For long threads: lead with TL;DR action
- ALWAYS sign as "ต้น" (or "Chaiwat" in EN) — don't use full signature block

---

## Travel time heuristics (v1)

- BKK in-city default: 30 min
- Cross-city BKK (Sukhumvit ↔ Bangna ↔ Rangsit): 45-60 min
- Out of BKK: 90+ min, prompt user to confirm
- First event of day: assume "from บ้าน" unless specified
- After previous event: assume "from previous location"

Compute `leave_at = time_start - duration_min - 10` (10 min buffer)

V2: integrate Google Maps Directions API for real traffic.

---

## LINE Flex notification (after push)

After `git push` succeeds, use the `line-message` skill with this Flex card payload:

```json
{
  "type": "flex",
  "altText": "🌅 Morning Brief — {weekday_th} {date}",
  "contents": {
    "type": "bubble",
    "size": "kilo",
    "header": {
      "type": "box", "layout": "vertical",
      "backgroundColor": "#08080F",
      "paddingAll": "16px",
      "contents": [
        { "type": "text", "text": "🌅 MORNING BRIEF", "color": "#F5D67A", "size": "sm", "weight": "bold" },
        { "type": "text", "text": "{weekday_th} · {date_thai}", "color": "#67E8F9", "size": "xs", "margin": "xs" }
      ]
    },
    "body": {
      "type": "box", "layout": "vertical", "spacing": "md", "paddingAll": "16px",
      "contents": [
        { "type": "text", "text": "📅 {events_today} นัดวันนี้{leave_text}", "size": "sm", "wrap": true },
        { "type": "text", "text": "📧 {important_emails} emails สำคัญ", "size": "sm" },
        { "type": "text", "text": "✅ {pending_tasks} tasks ค้าง", "size": "sm" },
        { "type": "separator", "margin": "md" },
        { "type": "text", "text": "📰 {top_news_source}: {top_news_title}", "size": "xs", "color": "#999", "wrap": true, "margin": "md" }
      ]
    },
    "footer": {
      "type": "box", "layout": "vertical", "paddingAll": "16px",
      "contents": [{
        "type": "button", "style": "primary", "color": "#E6B84B",
        "action": { "type": "uri", "label": "เปิด Full Brief", "uri": "https://tonpalearn.com/morning-brief/" }
      }]
    }
  }
}
```

Where `leave_text = " · ออก {first_leave_at}"` if any event has travel, otherwise "".

---

## Error handling

- If MCP fetch fails → use empty array for that section + log warning
- If encryption fails → exit 1, no push, send LINE "❌ Brief failed: {reason}"
- If git push fails → retry once, then log + LINE alert
- If LINE send fails → log only (don't fail the run)

Always commit + push EVEN IF some sections are empty — partial brief is better than none.
