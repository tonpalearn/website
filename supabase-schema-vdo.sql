-- TONPALEARN · VDO Learning + Arsenal Shop Schema
-- Run in Supabase SQL Editor of project `lhrzjkizxjigqeuyposw`
-- Tables: tickets · vdo_courses · vdo_episodes · ticket_courses · view_logs · arsenal_packs · vdo_orders
--
-- v1 — May 2026 — supports `/vdo/` learner page, `/admin/` admin panel, `/arsenal/` prompt pack shop

-- ──────────────────────────────────────────────────────────
-- 1) TICKETS · access codes for VDO
-- ──────────────────────────────────────────────────────────
create table if not exists tickets (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,                   -- 'TPL-AB12-CD34' (12 chars)
  ticket_type   text not null default 'count'
                check (ticket_type in ('count','days','unlimited')),
  max_plays     int,                                     -- null if days/unlimited
  plays_used    int default 0,
  expires_at    timestamptz,                             -- null if count/unlimited
  redeemed_first_at timestamptz,                         -- set on first /vdo visit
  status        text default 'active'
                check (status in ('active','consumed','expired','revoked')),
  customer_name text,
  customer_phone text,
  customer_line_id text,
  customer_email text,
  notes         text,
  issued_by     text default 'admin',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_tickets_code   on tickets(code);
create index if not exists idx_tickets_status on tickets(status);
create index if not exists idx_tickets_expire on tickets(expires_at);

-- ──────────────────────────────────────────────────────────
-- 2) VDO COURSES
-- ──────────────────────────────────────────────────────────
create table if not exists vdo_courses (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,                    -- '01-ai-basic'
  title         text not null,
  title_en      text,
  description   text,
  cover_url     text,
  thumbnail_url text,
  level         text,                                     -- 'beginner'|'intermediate'|'advanced'
  category      text,
  hours_total   numeric default 0,                        -- denorm sum
  episode_count int default 0,                            -- denorm count
  price_thb     numeric,
  is_published  boolean default false,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_courses_slug      on vdo_courses(slug);
create index if not exists idx_courses_published on vdo_courses(is_published);

-- ──────────────────────────────────────────────────────────
-- 3) VDO EPISODES
-- ──────────────────────────────────────────────────────────
create table if not exists vdo_episodes (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references vdo_courses(id) on delete cascade,
  episode_no    int not null,
  title         text not null,
  description   text,
  youtube_video_id text not null,                         -- 'dQw4w9WgXcQ'
  duration_seconds int default 0,
  resources     jsonb default '[]'::jsonb,                -- [{ title, url, type }]
  is_preview    boolean default false,                    -- viewable without ticket
  is_published  boolean default true,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create unique index if not exists idx_episodes_course_no on vdo_episodes(course_id, episode_no);
create index if not exists idx_episodes_published on vdo_episodes(is_published);

-- ──────────────────────────────────────────────────────────
-- 4) TICKET ↔ COURSE ENTITLEMENTS
-- ──────────────────────────────────────────────────────────
create table if not exists ticket_courses (
  ticket_id uuid references tickets(id) on delete cascade,
  course_id uuid references vdo_courses(id) on delete cascade,
  primary key (ticket_id, course_id)
);

-- ──────────────────────────────────────────────────────────
-- 5) VIEW LOGS · for burn logic + analytics
-- ──────────────────────────────────────────────────────────
create table if not exists view_logs (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid references tickets(id) on delete cascade,
  episode_id  uuid references vdo_episodes(id) on delete cascade,
  course_id   uuid references vdo_courses(id) on delete cascade,
  device_fp   text,                                       -- hash of UA+screen+lang
  watched_at  timestamptz default now(),
  duration_seconds int default 0,                         -- accumulated per ping
  completed   boolean default false,
  counted_as_play boolean default false                    -- true once 30s threshold crossed
);

create index if not exists idx_views_ticket  on view_logs(ticket_id, watched_at desc);
create index if not exists idx_views_episode on view_logs(episode_id);
create index if not exists idx_views_course  on view_logs(course_id);

-- ──────────────────────────────────────────────────────────
-- 6) ARSENAL PROMPT PACKS
-- ──────────────────────────────────────────────────────────
create table if not exists arsenal_packs (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  category      text,                                     -- 'Marketing','Sales','Coach','IT_Audit','PA','Content'
  cover_url     text,
  prompt_count  int default 0,
  sample_prompts jsonb default '[]'::jsonb,               -- [{ title, body }] — visible publicly
  download_url  text,                                     -- gated — admin sends manually
  price_thb     numeric,
  is_published  boolean default false,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_arsenal_pub on arsenal_packs(is_published);
create index if not exists idx_arsenal_cat on arsenal_packs(category);

-- ──────────────────────────────────────────────────────────
-- 7) VDO ORDERS · manual tracking before ticket issue
-- ──────────────────────────────────────────────────────────
create table if not exists vdo_orders (
  id            uuid primary key default gen_random_uuid(),
  order_no      text unique,                              -- 'VDO-YYMM-NNN'
  type          text not null
                check (type in ('vdo_course','arsenal_pack','bundle')),
  item_ids      text[],                                   -- slugs of items
  item_titles   text[],                                   -- denorm titles for receipt
  customer_name text, customer_phone text,
  customer_line_id text, customer_email text,
  amount_thb    numeric default 0,
  payment_method text default 'bank_transfer',
  payment_ref   text,
  slip_url      text,
  ticket_id     uuid references tickets(id),
  status        text default 'pending'
                check (status in ('pending','paid','fulfilled','cancelled')),
  notes         text,
  created_at    timestamptz default now(),
  paid_at       timestamptz,
  fulfilled_at  timestamptz
);

create index if not exists idx_vdo_orders_status on vdo_orders(status);
create index if not exists idx_vdo_orders_created on vdo_orders(created_at desc);

-- ──────────────────────────────────────────────────────────
-- Auto-update updated_at
-- ──────────────────────────────────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_tickets_updated on tickets;
drop trigger if exists trg_vdo_courses_updated on vdo_courses;
drop trigger if exists trg_vdo_episodes_updated on vdo_episodes;
drop trigger if exists trg_arsenal_updated on arsenal_packs;

create trigger trg_tickets_updated      before update on tickets       for each row execute function set_updated_at();
create trigger trg_vdo_courses_updated  before update on vdo_courses   for each row execute function set_updated_at();
create trigger trg_vdo_episodes_updated before update on vdo_episodes  for each row execute function set_updated_at();
create trigger trg_arsenal_updated      before update on arsenal_packs for each row execute function set_updated_at();

-- Auto-update episode_count + hours_total when episode changes (denorm)
create or replace function refresh_course_stats(course_uuid uuid) returns void as $$
begin
  update vdo_courses
  set episode_count = (select count(*) from vdo_episodes where course_id = course_uuid and is_published = true),
      hours_total   = (select coalesce(sum(duration_seconds)/3600.0, 0) from vdo_episodes where course_id = course_uuid and is_published = true)
  where id = course_uuid;
end;
$$ language plpgsql;

create or replace function trg_refresh_course_stats() returns trigger as $$
begin
  perform refresh_course_stats(coalesce(new.course_id, old.course_id));
  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists trg_episodes_stats on vdo_episodes;
create trigger trg_episodes_stats after insert or update or delete on vdo_episodes
  for each row execute function trg_refresh_course_stats();

-- ──────────────────────────────────────────────────────────
-- RLS — admin only (service_role) · public read for published catalog
-- ──────────────────────────────────────────────────────────
alter table tickets         enable row level security;
alter table vdo_courses     enable row level security;
alter table vdo_episodes    enable row level security;
alter table ticket_courses  enable row level security;
alter table view_logs       enable row level security;
alter table arsenal_packs   enable row level security;
alter table vdo_orders      enable row level security;

-- Drop existing policies for idempotency
drop policy if exists "Service full" on tickets;
drop policy if exists "Service full" on vdo_courses;
drop policy if exists "Service full" on vdo_episodes;
drop policy if exists "Service full" on ticket_courses;
drop policy if exists "Service full" on view_logs;
drop policy if exists "Service full" on arsenal_packs;
drop policy if exists "Service full" on vdo_orders;
drop policy if exists "Anon read pub courses"  on vdo_courses;
drop policy if exists "Anon read pub episodes" on vdo_episodes;
drop policy if exists "Anon read pub arsenal"  on arsenal_packs;

-- Service role — full CRUD
create policy "Service full" on tickets         for all to service_role using (true) with check (true);
create policy "Service full" on vdo_courses     for all to service_role using (true) with check (true);
create policy "Service full" on vdo_episodes    for all to service_role using (true) with check (true);
create policy "Service full" on ticket_courses  for all to service_role using (true) with check (true);
create policy "Service full" on view_logs       for all to service_role using (true) with check (true);
create policy "Service full" on arsenal_packs   for all to service_role using (true) with check (true);
create policy "Service full" on vdo_orders      for all to service_role using (true) with check (true);

-- Anon — read published catalog (so /vdo browse mode + /arsenal works without ticket)
create policy "Anon read pub courses"  on vdo_courses   for select to anon using (is_published = true);
create policy "Anon read pub episodes" on vdo_episodes  for select to anon using (is_published = true);
create policy "Anon read pub arsenal"  on arsenal_packs for select to anon using (is_published = true);

grant select on vdo_courses, vdo_episodes, arsenal_packs to anon;

-- ──────────────────────────────────────────────────────────
-- RPC FUNCTIONS · anon-callable, security definer
-- /vdo page uses these via anon key — no service_role exposure
-- ──────────────────────────────────────────────────────────

-- 1) Redeem ticket — return ticket info + entitled course IDs if valid
create or replace function redeem_ticket(p_code text)
returns table (
  ticket_id     uuid,
  code          text,
  ticket_type   text,
  max_plays     int,
  plays_used    int,
  expires_at    timestamptz,
  status        text,
  customer_name text,
  course_ids    uuid[]
) language plpgsql security definer as $$
declare
  v_ticket tickets%rowtype;
begin
  select * into v_ticket from tickets where tickets.code = upper(p_code) limit 1;
  if not found then
    return;
  end if;

  -- Auto-mark consumed if count exhausted
  if v_ticket.ticket_type = 'count' and v_ticket.plays_used >= v_ticket.max_plays then
    update tickets set status = 'consumed' where id = v_ticket.id;
    v_ticket.status := 'consumed';
  end if;

  -- Auto-mark expired if past expiry
  if v_ticket.ticket_type = 'days' and v_ticket.expires_at is not null and v_ticket.expires_at < now() then
    update tickets set status = 'expired' where id = v_ticket.id;
    v_ticket.status := 'expired';
  end if;

  -- Set redeemed_first_at if first redemption
  if v_ticket.redeemed_first_at is null and v_ticket.status = 'active' then
    if v_ticket.ticket_type = 'days' and v_ticket.expires_at is null then
      -- compute expires_at from now + (assume 30 days default if not set elsewhere)
      update tickets set redeemed_first_at = now() where id = v_ticket.id;
    else
      update tickets set redeemed_first_at = now() where id = v_ticket.id;
    end if;
    v_ticket.redeemed_first_at := now();
  end if;

  return query select
    v_ticket.id, v_ticket.code, v_ticket.ticket_type,
    v_ticket.max_plays, v_ticket.plays_used,
    v_ticket.expires_at, v_ticket.status,
    v_ticket.customer_name,
    array(select tc.course_id from ticket_courses tc where tc.ticket_id = v_ticket.id);
end;
$$;

grant execute on function redeem_ticket(text) to anon;

-- 2) Burn play — log view + increment plays_used if 24h debounce passed
create or replace function burn_play(
  p_ticket_id uuid,
  p_episode_id uuid,
  p_course_id uuid,
  p_device_fp text
) returns table (
  ok boolean,
  burned boolean,
  plays_remaining int,
  message text
) language plpgsql security definer as $$
declare
  v_ticket tickets%rowtype;
  v_recent_view int;
begin
  select * into v_ticket from tickets where id = p_ticket_id;
  if not found then
    return query select false, false, 0, 'ticket_not_found'::text; return;
  end if;

  if v_ticket.status != 'active' then
    return query select false, false, 0, ('ticket_' || v_ticket.status)::text; return;
  end if;

  -- Check 24h debounce — same ticket+episode within 24h doesn't burn again
  select count(*) into v_recent_view
  from view_logs
  where ticket_id = p_ticket_id and episode_id = p_episode_id
    and counted_as_play = true
    and watched_at > now() - interval '24 hours';

  if v_recent_view > 0 then
    -- Already counted, log without burning
    insert into view_logs (ticket_id, episode_id, course_id, device_fp, counted_as_play, duration_seconds)
    values (p_ticket_id, p_episode_id, p_course_id, p_device_fp, false, 30);
    return query select true, false,
      coalesce(v_ticket.max_plays - v_ticket.plays_used, -1),
      'already_counted_within_24h'::text;
    return;
  end if;

  -- Burn (for count type) and log
  if v_ticket.ticket_type = 'count' then
    update tickets set plays_used = plays_used + 1 where id = p_ticket_id;
    if v_ticket.plays_used + 1 >= v_ticket.max_plays then
      update tickets set status = 'consumed' where id = p_ticket_id;
    end if;
  end if;

  insert into view_logs (ticket_id, episode_id, course_id, device_fp, counted_as_play, duration_seconds)
  values (p_ticket_id, p_episode_id, p_course_id, p_device_fp, true, 30);

  return query select true, true,
    case when v_ticket.ticket_type = 'count' then v_ticket.max_plays - (v_ticket.plays_used + 1) else -1 end,
    'burned'::text;
end;
$$;

grant execute on function burn_play(uuid, uuid, uuid, text) to anon;

-- 3) Heartbeat — update last view duration (no burn)
create or replace function view_heartbeat(
  p_ticket_id uuid,
  p_episode_id uuid,
  p_seconds int
) returns void language plpgsql security definer as $$
begin
  update view_logs
  set duration_seconds = greatest(duration_seconds, p_seconds)
  where id = (
    select id from view_logs
    where ticket_id = p_ticket_id and episode_id = p_episode_id
    order by watched_at desc limit 1
  );
end;
$$;

grant execute on function view_heartbeat(uuid, uuid, int) to anon;

-- Note: All write paths for anon go through RPC functions (security definer).
-- Direct INSERT/UPDATE on tables is service_role only.
-- This protects against malicious anon clients dumping data or forging plays.
