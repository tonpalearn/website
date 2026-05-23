-- TONPALEARN · Billing + CRM Schema
-- Run in Supabase SQL Editor of project `lhrzjkizxjigqeuyposw`
--
-- 5 tables: customers · quotations · invoices · receipts · course_enrollments
-- All admin-only via service_role · receipts allow public read (for verify use)

-- ──────────────────────────────────────────────────────────
-- 1) CUSTOMERS · central CRM
-- ──────────────────────────────────────────────────────────
create table if not exists customers (
  id              uuid primary key default gen_random_uuid(),
  customer_no     text unique,                     -- CUST-YYMM-NNN auto
  type            text default 'individual',       -- 'individual' | 'company'
  name            text not null,
  tax_id          text,
  phone           text,
  email           text,
  address         text,
  company         text,                            -- for individuals' employer
  contact_person  text,                            -- for company customers
  industry        text,                            -- Retail / Hotel / Manufacturer / etc.
  source          text,                            -- 'LINE' | 'Referral' | 'Direct' | 'Web' | etc.
  tags            text[],                          -- flexible tagging
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_customers_name    on customers(name);
create index if not exists idx_customers_phone   on customers(phone);
create index if not exists idx_customers_email   on customers(email);

-- ──────────────────────────────────────────────────────────
-- 2) QUOTATIONS
-- ──────────────────────────────────────────────────────────
create table if not exists quotations (
  id               uuid primary key default gen_random_uuid(),
  quote_no         text unique not null,           -- TPL-YYMM-NNN
  customer_id      uuid references customers(id) on delete set null,
  status           text default 'draft',           -- draft|sent|accepted|declined|expired|invoiced
  issue_date       date,
  valid_days       int default 30,
  valid_until      date,

  -- Snapshot customer info (for historical accuracy)
  customer_snapshot jsonb,

  -- Line items
  items            jsonb default '[]'::jsonb,
  discounts        jsonb default '[]'::jsonb,

  -- Tax handling
  use_wht          boolean default false,
  wht_rate         numeric default 3,

  terms            text,
  notes            text,

  -- Calculated totals (denormalized for query speed)
  subtotal         numeric default 0,
  total_discount   numeric default 0,
  net_total        numeric default 0,
  wht_amount       numeric default 0,
  amount_to_pay    numeric default 0,

  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_quotations_customer on quotations(customer_id);
create index if not exists idx_quotations_status   on quotations(status);
create index if not exists idx_quotations_issue    on quotations(issue_date desc);

-- ──────────────────────────────────────────────────────────
-- 3) INVOICES · ใบวางบิล
-- ──────────────────────────────────────────────────────────
create table if not exists invoices (
  id               uuid primary key default gen_random_uuid(),
  invoice_no       text unique not null,           -- INV-YYMM-NNN
  quotation_id     uuid references quotations(id),
  customer_id      uuid references customers(id) on delete set null,

  status           text default 'pending',         -- pending|sent|paid|overdue|cancelled
  issue_date       date,
  due_date         date,                           -- usually issue_date + 30

  customer_snapshot jsonb,
  items            jsonb default '[]'::jsonb,
  discounts        jsonb default '[]'::jsonb,

  -- VAT (only if vendor VAT-registered)
  has_vat          boolean default false,
  vat_rate         numeric default 7,
  vat_amount       numeric default 0,

  -- WHT (if customer withholds)
  use_wht          boolean default false,
  wht_rate         numeric default 3,
  wht_amount       numeric default 0,

  subtotal         numeric default 0,
  total_discount   numeric default 0,
  net_total        numeric default 0,              -- before VAT + WHT
  grand_total      numeric default 0,              -- after VAT, before WHT (amount on invoice)
  amount_to_pay    numeric default 0,              -- after WHT (what customer actually transfers)

  -- Payment tracking
  paid_at          timestamptz,
  payment_method   text,                           -- transfer | promptpay | cash | other
  payment_ref      text,
  slip_url         text,

  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_invoices_customer  on invoices(customer_id);
create index if not exists idx_invoices_status    on invoices(status);
create index if not exists idx_invoices_due       on invoices(due_date);
create index if not exists idx_invoices_quotation on invoices(quotation_id);

-- ──────────────────────────────────────────────────────────
-- 4) RECEIPTS · ใบรับเงิน / ใบกำกับภาษี-ใบเสร็จ
-- ──────────────────────────────────────────────────────────
create table if not exists receipts (
  id               uuid primary key default gen_random_uuid(),
  receipt_no       text unique not null,           -- RCP-YYMM-NNN
  doc_type         text default 'receipt',         -- 'receipt' (ใบรับเงิน) | 'tax_invoice' (ใบกำกับภาษี/ใบเสร็จ)
  invoice_id       uuid references invoices(id),
  customer_id      uuid references customers(id) on delete set null,

  issue_date       date,
  customer_snapshot jsonb,
  items            jsonb default '[]'::jsonb,

  -- Match invoice tax handling
  has_vat          boolean default false,
  vat_amount       numeric default 0,
  wht_amount       numeric default 0,

  subtotal         numeric default 0,
  net_total        numeric default 0,
  grand_total      numeric default 0,

  payment_method   text,
  payment_ref      text,
  notes            text,

  created_at       timestamptz default now()
);

create index if not exists idx_receipts_customer on receipts(customer_id);
create index if not exists idx_receipts_invoice  on receipts(invoice_id);

-- ──────────────────────────────────────────────────────────
-- 5) COURSE_ENROLLMENTS · per-customer course history
-- ──────────────────────────────────────────────────────────
create table if not exists course_enrollments (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid references customers(id) on delete cascade,
  quotation_id     uuid references quotations(id),
  invoice_id       uuid references invoices(id),

  course_num       text,                           -- '01' to '12' or custom
  course_name      text,
  format           text,                           -- vdo | group | private | onsite | corp
  hours            int,
  num_attendees    int default 1,
  attendee_names   text[],

  scheduled_date   date,
  scheduled_time   text,
  duration_mins    int,

  status           text default 'scheduled',      -- scheduled | in_progress | completed | cancelled
  attendance_pct   numeric,                       -- 0-100
  certificate_nos  text[],                        -- linked cert numbers from `certificates` table

  amount           numeric,
  notes            text,

  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_enrollments_customer on course_enrollments(customer_id);
create index if not exists idx_enrollments_status   on course_enrollments(status);
create index if not exists idx_enrollments_date     on course_enrollments(scheduled_date desc);

-- ──────────────────────────────────────────────────────────
-- Auto-update updated_at trigger
-- ──────────────────────────────────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_customers_updated  on customers;
drop trigger if exists trg_quotations_updated on quotations;
drop trigger if exists trg_invoices_updated   on invoices;
drop trigger if exists trg_enrollments_updated on course_enrollments;

create trigger trg_customers_updated  before update on customers   for each row execute function set_updated_at();
create trigger trg_quotations_updated before update on quotations  for each row execute function set_updated_at();
create trigger trg_invoices_updated   before update on invoices    for each row execute function set_updated_at();
create trigger trg_enrollments_updated before update on course_enrollments for each row execute function set_updated_at();

-- ──────────────────────────────────────────────────────────
-- RLS — Admin only (service_role) · except receipts public read
-- ──────────────────────────────────────────────────────────
alter table customers          enable row level security;
alter table quotations         enable row level security;
alter table invoices           enable row level security;
alter table receipts           enable row level security;
alter table course_enrollments enable row level security;

drop policy if exists "Service role full" on customers;
drop policy if exists "Service role full" on quotations;
drop policy if exists "Service role full" on invoices;
drop policy if exists "Service role full" on receipts;
drop policy if exists "Service role full" on course_enrollments;
drop policy if exists "Public read receipts" on receipts;

create policy "Service role full" on customers          for all to service_role using (true) with check (true);
create policy "Service role full" on quotations         for all to service_role using (true) with check (true);
create policy "Service role full" on invoices           for all to service_role using (true) with check (true);
create policy "Service role full" on receipts           for all to service_role using (true) with check (true);
create policy "Service role full" on course_enrollments for all to service_role using (true) with check (true);

-- Receipts can be looked up by receipt_no publicly (for "verify receipt" use case)
create policy "Public read receipts" on receipts for select to anon using (true);
grant select on receipts to anon;
