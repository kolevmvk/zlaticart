-- Admin auth store: deljeni limiter pokušaja prijave + evidentirane sesije.
--
-- Zašto u bazi a ne u memoriji: Next.js na Vercel-u radi u više instanci koje
-- ne dele memoriju. In-memory Map ograničava pokušaje samo na jednoj instanci,
-- pa napadač dobija N puta više pokušaja. Limiter mora biti atomski i deljen.
--
-- Pristup: SAMO service_role. RLS je uključen bez ijedne policy — time je
-- svaki anon/authenticated pristup odbijen, a service_role zaobilazi RLS.

create schema if not exists zlaticart;

-- ---------------------------------------------------------------------------
-- Pokušaji prijave
-- ---------------------------------------------------------------------------

create table if not exists zlaticart.admin_login_attempts (
  id          bigserial primary key,
  -- Ključ grupisanja: IP, ili 'global' kad IP nije dostupan. Namerno nije
  -- unique — svaki pokušaj je svoj red, pa prozor može da se pomera.
  attempt_key text        not null,
  succeeded   boolean     not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists admin_login_attempts_key_time
  on zlaticart.admin_login_attempts (attempt_key, created_at desc);

alter table zlaticart.admin_login_attempts enable row level security;

-- ---------------------------------------------------------------------------
-- Sesije
-- ---------------------------------------------------------------------------

create table if not exists zlaticart.admin_sessions (
  jti        text        primary key,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create index if not exists admin_sessions_expiry
  on zlaticart.admin_sessions (expires_at);

alter table zlaticart.admin_sessions enable row level security;

-- ---------------------------------------------------------------------------
-- Atomski limiter
-- ---------------------------------------------------------------------------
--
-- Jedan poziv: uzmi advisory lock po ključu, prebroj neuspele pokušaje u
-- prozoru, upiši trenutni pokušaj, vrati odluku. Lock se drži do kraja
-- transakcije, pa dve paralelne instance ne mogu da prebroje isto stanje.

create or replace function zlaticart.admin_register_login_attempt(
  p_key             text,
  p_window_seconds  integer,
  p_max_attempts    integer,
  p_succeeded       boolean
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = zlaticart, pg_temp
as $$
declare
  v_failed   integer;
  v_oldest   timestamptz;
begin
  perform pg_advisory_xact_lock(hashtext('zlaticart.admin_login:' || p_key));

  select count(*), min(created_at)
    into v_failed, v_oldest
  from zlaticart.admin_login_attempts
  where attempt_key = p_key
    and succeeded = false
    and created_at > now() - make_interval(secs => p_window_seconds);

  if v_failed >= p_max_attempts then
    -- Zaključano: ne upisujemo ovaj pokušaj, da zaključavanje ne bi bilo večno.
    return query select
      false,
      greatest(
        1,
        ceil(extract(epoch from (v_oldest + make_interval(secs => p_window_seconds) - now())))::integer
      );
    return;
  end if;

  insert into zlaticart.admin_login_attempts (attempt_key, succeeded)
  values (p_key, p_succeeded);

  -- Uspešna prijava briše istoriju neuspeha za taj ključ.
  if p_succeeded then
    delete from zlaticart.admin_login_attempts
    where attempt_key = p_key and succeeded = false;
  end if;

  return query select true, 0;
end;
$$;

revoke all on function zlaticart.admin_register_login_attempt(text, integer, integer, boolean) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Čišćenje starih zapisa
-- ---------------------------------------------------------------------------

create or replace function zlaticart.admin_auth_cleanup()
returns void
language sql
security definer
set search_path = zlaticart, pg_temp
as $$
  delete from zlaticart.admin_login_attempts where created_at < now() - interval '7 days';
  delete from zlaticart.admin_sessions       where expires_at < now() - interval '7 days';
$$;

revoke all on function zlaticart.admin_auth_cleanup() from public, anon, authenticated;
