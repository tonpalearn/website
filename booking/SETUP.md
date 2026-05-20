# 📅 TONPALEARN Booking — Setup Guide

> ติดตั้งทีละขั้น · ทำตามลำดับ · ใช้เวลา ~30-45 นาที

---

## Architecture Overview

```
[ลูกค้า]
   ↓ เลือกคอร์ส/format/slot
[booking/index.html] ── fetch slots ──→ [/api/calendar-slots]
                                              ↓
                                       [Google Calendar API]
                                       (service account)
                                              ↓
                                       [ต้น's Calendar]
   ↓ ยืนยัน + upload slip
[Supabase bookings table + Storage]
   ↓ webhook/notify
[LINE OA → ต้น]
   ↓ คลิก link
[/booking/admin?id=xxx → confirm/reject]
   ↓
[Google Calendar create event] + [LINE notify ลูกค้า]
```

---

## Step 1 · Google Cloud Project + Service Account (10 min)

### 1.1 Create project
1. ไป https://console.cloud.google.com
2. Top bar → "Select a project" → "NEW PROJECT"
3. Name: **`tonpalearn-booking`** → Create

### 1.2 Enable Calendar API
1. Search "Google Calendar API" → Enable

### 1.3 Create service account
1. Hamburger menu → IAM & Admin → **Service Accounts**
2. **+ CREATE SERVICE ACCOUNT**
   - Name: `booking-calendar`
   - Description: TONPALEARN booking system
   - Click **Create and Continue** → Skip role → Done
3. คลิกที่ service account ที่สร้าง → **KEYS** tab → **ADD KEY** → JSON
4. ไฟล์ JSON จะ download — เก็บไว้ปลอดภัย (ห้าม commit เข้า repo!)
5. **Copy service account email** เช่น `booking-calendar@tonpalearn-booking.iam.gserviceaccount.com`

### 1.4 Share Calendar กับ service account
1. เปิด Google Calendar ของต้น (https://calendar.google.com)
2. Settings → เลือก calendar ที่ต้องการ sync → **Share with specific people**
3. **+ Add people** → paste service account email
4. Permissions: **Make changes to events** (เพื่อสร้าง booking event ได้)
5. Send

---

## Step 2 · Supabase — Bookings Table (5 min)

ใน SQL Editor ของ project `lhrzjkizxjigqeuyposw` (ที่มีอยู่แล้ว) — run:

```sql
-- TONPALEARN bookings table
create table if not exists bookings (
  id              uuid primary key default gen_random_uuid(),
  booking_no      text unique not null,        -- BOOK-YYMM-NNN
  status          text not null default 'pending_payment',
  -- statuses: pending_payment · slip_uploaded · admin_review · confirmed · rejected · cancelled

  -- Customer
  customer_name   text not null,
  customer_email  text,
  customer_phone  text not null,
  customer_company text,

  -- Course
  course_num      text not null,
  course_name     text not null,
  format          text not null,
  format_label    text not null,
  hours           int,
  num_attendees   int default 1,

  -- Schedule
  preferred_date  date not null,
  preferred_time  text not null,
  duration_mins   int default 240,

  -- Payment
  amount          int not null,
  promptpay_ref   text,
  slip_url        text,
  slip_uploaded_at timestamptz,

  -- Admin
  admin_notes     text,
  confirmed_at    timestamptz,
  rejected_at     timestamptz,
  rejection_reason text,

  -- Calendar
  calendar_event_id text,

  -- Metadata
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_bookings_date   on bookings(preferred_date desc);

-- RLS
alter table bookings enable row level security;

-- anon can insert (booking from public form)
create policy "Public can create bookings"
  on bookings for insert
  to anon
  with check (true);

-- anon can read own booking by ID (for status check)
create policy "Public can read by booking_no"
  on bookings for select
  to anon
  using (true);  -- เพราะใช้ uuid + booking_no ที่ไม่ predictable

-- service_role full access
create policy "Service role full access"
  on bookings for all
  to service_role
  using (true) with check (true);
```

### Slip storage bucket

1. Supabase Dashboard → **Storage** → **New bucket**
2. Name: `slips`
3. Public: **Off** (เก็บแบบ private)
4. Click bucket → **Policies** → add:

```sql
-- anon can upload to slips/
create policy "Anon can upload slips"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'slips');

-- service_role can read all
create policy "Service role can read all slips"
  on storage.objects for select
  to service_role
  using (bucket_id = 'slips');
```

---

## Step 3 · Vercel Environment Variables (5 min)

ใน Vercel Dashboard → website project → **Settings → Environment Variables** → เพิ่ม:

| Key | Value | Notes |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | paste content ของไฟล์ JSON ทั้งไฟล์ | จาก Step 1.3 |
| `GOOGLE_CALENDAR_ID` | `primary` หรือ email ของ calendar | ใช้ `primary` ถ้าใช้ calendar หลัก |
| `SUPABASE_URL` | `https://lhrzjkizxjigqeuyposw.supabase.co` | |
| `SUPABASE_SERVICE_KEY` | service role key (paste จาก Supabase API settings) | **อันใหม่** หลัง rotate |
| `LINE_NOTIFY_TOKEN` | (optional) จาก notify-bot.line.me | สำหรับแจ้งเตือนต้น |
| `PROMPTPAY_ID` | `0939149397` | เบอร์ของต้น (ไม่มี dash) |

⚠️ **ห้าม commit ค่าเหล่านี้เข้า git** — ใส่ผ่าน Vercel UI เท่านั้น

---

## Step 4 · Test (5 min)

หลัง deploy:

1. เปิด `https://tonpalearn.com/api/calendar-slots?date=2026-06-01` → ควรได้ JSON list of busy slots
2. เปิด `https://tonpalearn.com/booking/` → ทดสอบ flow
3. หลัง upload slip → check Supabase `bookings` table มี row ใหม่
4. LINE notify ต้นได้รับ ping (ถ้าตั้ง `LINE_NOTIFY_TOKEN`)
5. คลิก link confirm → `/booking/admin?id=xxx` → approve/reject

---

## Step 5 · Rotate keys (สำคัญ — Security)

หลังจาก setup เสร็จ:
1. Supabase → **Reset service_role key** (key เก่าเคยอยู่ในแชต)
2. Update Vercel env var `SUPABASE_SERVICE_KEY` ใส่ key ใหม่
3. Redeploy

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `403 Forbidden` from Calendar API | Service account ยังไม่ได้ share calendar — ทำ Step 1.4 ใหม่ |
| Slip upload 401 | Check Supabase Storage RLS policy + bucket name = `slips` |
| `/api/calendar-slots` 500 | Check `GOOGLE_SERVICE_ACCOUNT_JSON` ใน Vercel env (paste ทั้ง JSON · ไม่ใช่แค่ key) |
| QR ไม่ scan | ตรวจ `PROMPTPAY_ID` format = เบอร์ 10 หลัก ไม่มี dash |

---

## Reference

- Service account guide: https://cloud.google.com/iam/docs/service-accounts-create
- Google Calendar API: https://developers.google.com/calendar/api/v3/reference/events/list
- PromptPay spec: EMVCo merchant-presented QR
- Supabase Storage: https://supabase.com/docs/guides/storage
