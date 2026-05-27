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
-- v2 (May 2026) — Public Cohorts + Private 1:1 split
-- ──────────────────────────────────────────────────────────

create table if not exists public_cohorts (
  id                uuid primary key default gen_random_uuid(),
  cohort_no         text unique,                     -- C-YYMM-NNN
  course_num        text not null,
  course_name       text not null,
  format            text not null,                   -- 'group' | 'onsite'
  format_label      text not null,
  start_date        date not null,
  start_time        text not null default '10:00',
  duration_hours    int default 4,
  price_thb         numeric not null,
  early_bird_price_thb numeric,
  early_bird_deadline  date,
  min_to_confirm    int default 4,
  max_seats         int default 10,
  seats_taken       int default 0,                   -- denorm
  refund_deadline   date,
  cover_url         text,
  title             text,
  description       text,
  what_you_learn    jsonb default '[]'::jsonb,
  what_you_get      jsonb default '[]'::jsonb,
  notes             text,
  is_published      boolean default false,
  is_featured       boolean default false,
  sort_order        int default 0,
  status            text default 'open'
                    check (status in ('open','confirmed','full','cancelled','completed')),
  confirmed_at      timestamptz,
  cancelled_at      timestamptz,
  cancel_reason     text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_cohorts_pub   on public_cohorts(is_published, start_date);
create index if not exists idx_cohorts_stat  on public_cohorts(status);
create index if not exists idx_cohorts_no    on public_cohorts(cohort_no);

drop trigger if exists trg_cohorts_updated on public_cohorts;
create trigger trg_cohorts_updated before update on public_cohorts
  for each row execute function set_updated_at();

-- Extend bookings table with v2 fields
alter table bookings add column if not exists mode text default 'private'
  check (mode in ('private','public_cohort'));
alter table bookings add column if not exists cohort_id uuid references public_cohorts(id);
alter table bookings add column if not exists payment_amount numeric;
alter table bookings add column if not exists is_early_bird boolean default false;
alter table bookings add column if not exists duration_hours int default 4;

create index if not exists idx_bookings_mode   on bookings(mode);
create index if not exists idx_bookings_cohort on bookings(cohort_id);

-- ──────────────────────────────────────────────────────────
-- Trigger: keep cohort.seats_taken in sync + auto-confirm
-- ──────────────────────────────────────────────────────────
create or replace function refresh_cohort_stats() returns trigger as $$
declare
  v_cohort_id uuid;
  v_taken int;
  v_cohort public_cohorts%rowtype;
begin
  v_cohort_id := coalesce(new.cohort_id, old.cohort_id);
  if v_cohort_id is null then return coalesce(new, old); end if;

  select count(*) into v_taken
  from bookings
  where cohort_id = v_cohort_id
    and status in ('confirmed', 'slip_uploaded');   -- count uploads + paid as taken seat

  update public_cohorts
  set seats_taken = v_taken,
      status = case
        when status = 'cancelled' then 'cancelled'
        when v_taken >= max_seats then 'full'
        when v_taken >= min_to_confirm then 'confirmed'
        else 'open'
      end,
      confirmed_at = case
        when status != 'confirmed' and v_taken >= min_to_confirm and confirmed_at is null then now()
        else confirmed_at
      end
  where id = v_cohort_id;

  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists trg_bookings_cohort_stats on bookings;
create trigger trg_bookings_cohort_stats
  after insert or update or delete on bookings
  for each row execute function refresh_cohort_stats();

-- Public read for published cohorts (anon can browse /booking)
drop policy if exists "Anon read published cohorts" on public_cohorts;
alter table public_cohorts enable row level security;

create policy "Anon read published cohorts"
  on public_cohorts for select
  to anon
  using (is_published = true);

drop policy if exists "Service role full cohorts" on public_cohorts;
create policy "Service role full cohorts"
  on public_cohorts for all
  to service_role
  using (true) with check (true);

grant select on public_cohorts to anon;

-- ──────────────────────────────────────────────────────────
-- Storage bucket `slips` — must be created via Dashboard separately
-- See booking/SETUP.md Step 2.2 for the bucket policies SQL
-- ──────────────────────────────────────────────────────────
