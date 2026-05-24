# TONPALEARN · VDO Learning + Arsenal Shop

> **Modules:** `/vdo/` (learner) · `/admin/` (admin) · `/arsenal/` (prompt pack shop)
> **Status:** v1 build (May 2026)
> **Owner:** ต้น (single-admin)
> **Updated:** May 2026

---

## 1. Problem Statement

ลูกค้าหลายคนอยากเรียนคอร์ส TONPALEARN แต่:
- มาเรียน live ไม่ได้ (เวลาไม่ตรง)
- อยู่ต่างจังหวัด/ต่างประเทศ
- งบไม่พอจ้าง 1:1
- อยากทบทวนหลังเรียน live

ต้นมี **VDO บันทึก class จริง** อยู่บน YouTube unlisted แต่ไม่อยากปล่อยให้ใครก็ดูฟรี — ต้องขายเป็น **package** + ป้องกันการแชร์ URL กันเอง

นอกจาก VDO ต้นยังมี **prompt packs** จากการทำงานจริง (สำหรับ ABO, IT Audit, Sales, Coach) ที่อยากขายแยกเป็น **Arsenal** (คลังแสง)

**Cost of not solving:**
- VDO มูลค่ามหาศาลแต่ยังขายไม่ได้ system
- Manual fulfill ทุกครั้งใช้เวลา · ไม่ scale
- ลูกค้ารอนาน · ปิดดีลช้า

---

## 2. Goals

| # | Goal | Measurable |
|---|------|-----------|
| G1 | ลูกค้าจ่ายเงิน → ได้ ticket → เรียนได้ใน < 5 นาที | Time from payment → first play < 5 min |
| G2 | กัน casual theft ของ YouTube URL | ผู้ใช้ทั่วไป (>90%) ขโมยลิงก์ไม่ได้ใน 1 click |
| G3 | Admin ออก ticket + จัดการ course/episode ใน 1 หน้า | < 30 วินาที per ticket |
| G4 | Burn logic แม่นยำ — ticket type 'count' หรือ 'days' หมดอายุตามจริง | 0 ticket leak (เกินสิทธิ์) |
| G5 | Arsenal Prompt Pack ขายแยก + bundle ได้ | 1+ packs sold within first month |

---

## 3. Non-Goals

| Non-Goal | Reason |
|----------|--------|
| Payment gateway (Stripe/Omise/etc) | v1 ใช้ LINE manual · ลูกค้าโอน → admin issue · gateway = v2 |
| Full user account (email/password) | Ticket-only · ไม่ต้อง onboarding/login flow ซับซ้อน |
| DRM-grade VDO protection | YouTube unlisted + obfuscation ก็พอกัน casual · ไม่กัน determined hacker |
| Live cohort / scheduled cohort | คอร์สสด = อีกช่องทาง (existing) · /vdo focuses async only |
| Quizzes / assessments | v1 ไม่มี · เรียนเสร็จ + watch time = "complete" ก็พอ (v2 add quiz) |
| Multi-instructor / marketplace | Solo founder · ไม่ multi-vendor |
| Bilingual (EN) v1 | TH first · EN P2 |
| Mobile app | Web responsive ดีพอ |

---

## 4. User Personas

| Persona | Description | Path |
|---------|-------------|------|
| **ต้น (Admin)** | Sole admin — gen ticket, manage course/episode/arsenal, view stats | `/admin/` |
| **ลูกค้าจ่ายแล้ว** | มี ticket — เรียน VDO ของคอร์สที่ซื้อ | `/vdo/?t=<code>` |
| **ลูกค้าใหม่ (Browser)** | ดู preview, อ่าน detail, ทักไลน์ซื้อ | `/vdo/` (no ticket) |
| **Prompt-pack buyer** | ซื้อ Arsenal pack ไป use ใน workflow ตัวเอง | `/arsenal/` |
| **Affiliate (P2)** | คน refer · ได้ commission | n/a v1 |

---

## 5. User Stories

### Admin (ต้น)

- **เป็น Admin** ผมอยาก gen ticket ในนาทีเดียว — กรอกลูกค้า, เลือก ticket type (count/days/unlimited), เลือกคอร์สที่ให้ entitle → ได้ code copy ส่งไลน์
- **เป็น Admin** ผมอยากเห็น dashboard: tickets active, plays today, top courses, revenue MTD
- **เป็น Admin** ผมอยาก revoke ticket ที่ออกผิด (เปลี่ยน status → revoked)
- **เป็น Admin** ผมอยาก search ticket ด้วย customer name / phone / LINE ID
- **เป็น Admin** ผมอยาก CRUD course + episode — paste YouTube video ID, ใส่ title, duration, resources
- **เป็น Admin** ผมอยาก mark "preview" บาง episode เพื่อให้ non-ticket viewer ดูได้ (sample)
- **เป็น Admin** ผมอยาก CRUD Arsenal pack — title, description, count, price, sample prompts (3 ตัว), full download link

### Ticket holder (ลูกค้า)

- **เป็น viewer** ผมอยาก paste ticket code ครั้งแรก → ระบบจำใน browser → ไม่ต้องกรอกซ้ำ
- **เป็น viewer** ผมอยากเห็นคอร์สที่ผม entitle และเล่นได้ทันที
- **เป็น viewer** ผมอยากเห็นว่า ticket เหลือกี่วัน / กี่ครั้ง
- **เป็น viewer** ผมอยากกด episode ถัดไปอัตโนมัติเมื่อจบ
- **เป็น viewer** ผมอยากเปิด resources (PDF/code) ของ episode ดู
- **เป็น viewer** ผมไม่ต้องการให้ใครขโมย URL VDO ของผม (กลัวคนอื่นเอาไปดูฟรี)

### Non-ticket visitor

- **เป็น visitor** ผมอยากเห็น catalog ของคอร์สทั้งหมด + ราคา
- **เป็น visitor** ผมอยากดู preview episode (1-2 ตอนแรก) ฟรี
- **เป็น visitor** ผมอยากกด "ซื้อคอร์ส" → ทักไลน์พร้อม pre-filled message (ระบุคอร์สที่อยากซื้อ)

### Arsenal buyer

- **เป็น buyer** ผมอยากดู prompt pack + อ่าน sample 3 ตัวก่อนซื้อ
- **เป็น buyer** ผมอยากเห็นว่าใน pack มีอะไรบ้าง (count, category, use cases)
- **เป็น buyer** ผมอยากกด "ซื้อ" → ทักไลน์พร้อม pre-filled message

---

## 6. Requirements

### 6.1 Ticket System (P0)

| Req | Description | AC |
|-----|-------------|----|
| TKT-1 | Ticket code format | `TPL-XXXX-XXXX` (12 chars alphanumeric · readable) — auto-gen unique |
| TKT-2 | 3 ticket types | `count` (max_plays), `days` (expires_at), `unlimited` (no limit) |
| TKT-3 | Burn logic | Play burns 1 count when watch > 30 sec (debounce: same episode within 24 hr = same burn) |
| TKT-4 | Expiration | If type=days, expires_at = redeemed_first_at + N days · auto-status='expired' on cron |
| TKT-5 | Multi-course entitle | Junction table — 1 ticket → many courses |
| TKT-6 | Anonymous redemption | Code entered → cookie stores `ticket_code` + `device_fingerprint` |
| TKT-7 | Status: active/consumed/expired/revoked | UI shows clearly + reason |
| TKT-8 | Revoke by admin | One-click — ticket status='revoked' · viewer denied immediately |
| TKT-9 | Issue log | Each ticket records: created_at, customer_name, phone, line_id, notes, issued_by |
| TKT-10 | Customer-friendly receipt | After issue, admin can copy: "สวัสดีครับ คุณ X · ticket: TPL-XXXX-XXXX · ใช้เข้าคอร์ส ABC ที่ tonpalearn.com/vdo · เหลือ 30 วัน" |

### 6.2 Course & Episode (P0)

| Req | Description | AC |
|-----|-------------|----|
| CRS-1 | Course CRUD | Slug, title TH/EN, description, cover image, level, hours, price, category, sort_order |
| CRS-2 | Episode CRUD | episode_no, title, duration, YouTube video ID, description, resources jsonb |
| CRS-3 | Preview flag | Per-episode boolean — preview episodes viewable without ticket |
| CRS-4 | Published toggle | Draft → published — hidden from /vdo if draft |
| CRS-5 | Episode resources | jsonb array of `{ title, url, type: 'pdf'/'code'/'link' }` |
| CRS-6 | Sort order | Drag-to-reorder episodes (P1 · v1 manual sort_order number) |

### 6.3 YouTube Anti-Theft (P0 — best effort)

**Strategy:** 4-layer obfuscation, raises bar against casual theft

| Layer | What |
|-------|------|
| 1. Iframe dynamic load | Don't render `<iframe src="...">` in initial HTML — inject src **after** ticket verified |
| 2. Embed parameters | `?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&controls=1&fs=1&disablekb=1` — minimize YouTube branding |
| 3. Watermark overlay | Always-visible TONPALEARN logo + ticket code partial (e.g., "TPL-XXXX-****") at low opacity over player |
| 4. UI deterrents | Disable right-click on player wrapper · prevent text selection · block iframe inspector with overlay layer |

**What we acknowledge:** Determined users can still:
- Open browser dev tools → find YouTube embed URL
- Use yt-dlp on the embed URL
- Screen record

**Mitigations beyond v1 (P2):**
- Vimeo Pro with domain whitelist
- Cloudflare Stream signed URLs
- DRM (Widevine) — overkill for our scale

**Server-side defense (P1):**
- Server proxies YouTube embed via signed cookie · adds session token
- Watermark personalization per session (renders user's ticket prefix)

### 6.4 VDO Player Page (P0)

- Sticky top bar — back to course, episode title, "ตอนถัดไป" pre-loaded
- Player area — 16:9 responsive, max 960px
- Below player — tabs: 📋 รายละเอียด · 📥 Resources · 💬 LINE (Q&A)
- Watermark overlay — TONPALEARN logo + first 4 chars of ticket
- Auto-resume — `localStorage[ episodeId ] = lastSecond`
- Auto-advance — 5-sec countdown to next episode on end
- Watch event logged every 30 sec → `view_logs` table

### 6.5 Ticket Entry UX (P0)

- `/vdo` first visit:
  - Hero: "ดูคอร์ส TONPALEARN ผ่าน VDO"
  - Input: "🎟 มี Code Ticket แล้ว — กรอกที่นี่"
  - Button: "ดู catalog" (browse mode)
- Code valid → cookie saves → redirects to entitled courses
- Code invalid → "ไม่พบ ticket นี้ — เช็คอีกครั้ง หรือ ทักไลน์ @tonpalearn"
- Top bar shows ticket info: "🎟 TPL-XXXX-XXXX · เหลือ 12 ครั้ง" (or "เหลือ 25 วัน")
- "ลบ ticket" button — clears cookie

### 6.6 Course Catalog & Shop (P0)

- Browse mode (no ticket) — shows all published courses
- Each course card:
  - Cover image
  - Title + 1-line description
  - Episode count + total duration
  - Price tags (Group / Private / On-site / **VDO**)
  - "🔓 เข้าเรียน" (if entitled) OR "🛒 ซื้อคอร์ส" → LINE deep link
  - "▶ ดู Preview" if course has preview episodes
- Filter chips: All / Beginner / Intermediate / Advanced / Custom

### 6.7 Admin Panel (P0)

**Auth:** Same pattern as `/billing` — paste service_role key in Settings, stored in localStorage.

**Sections:**
1. **Dashboard** — KPI tiles: active tickets, plays today/week, top 5 courses, revenue MTD
2. **Tickets** — list (search by code/customer), create modal, revoke action
3. **Courses** — list, create/edit (nested episodes)
4. **Episodes** — list (filter by course), CRUD, preview toggle
5. **Arsenal** — Prompt pack CRUD
6. **Orders** — manual entry: customer paid → log → gen ticket
7. **Settings** — Supabase config

**Ticket Generate Flow (most-used):**
```
[+ Generate Ticket]
  → Modal:
    Customer Name [____]
    Phone [____]  LINE ID [____]
    Type: [(•) Count [10] times | ( ) Days [30] days | ( ) Unlimited ]
    Courses entitled (multi-select chips):
      ☑ 01 AI Basic   ☑ 02 AI Agentic   ☐ 03 MCP   ...
    Notes [____]
  → [Generate] →
    Modal shows: TPL-AB12-CD34 ✓ (copy button)
    + Pre-filled LINE message ready to paste
```

### 6.8 Arsenal Shop (P0)

- `/arsenal/` page — grid of prompt packs
- Each pack card:
  - Title + cover image (or gradient placeholder)
  - Description
  - Prompt count (e.g., "30 prompts")
  - 3 sample prompts visible (truncated 2 lines each)
  - Price + "🛒 ซื้อ" → LINE deep link
- Categories: Marketing · Sales · Coach · IT Audit · Personal Assistant · Content
- Filter chips by category
- Detail view (modal) — full sample of 3 prompts + use cases

### 6.9 Order Flow (Manual Payment) (P0)

```
Visitor → /vdo or /arsenal
  → Click "ซื้อ" on item
  → LINE deep link opens with pre-filled message:
    "สนใจซื้อ [Course Name / Pack Name] · ราคา X บาท"
  → ลูกค้าโอนเงิน → ส่งสลิป
  → Admin opens /admin
    → Tickets tab → + Generate Ticket
    → Fill customer + entitlements + type
    → Copy code → paste back in LINE chat
  → ลูกค้าได้ code → enters at /vdo → เรียน
```

### 6.10 What Else Should be Included (recommended additions — P1/P2)

| # | Feature | Priority | Reason |
|---|---------|----------|--------|
| ADD-1 | **Free preview episodes** | P0 (included) | คนตัดสินใจซื้อง่ายขึ้น — try before buy |
| ADD-2 | **Auto-issue certificate** on course completion | P1 | Reuse existing `/certificate/` — ขายต่อ corporate ได้ |
| ADD-3 | **Downloadable resources** per episode | P0 (included) | PDF/code/prompt files — added value |
| ADD-4 | **Resume from last position** | P0 (included) | UX cliché but essential |
| ADD-5 | **Auto-advance to next episode** | P0 (included) | Watch time + completion rate up |
| ADD-6 | **Watch streak tracker** | P2 | Gamification — see consecutive days |
| ADD-7 | **Per-course progress %** | P1 | Display "เรียนไป 6/12 episode (50%)" |
| ADD-8 | **Bundle pricing** (e.g., 3 courses = -20%) | P1 | Increase AOV |
| ADD-9 | **Coupon codes** | P2 | Promo campaigns |
| ADD-10 | **Affiliate / referral tracking** | P2 | Word of mouth growth |
| ADD-11 | **Email drip** post-payment (reminders to start, halfway, finish) | P2 | Engagement |
| ADD-12 | **LINE OA Q&A** button per episode | P0 (included) | "ถามต้น" deep link with episode context |
| ADD-13 | **Course discussion comments** | P2 | Community feel · มี moderation overhead |
| ADD-14 | **Watch history page** for ticket | P1 | "Continue learning" UX |
| ADD-15 | **Bookmark / notes** per episode | P1 | Power user feature |
| ADD-16 | **Mobile-first responsive player** | P0 (included) | 50%+ mobile traffic |
| ADD-17 | **PromptPay QR on order page** | P1 | Auto QR with amount |
| ADD-18 | **Order tracking link** for customer | P2 | After payment → wait state UI |
| ADD-19 | **Search across courses** | P1 | Find by topic |
| ADD-20 | **"คอร์สถัดไปแนะนำ"** based on what they bought | P1 | Cross-sell |
| ADD-21 | **Watch time leaderboard** (anonymous) | P2 | Fun engagement signal |
| ADD-22 | **Course rating + reviews** (anonymized) | P2 | Social proof |
| ADD-23 | **Limited-time discount banner** | P1 | Urgency |
| ADD-24 | **Gift ticket** (ส่งให้คนอื่น) | P2 | Holiday season |

**Recommended P0 (in v1 already):** 1, 3, 4, 5, 12, 16
**Recommended P1 to ship within 1 month:** 2, 7, 8, 14, 15, 17, 19, 20, 23
**P2 / future:** 6, 9, 10, 11, 13, 18, 21, 22, 24

---

## 7. Data Model

```sql
-- TICKETS
create table tickets (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,                   -- 'TPL-AB12-CD34'
  ticket_type   text not null check (ticket_type in ('count','days','unlimited')),
  max_plays     int,                                     -- null if days/unlimited
  plays_used    int default 0,
  expires_at    timestamptz,                             -- null if count/unlimited
  redeemed_first_at timestamptz,                         -- set on first /vdo visit with this code
  status        text default 'active'                    -- 'active'|'consumed'|'expired'|'revoked'
                check (status in ('active','consumed','expired','revoked')),
  customer_name text, customer_phone text,
  customer_line_id text, customer_email text,
  notes         text,
  issued_by     text default 'admin',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index on tickets(code);
create index on tickets(status);
create index on tickets(expires_at);

-- COURSES
create table vdo_courses (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,                    -- '01-ai-basic'
  title         text not null,                           -- 'AI Basic · เริ่มต้นแบบไม่ติดศัพท์'
  title_en      text,
  description   text,
  cover_url     text,
  thumbnail_url text,
  level         text,                                     -- 'beginner'|'intermediate'|'advanced'
  category      text,
  hours_total   numeric,                                  -- denorm
  episode_count int default 0,                            -- denorm
  price_thb     numeric,
  is_published  boolean default false,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- EPISODES
create table vdo_episodes (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references vdo_courses(id) on delete cascade,
  episode_no    int not null,
  title         text not null,
  description   text,
  youtube_video_id text not null,                        -- e.g., 'dQw4w9WgXcQ'
  duration_seconds int,
  resources     jsonb default '[]'::jsonb,               -- [{ title, url, type }]
  is_preview    boolean default false,                    -- viewable without ticket
  is_published  boolean default true,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create unique index on vdo_episodes(course_id, episode_no);

-- TICKET ENTITLEMENTS (which courses can this ticket access)
create table ticket_courses (
  ticket_id uuid references tickets(id) on delete cascade,
  course_id uuid references vdo_courses(id) on delete cascade,
  primary key (ticket_id, course_id)
);

-- VIEW LOGS (for burn logic + analytics)
create table view_logs (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid references tickets(id) on delete cascade,
  episode_id  uuid references vdo_episodes(id) on delete cascade,
  course_id   uuid references vdo_courses(id) on delete cascade,
  device_fp   text,                                       -- browser fingerprint hash
  watched_at  timestamptz default now(),
  duration_seconds int default 0,                         -- accumulate per ping
  completed   boolean default false,
  counted_as_play boolean default false                    -- true once threshold crossed (30s)
);

create index on view_logs(ticket_id, watched_at desc);
create index on view_logs(episode_id);

-- ARSENAL PROMPT PACKS
create table arsenal_packs (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  category      text,                                     -- 'Marketing','Sales','Coach', etc.
  cover_url     text,
  prompt_count  int default 0,
  sample_prompts jsonb default '[]'::jsonb,              -- [{ title, body }]  — 3 samples
  download_url  text,                                     -- gated — only shown after purchase
  price_thb     numeric,
  is_published  boolean default false,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ORDERS (manual tracking)
create table vdo_orders (
  id            uuid primary key default gen_random_uuid(),
  order_no      text unique,                              -- 'VDO-YYMM-NNN'
  type          text not null,                            -- 'vdo_course'|'arsenal_pack'|'bundle'
  item_ids      text[],                                   -- array of slugs
  item_titles   text[],                                   -- denorm for receipt
  customer_name text, customer_phone text,
  customer_line_id text, customer_email text,
  amount_thb    numeric,
  payment_method text default 'bank_transfer',
  payment_ref   text,
  slip_url      text,
  ticket_id     uuid references tickets(id),              -- linked once issued
  status        text default 'pending'                    -- 'pending'|'paid'|'fulfilled'|'cancelled'
                check (status in ('pending','paid','fulfilled','cancelled')),
  notes         text,
  created_at    timestamptz default now(),
  paid_at       timestamptz,
  fulfilled_at  timestamptz
);

create index on vdo_orders(status);

-- RLS — admin only
alter table tickets enable row level security;
alter table vdo_courses enable row level security;
alter table vdo_episodes enable row level security;
alter table ticket_courses enable row level security;
alter table view_logs enable row level security;
alter table arsenal_packs enable row level security;
alter table vdo_orders enable row level security;

-- Service role full
create policy "Service full" on tickets         for all to service_role using (true) with check (true);
create policy "Service full" on vdo_courses     for all to service_role using (true) with check (true);
create policy "Service full" on vdo_episodes    for all to service_role using (true) with check (true);
create policy "Service full" on ticket_courses  for all to service_role using (true) with check (true);
create policy "Service full" on view_logs       for all to service_role using (true) with check (true);
create policy "Service full" on arsenal_packs   for all to service_role using (true) with check (true);
create policy "Service full" on vdo_orders      for all to service_role using (true) with check (true);

-- Anon — public reads for published courses/episodes (browse mode) + arsenal
create policy "Anon read pub courses"   on vdo_courses    for select to anon using (is_published = true);
create policy "Anon read pub episodes"  on vdo_episodes   for select to anon using (is_published = true);
create policy "Anon read pub arsenal"   on arsenal_packs  for select to anon using (is_published = true);
```

---

## 8. URL Structure

```
/vdo/                            → catalog + ticket gate
/vdo/?t=<CODE>                   → redeem ticket from URL (deep link)
/vdo/c/<course_slug>             → course detail + episode list
/vdo/c/<course_slug>/e/<ep_no>   → episode player

/arsenal/                        → prompt pack shop

/admin/                          → admin dashboard
/admin/?tab=tickets              → quick deep link
```

---

## 9. Success Metrics

### Leading (weekly)
- Tickets issued per week: track baseline → +50% over 3 months
- /vdo visitors per week (track sessions)
- /vdo → /arsenal cross-flow: > 10% click-through
- Time to first play (after ticket issued): median < 5 min
- Free preview episode completion rate: > 30%

### Lagging (monthly)
- VDO revenue / month: track absolute
- Arsenal pack revenue / month
- Avg ticket lifetime value (revenue per customer over 6 mo)
- Ticket usage rate: % of issued tickets that play ≥ 1 episode within 7 days
- Course completion rate (% of entitled who finish 80%+)

---

## 10. Open Questions

| # | Q | Owner | Blocking? |
|---|---|-------|-----------|
| Q1 | Final pricing per course on /vdo? (เท่าไหร่ต่อคอร์ส) | ต้น | Yes — display on catalog |
| Q2 | Bundle pricing สำหรับ 3-5 คอร์ส? | ต้น | No — v1 single-course only |
| Q3 | Trial preview — กี่ episode ต่อคอร์ส? | ต้น | No — default 1-2 |
| Q4 | LINE OA pre-filled message template | ต้น | No — generic OK v1 |
| Q5 | จะใส่ refund policy ไหม? | Legal | No — default no refund |
| Q6 | VDO completion → auto-issue cert ผ่าน existing /certificate? | Eng | No — P1 |

---

## 11. Timeline & Phasing

### Phase 1 (week 1) — MVP P0
1. Schema migration (supabase-schema-vdo.sql)
2. /vdo/ page — ticket gate, catalog, course detail, player with obfuscation
3. /admin/ page — tickets + courses + episodes CRUD
4. /arsenal/ — basic grid + LINE CTA
5. Deploy

### Phase 2 (week 2-3) — Polish
6. Bundle pricing
7. Auto cert issue on completion
8. PromptPay QR
9. Watch history + "Continue learning"
10. Notes/bookmarks

### Phase 3 (P2)
11. Payment gateway integration (Stripe/Omise)
12. Email drip
13. Affiliate tracking
14. Coupons
15. Vimeo/Cloudflare Stream migration (if scale demands)

---

## 12. Action Checklist

- [ ] **ต้น** finalize pricing (Q1) — display blocking
- [ ] **ต้น** record/upload preview episode VDO IDs (1-2 per course)
- [ ] **Engineering** run `supabase-schema-vdo.sql` in Supabase SQL Editor
- [ ] **Engineering** build /vdo, /admin, /arsenal (Phase 1)
- [ ] **ต้น** seed first 2-3 courses + episodes in /admin
- [ ] **ต้น** create 5 sample arsenal packs (Marketing/Sales/Coach/IT/PA)
- [ ] **Design** cover images per course (reuse course covers in /assets/covers/)
- [ ] **Engineering** test ticket lifecycle: gen → redeem → burn → expire
- [ ] **Engineering** verify YouTube anti-theft layers work (manual test inspect element)

---

© 2026 TONPALEARN
