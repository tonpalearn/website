# TONPALEARN · Booking v2 — Public Cohort + Private 1:1

> **Module:** `/booking/` v2 — 2 modes · Public cohort (Classic) + Private (1:1)
> **Admin:** new section in `/admin/` for cohort CRUD
> **Status:** v1 = Private 1:1 only (live) · v2 = adds Public cohort + scheduling rules
> **Owner:** ต้น (single-admin)
> **Updated:** May 2026

---

## 1. Problem Statement

ต้นมีสองโหมดการสอน:
1. **Private 1:1** (ตามวันเวลาที่ลูกค้าสะดวก) — มี /booking/ v1 แล้ว แต่ตอนนี้แสดง slot ยาว 4 ชม. ไม่ flexible
2. **Public Class (Classic)** — ต้นประกาศวันที่ → คน join → ครบ 4 คนถึงเปิดสอน

ปัญหา:
- ✗ ไม่มี Public mode — ต้นต้องประกาศใน LINE/FB เอง ไม่เก็บ booking center ที่เดียว
- ✗ ไม่มี "Pre-booking" state — ลูกค้าจอง+โอนเงิน แต่ไม่รู้ว่าจะมีหรือไม่
- ✗ Private slots ยาว 4 ชม. block ปฏิทินเกินจำเป็น
- ✗ ไม่มี early-bird pricing display
- ✗ ไม่ปกป้องระหว่างนัด — booking 2 รายชนกันได้ (ไม่มี buffer)

**Cost of not solving:**
- ขายไม่ scale — Private จองทีละคน · Public ใน LINE ไม่ track
- ลูกค้าไม่เชื่อใจ — โอนเงินแล้วลุ้นว่าจะเปิดไหม
- ต้นเหนื่อย — ทักหลายทาง ต้องตอบเรื่อง slot ใน LINE ทุกวัน

---

## 2. Goals

| # | Goal | Measurable |
|---|------|-----------|
| G1 | ลูกค้าเปิด `/booking/` → เห็น Public cohort ที่กำลังเปิดทันที (default tab) | Time-to-find-slot < 10 sec |
| G2 | Public class จองได้แม้ยังไม่ครบ — เป็น Pre-booking + Refund Guarantee | Conversion baseline → +30% |
| G3 | ครบ 4 คน → Badge "Confirmed" อัตโนมัติ + แจ้งทุกคน | 100% auto-confirm |
| G4 | Private slot ละเอียดเป็น **รายชั่วโมง** + buffer 1 ชม. ระหว่างนัด | ไม่มี booking ชนกัน · ไม่มี burnout |
| G5 | Admin สร้าง public cohort ใหม่ใน < 2 นาที (image + details + dates + price) | จับเวลา |

---

## 3. Non-Goals

| Non-Goal | Reason |
|----------|--------|
| Auto refund ผ่าน payment gateway | v1 manual · ต้นโอนคืน · gateway = v3 |
| Multi-currency / international booking | TH first |
| Recurring subscription | คลาสเป็น one-off เสมอ |
| Live streaming during class | Zoom ภายนอก · ไม่ใช่บนเว็บ |
| Email reminders | LINE OA ทำงานนี้แล้ว (P1: เพิ่ม) |
| Group discount (3+ คน private) | private = 1:1 by definition · group = ใช้ Public |

---

## 4. User Personas

| Persona | Description | Path |
|---------|-------------|------|
| **Public learner** | คนทั่วไป — อยากเรียนคอร์ส X · รอรอบเปิด · จองเป็นกลุ่ม | `/booking/?mode=public` (default) |
| **Private learner** | คนที่อยากเรียน 1:1 · เลือกวันเวลาเอง · งบสูงกว่า | `/booking/?mode=private` |
| **Admin (ต้น)** | สร้าง public cohort · ดู bookings · confirm/cancel | `/admin/?tab=cohorts` |

---

## 5. User Stories

### Public Cohort Visitor

- **เป็นคนที่อยากเรียน** ผมเปิด `/booking/` → เห็น **Public Class คลาสที่กำลังเปิด** เป็น default · cards พร้อมรูป course + ราคา + วันที่เรียน + ที่นั่งที่เหลือ
- **เป็นคนที่อยากเรียน** ผมอยากเห็นว่า cohort ไหน **Confirmed** (ครบแล้ว) vs **Pre-booking** (ยังไม่ครบ — แต่จองได้)
- **เป็นคนที่อยากเรียน** ผมอยากเห็น Early Bird price (ราคาพิเศษ) + วันที่หมดเขต Early Bird (countdown)
- **เป็นคนที่อยากเรียน** ผมอยากกด "Pre-Book" → ใส่ชื่อ/เบอร์/email → ส่ง slip โอนเงิน → ได้ confirmation
- **เป็นคนที่อยากเรียน** ผมอยากเห็น "ยังขาดอีก 2 คน" หรือ "✅ Confirmed · จะเรียนวันที่ 15 มิ.ย."
- **เป็นคนที่อยากเรียน** ถ้า cohort ไม่ครบจน expire (refund deadline) ต้นต้องคืนเงินผมเต็มจำนวน → policy ชัดเจน

### Private 1:1 Visitor

- **เป็นคนที่อยากเรียน** ผมเลือก format (Group/1:1/Onsite) → เห็น slot รายชั่วโมง 9:00, 10:00, 11:00, 13:00, 14:00 ...
- **เป็นคนที่อยากเรียน** ผมเลือก slot ไม่ได้ถ้ามี booking ในชั่วโมงก่อนหน้า/ถัดไป (buffer 1 ชม.) — เพื่อให้ต้นมีเวลาเตรียมตัว/พัก
- **เป็นคนที่อยากเรียน** ผมอยากเลือกเวลาเริ่ม + ระยะเวลา (2/3/4 ชม.) แทนแค่ block 4 ชม.

### Admin (ต้น)

- **เป็น Admin** ผมอยากสร้าง public cohort: course + วันเรียน + เวลา + ที่นั่ง (default 4) + ราคา + early bird price + early bird deadline + รูป cover + curriculum bullets
- **เป็น Admin** ผมอยากดู bookings ทุกอัน (Public + Private) แยกตามสถานะ
- **เป็น Admin** ผมอยาก **manual confirm** cohort ก่อนครบ 4 ก็ได้ (ถ้ารู้ว่าจะมีคนอีก)
- **เป็น Admin** ผมอยาก **cancel cohort** + แจ้ง refund ลูกค้าที่จองแล้ว
- **เป็น Admin** ผมอยาก clone cohort เก่าเพื่อเปิดรอบใหม่ในวันถัดไป

---

## 6. Requirements

### 6.1 Two-Tab UI (P0)

```
/booking/
┌──────────────────────────────────────────┐
│ [🎓 Public Class] [👤 Private 1:1]      │  ← Public = default · Tab toggle
├──────────────────────────────────────────┤
│                                          │
│ [Cohort Cards Grid OR Slot Picker]      │
│                                          │
└──────────────────────────────────────────┘
```

URL state: `/booking/?mode=public|private` (default `public`)
- Persist tab selection in localStorage
- Direct link friendly

### 6.2 Public Cohort Card (P0)

Each cohort renders as a card:
```
┌─────────────────────────────────┐
│ [Cover Image · 16:9]            │
│ ⭐ ยอดนิยม                       │  ← optional badge
│ ✅ CONFIRMED  หรือ  ⏳ PRE-BOOK  │  ← status badge top-right
├─────────────────────────────────┤
│ Course 02 · AI Agentic          │
│ 📅 15 มิ.ย. 2569 · 10:00–14:00 │
│ ⏱ 4 ชม. · 🎯 4 ที่นั่ง          │
│                                  │
│ 📌 จะได้เรียน:                  │
│  • [bullet 1]                   │
│  • [bullet 2]                   │
│  • [bullet 3]                   │
│                                  │
│ 💰 ราคา: ฿3,500                 │
│ 🔥 Early Bird: ฿2,500 (หมดเขต   │
│    7 มิ.ย. · เหลือ 5 วัน)      │
│                                  │
│ 👥 2 / 4 ที่นั่ง (ขาดอีก 2)     │
│ [Progress bar]                  │
│                                  │
│ [🛒 Pre-Book ฿2,500]           │
└─────────────────────────────────┘
```

Card states:
- **Pre-booking** — gold accent, "ขาดอีก N คน" + Early Bird flag if active
- **Confirmed** — teal accent, "✅ จะเรียนวันที่..." + "เหลือ N ที่นั่ง" if any
- **Full** — violet accent, "🔒 เต็มแล้ว" + show waitlist option (P1)
- **Past** — grayed out, hidden by default (filter toggle to show)

### 6.3 Cohort Confirmation Logic (P0)

| Trigger | Action |
|---------|--------|
| `seats_taken >= min_to_confirm` (default 4) | Auto status = `confirmed` + LINE notify all bookings |
| Admin clicks "Manual Confirm" | Same as above + reason logged |
| Day before `start_date` and `confirmed` | LINE reminder to all attendees |
| `seats_taken < min_to_confirm` AND past `refund_deadline` | Status = `cancelled` + LINE notify refund |
| Admin clicks "Cancel" | Status = `cancelled` + reason + LINE notify refund + admin action log |

Default `min_to_confirm`: 4 · per-cohort configurable
Default `refund_deadline`: 3 days before `start_date`

### 6.4 Pre-Booking Flow (P0)

```
Click "Pre-Book" → Modal:
  1. Customer form (name, phone, LINE ID, email)
  2. Show payment instructions (PromptPay QR + bank account)
     · Amount = early_bird if active, else regular price
  3. Upload slip
  4. Submit → booking saved with status='slip_uploaded'

Admin verifies slip → confirms payment:
  booking.status = 'paid' · cohort.seats_taken += 1
  IF seats_taken >= min_to_confirm:
    cohort.status = 'confirmed'
    LINE notify ALL bookings: "✅ Class ยืนยันแล้ว · เรียนวันที่..."
  ELSE:
    LINE notify booker: "✅ จองสำเร็จ · ยังขาดอีก N คนจะ confirm class"
```

### 6.5 Early Bird Logic (P0)

- Each cohort has 2 prices: `price_thb` (regular) + `early_bird_price_thb` (optional)
- `early_bird_deadline` (date) — if `now() <= deadline`, show Early Bird as active
- UI shows: regular price struck-through + EB price in gold + countdown "หมดเขต X วัน"
- Once deadline passes, EB price disappears from UI but record stays for booking history

### 6.6 Private Booking — Hourly Slots (P0)

Current: 4-hour blocks (10:00–14:00, 14:00–18:00)
**New:** Hourly slots — user picks start time + duration

Flow:
1. Pick course + format
2. Pick **duration** (1, 2, 3, or 4 hours — depends on course)
3. Pick **start time** — slots shown hourly (9:00, 10:00, 11:00, ...)
4. Available slots filtered to:
   - No existing booking/calendar event during the requested time range
   - AND no existing booking/calendar event within **1 hour buffer** before AND after

```
Example:
  Existing booking 14:00–16:00
  Requested 2-hour slot, start times shown:
    9:00 ✅  → ends 11:00 → 3hr gap before 14:00 ✓
    10:00 ✅ → ends 12:00 → 2hr gap before 14:00 ✓
    11:00 ❌ → ends 13:00 → 1hr gap before 14:00 — TOO TIGHT (need ≥1hr)
    12:00 ❌ → overlaps 14:00
    13:00 ❌ → overlaps 14:00
    16:00 ❌ → starts within 1hr of existing end 16:00 (need ≥1hr buffer)
    17:00 ✅ → starts 1hr after existing end 16:00 ✓ (≥1hr buffer)
```

API change: `/api/calendar-slots?date=YYYY-MM-DD&duration=N&mode=hourly`

### 6.7 Public Cohort Detail Page (P1)

Optional `/booking/c/<slug>` for SEO/sharing:
- Full curriculum + outcomes
- "What you'll learn" + "What you'll get" sections
- Instructor section (ต้น profile)
- Testimonials from previous cohorts (P2)
- Share buttons (LINE / Facebook)
- "View other cohorts" related list

### 6.8 Admin — Cohort CRUD (P0)

New tab in `/admin/`: **🎓 Cohorts**

List view:
| No. | Course | Date | Seats | Status | Revenue | Actions |
|-----|--------|------|-------|--------|---------|---------|
| C-2606-001 | 02 AI Agentic | 15 มิ.ย. | 2/4 | Pre-booking | ฿5,000 | View · Confirm · Cancel |

Create modal:
```
🎓 Public Cohort ใหม่
  Course [02 AI Agentic ▾]
  Format [Online Group ▾]
  Cover image URL [_______]   (placeholder if blank)
  Title [_______] (auto from course, editable)
  Start date [date picker]  Start time [time]
  Duration [4 hr]
  Regular price [3500] THB
  Early Bird price [2500] THB
  Early Bird deadline [date picker]
  Min seats to confirm [4]
  Max seats [10]
  Refund deadline [date — default 3 days before start]

  📝 จะเรียนอะไร (what you'll learn — markdown bullets)
  ----------------------------------------
  | • หลักการ AI Agent คืออะไร      |
  | • Setup Claude + MCP Connector  |
  | • Build first Agent             |
  ----------------------------------------

  🎁 จะได้อะไร (deliverables — markdown bullets)
  ----------------------------------------
  | • Working Agent code           |
  | • Slide deck                   |
  | • Cert + community access      |
  ----------------------------------------

  [ ] Published (visible at /booking)
  [ ] Featured (show ribbon "⭐ ยอดนิยม")
  [Save]
```

Actions:
- **View** → see all bookings in cohort
- **Confirm** → manual confirm before reaching min seats
- **Cancel** → with reason → LINE notify
- **Clone** → copy structure to new date
- **Edit** → all fields except date once first booking received

### 6.9 Bookings Tab Enhancements (P0)

Existing /admin/ doesn't have Bookings tab (only VDO). Add:
- **🧾 Bookings** tab — list all bookings (Public + Private)
- Filter: mode (all/public/private), status, date range, course
- Per row: customer, course, date, amount, status, **slip preview** (if uploaded)
- Action: Confirm payment (slip ok) · Reject (refund) · View detail

### 6.10 Schema additions (P0)

```sql
-- ──────────────────────────────────────
-- public_cohorts — scheduled cohorts
-- ──────────────────────────────────────
create table public_cohorts (
  id                uuid primary key default gen_random_uuid(),
  cohort_no         text unique,                    -- C-YYMM-NNN

  -- Course
  course_num        text not null,
  course_name       text not null,
  format            text not null,                  -- 'group' | 'onsite'
  format_label      text not null,

  -- Schedule
  start_date        date not null,
  start_time        text not null,                  -- '10:00'
  duration_hours    int default 4,

  -- Pricing
  price_thb         numeric not null,
  early_bird_price_thb numeric,
  early_bird_deadline  date,

  -- Seats
  min_to_confirm    int default 4,
  max_seats         int default 10,
  seats_taken       int default 0,                  -- denorm — updated by trigger on bookings

  -- Refund
  refund_deadline   date,                            -- default start_date - 3 days

  -- Content
  cover_url         text,
  title             text,                            -- override course_name if needed
  description       text,
  what_you_learn    jsonb default '[]'::jsonb,       -- array of bullet strings
  what_you_get      jsonb default '[]'::jsonb,
  notes             text,

  -- Display
  is_published      boolean default false,
  is_featured       boolean default false,
  sort_order        int default 0,

  -- Status (lifecycle)
  status            text default 'open'
                    check (status in ('open','confirmed','full','cancelled','completed')),
  confirmed_at      timestamptz,
  cancelled_at      timestamptz,
  cancel_reason     text,

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Extend bookings table
alter table bookings add column if not exists mode text default 'private'
  check (mode in ('private','public_cohort'));
alter table bookings add column if not exists cohort_id uuid references public_cohorts(id);
alter table bookings add column if not exists payment_amount numeric;       -- actual paid (could be EB)
alter table bookings add column if not exists is_early_bird boolean default false;

-- Trigger: when booking moves to 'paid' or 'confirmed' status,
-- bump cohort.seats_taken + auto-confirm cohort if threshold met
```

### 6.11 What Else for Complete Booking System (additions — recommended P1/P2)

| # | Feature | Priority | Why |
|---|---------|----------|-----|
| ADD-1 | Waitlist when full | P1 | คนรอ → next cohort autodeliver |
| ADD-2 | LINE OA reminder 24h before class | P1 | Reduce no-shows |
| ADD-3 | "Add to Calendar" (.ics) on confirmation | P1 | UX standard |
| ADD-4 | Share cohort link with referral code | P2 | Word of mouth |
| ADD-5 | Past cohorts archive page (social proof) | P1 | Trust signal |
| ADD-6 | Testimonials per cohort (after class) | P2 | Trust signal |
| ADD-7 | Group booking — book multiple seats at once | P1 | Friends together |
| ADD-8 | Refund policy modal at booking confirm | P0 | Legal clarity |
| ADD-9 | Auto cert issue after cohort completed | P1 | Reuse /certificate |
| ADD-10 | Calendar conflict check for student (P2) | P2 | If logged in, check their schedule |
| ADD-11 | Slip OCR auto-confirm (P2) | P2 | Reduce admin work |
| ADD-12 | "เปิดรอบเมื่อมีคนสนใจ" interest form | P1 | When no cohort scheduled |
| ADD-13 | PromptPay QR with amount on booking page | P0 (in) | UX critical |
| ADD-14 | Booking confirmation email + receipt | P1 | Records |
| ADD-15 | Cancel-by-customer flow (with policy) | P1 | Self-service |
| ADD-16 | Cohort capacity countdown bar | P0 (in) | FOMO + transparency |
| ADD-17 | Multiple early bird tiers (3 tiers price drop) | P2 | Pricing optimization |
| ADD-18 | Pre-call survey link | P2 | Set expectations |
| ADD-19 | Show "X คนกำลังดู" (live counter) | P2 | Social proof — be honest |
| ADD-20 | Featured testimonial above fold | P1 | Trust |

**Recommended P0 (included v1):** 8, 13, 16
**P1 to ship soon:** 1, 2, 3, 5, 7, 9, 12, 14, 15, 20
**P2 future:** 4, 6, 10, 11, 17, 18, 19

---

## 7. Success Metrics

### Leading (weekly)
- Visitors → Public cohort view-through: > 70%
- Pre-bookings per cohort: median ≥ 4
- Time from Pre-book → Confirmed status: median < 14 days
- Hourly private slot adoption: > 50% by week 4

### Lagging (monthly)
- Public cohort revenue / month: track absolute
- Confirmation rate of opened cohorts: > 70% (P0 target)
- Refund rate: < 10%
- Repeat booker rate (alumni): > 30%

---

## 8. Open Questions

| # | Q | Owner | Blocking? |
|---|---|-------|-----------|
| Q1 | Min seats default — 4 ที่ตั้งไว้ ถูกต้องไหม? คอร์สบางคอร์สอาจเปิดเร็วกว่า | ต้น | No — per-cohort configurable |
| Q2 | Refund deadline default — 3 days before? หรือ 7? | ต้น | No — configurable |
| Q3 | Early bird แต่ละ cohort ตั้งราคาเอง หรือมี rule fixed % off? | ต้น | No — per-cohort |
| Q4 | Public cohort ใช้ format อะไรได้บ้าง? (group only หรือ onsite ก็ได้?) | ต้น | No — both supported |
| Q5 | Refund policy text สำหรับใส่ใน modal | Legal/ต้น | No — default text v1 |
| Q6 | Buffer 1 hr ใช้กับ Public class ด้วยไหม? | ต้น | No — only Private (Public is fixed time) |

---

## 9. Timeline & Phasing

### Phase 1 — Core (this build, ~1 day)
1. Schema migration · `public_cohorts` table + bookings.mode + cohort_id
2. Update `/api/calendar-slots` — hourly mode + 1hr gap
3. Build `/booking/` v2 — 2-tab UI · Public cards (with image, details, price, early bird, seats, badge) · Private hourly slot picker
4. Build `/admin/` Cohorts tab — CRUD modal
5. Build `/admin/` Bookings tab — list + confirm/reject
6. Deploy + smoke test

### Phase 2 — Polish (week 2)
7. Refund policy modal
8. Add to Calendar (.ics) download
9. LINE OA reminder
10. Waitlist
11. Cancel-by-customer

### Phase 3 — P2
12. Past cohorts archive
13. Testimonials
14. Group booking
15. Slip OCR

---

## 10. Action Checklist

- [ ] **ต้น** answer Q1 (min seats default) — non-blocking
- [ ] **Engineering** run new SQL in Supabase Editor (will create migration file)
- [ ] **Engineering** build v2 modules (see Phase 1)
- [ ] **ต้น** create first 2-3 public cohorts via /admin (test with image URLs from /assets/covers/)
- [ ] **Design** finalize refund policy text
- [ ] **Engineering** test 1-hr buffer logic with edge cases

---

© 2026 TONPALEARN
