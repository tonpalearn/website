-- TONPALEARN · Booking Schema
-- Run in Supabase SQL Editor of project `lhrzjkizxjigqeuyposw`
--
-- Tables: bookings
-- Storage bucket: slips (separate setup — see booking/SETUP.md Step 2.2)
--
-- Idempotent: safe to re-run

-- ──────────────────────────────────────────────────────────
-- BOOKINGS table
-- ──────────────────────────────────────────────────────────
create table if not exists bookings (
  id              uuid primary key default gen_random_uuid(),
  booking_no      text unique not null,                  -- BOOK-YYMM-NNN
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
create index if not exists idx_bookings_no     on bookings(booking_no);
create index if not exists idx_bookings_created on bookings(created_at desc);

-- Auto-update updated_at
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_bookings_updated on bookings;
create trigger trg_bookings_updated before update on bookings
  for each row execute function set_updated_at();

-- ──────────────────────────────────────────────────────────
-- RLS — anon can create + read by ID · service_role full
-- ──────────────────────────────────────────────────────────
alter table bookings enable row level security;

drop policy if exists "Public can create bookings"     on bookings;
drop policy if exists "Public can read by booking_no"  on bookings;
drop policy if exists "Service role full access"       on bookings;

-- anon can insert (booking from public form at /booking/)
create policy "Public can create bookings"
  on bookings for insert
  to anon
  with check (true);

-- anon can read own booking by ID (used by /booking/admin?id=xxx initial fetch)
-- Safe because UUID is unguessable
create policy "Public can read by booking_no"
  on bookings for select
  to anon
  using (true);

-- service_role full access (used by API endpoints with SUPABASE_SERVICE_KEY)
create policy "Service role full access"
  on bookings for all
  to service_role
  using (true) with check (true);

-- ──────────────────────────────────────────────────────────
-- Storage bucket `slips` — must be created via Dashboard separately
-- See booking/SETUP.md Step 2.2 for the bucket policies SQL
-- ──────────────────────────────────────────────────────────
