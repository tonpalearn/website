-- TONPALEARN · Certificate Registry
-- Run this in Supabase SQL Editor once
-- Project: tonpalearn (configure URL + keys in /certificate/ Settings)
--
-- Security model:
--   - anon role  : SELECT only (for public verify page)
--   - service_role: full access (for issuing certificates from /certificate/)
--   - Service role key MUST stay private — paste into Settings only on trusted browser

-- 1) Table
create table if not exists certificates (
  cert_no             text primary key,
  student_name        text,
  student_name_th     text,
  course_num          text,
  course_name         text,
  course_topic        text,
  format              text,
  format_label        text,
  hours               int,
  achievement         text,
  achievement_label   text,
  completion_date     date,
  issue_date          date,
  custom_message      text,
  is_custom_course    boolean default false,
  signer_name         text,
  signer_name_th      text,
  signer_title        text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- 2) Indexes for verify lookup
create index if not exists idx_certificates_cert_no on certificates(cert_no);
create index if not exists idx_certificates_issue_date on certificates(issue_date desc);

-- 3) Auto-update updated_at
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_certificates_updated on certificates;
create trigger trg_certificates_updated
  before update on certificates
  for each row execute function set_updated_at();

-- 4) RLS — Row Level Security
alter table certificates enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Public can read certificates" on certificates;
drop policy if exists "Service role can write" on certificates;

-- Anyone (anon key) can SELECT — for /verify?id=... page
create policy "Public can read certificates"
  on certificates for select
  to anon, authenticated
  using (true);

-- Only service_role can INSERT / UPDATE / DELETE
-- (Service role bypasses RLS by design — this policy is documentary)
create policy "Service role can write"
  on certificates for all
  to service_role
  using (true)
  with check (true);

-- Grant explicit select to anon (defense in depth)
grant select on certificates to anon;

-- =====================================================
-- Verify it works
-- =====================================================
-- Test insert (as service_role from SQL Editor):
-- insert into certificates (cert_no, student_name, course_name, hours, issue_date)
-- values ('TPL-CERT-2605-001', 'Test Student', 'AI Agentic', 4, current_date);
--
-- Test select as anon:
-- select cert_no, student_name, course_name from certificates;
