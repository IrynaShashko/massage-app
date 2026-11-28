-- Booking by time slots: the admin publishes free times, clients book one,
-- the admin confirms or declines.
--
-- Times are wall-clock times at the studio in Kyiv, stored as a date and a
-- time so they read the same for everyone, wherever the browser is.
-- 'Europe/Kiev' is the zone name every Postgres version knows.

-- ------------------------------------------------------------------- slots --

create table public.slots (
  id          uuid primary key default gen_random_uuid(),
  day         date not null,
  time        time not null,
  created_at  timestamptz not null default now(),
  unique (day, time)
);

alter table public.slots enable row level security;

-- Visitors never read this table directly: they get free times from
-- free_slots() below, which hides which times are taken and by whom.
create policy "admins manage slots"
  on public.slots for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.slots from anon, authenticated;
grant select, insert, delete on public.slots to authenticated;

-- ---------------------------------------------------------------- bookings --

create table public.bookings (
  id          uuid primary key default gen_random_uuid(),
  slot_id     uuid not null references public.slots (id) on delete cascade,
  name        text not null check (length(trim(name)) between 1 and 80),
  phone       text not null check (length(phone) <= 20),
  email       text check (email is null or length(email) <= 120),
  service     text not null default '' check (length(service) <= 200),
  note        text check (note is null or length(note) <= 1000),
  -- pending: the slot is held until the admin decides
  -- declined: the slot is free again
  status      text not null default 'pending'
                check (status in ('pending', 'confirmed', 'declined')),
  created_at  timestamptz not null default now()
);

-- One live booking per slot; declined ones stay as history
create unique index bookings_one_active_per_slot
  on public.bookings (slot_id)
  where status in ('pending', 'confirmed');

alter table public.bookings enable row level security;

-- Clients' contacts: admins only. New bookings come in through book_slot(),
-- which only the booking-telegram function (service role) may call.
create policy "admins read bookings"
  on public.bookings for select
  to authenticated
  using (public.is_admin());

create policy "admins update bookings"
  on public.bookings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.bookings from anon, authenticated;
grant select on public.bookings to authenticated;
grant update (status) on public.bookings to authenticated;
-- service_role grants (for telegram-webhook) are added in 0008

-- ------------------------------------------------------------- free_slots --

-- Future times with no pending or confirmed booking
create function public.free_slots()
returns table (id uuid, day date, "time" time)
language sql
stable
security definer set search_path = ''
as $$
  select s.id, s.day, s.time
  from public.slots s
  where s.day + s.time > (now() at time zone 'Europe/Kiev')
    and not exists (
      select 1 from public.bookings b
      where b.slot_id = s.id and b.status in ('pending', 'confirmed')
    )
  order by s.day, s.time;
$$;

revoke all on function public.free_slots() from public;
grant execute on function public.free_slots() to anon, authenticated;

-- --------------------------------------------------------------- book_slot --

-- Holds a slot for a client. Raises 'slot_unavailable' when the slot does
-- not exist, is in the past or is already taken; the unique index above
-- makes two simultaneous requests for one slot end with one winner.
create function public.book_slot(
  p_slot_id  uuid,
  p_name     text,
  p_phone    text,
  p_email    text,
  p_service  text,
  p_note     text
)
returns table (booking_id uuid, day date, "time" time)
language plpgsql
security definer set search_path = ''
as $$
declare
  v_slot public.slots;
  v_id   uuid;
begin
  select * into v_slot from public.slots s
  where s.id = p_slot_id
    and s.day + s.time > (now() at time zone 'Europe/Kiev');
  if not found then
    raise exception 'slot_unavailable';
  end if;

  begin
    insert into public.bookings (slot_id, name, phone, email, service, note)
    values (
      p_slot_id,
      trim(p_name),
      trim(p_phone),
      nullif(trim(p_email), ''),
      coalesce(trim(p_service), ''),
      nullif(trim(p_note), '')
    )
    returning id into v_id;
  exception when unique_violation then
    raise exception 'slot_unavailable';
  end;

  return query select v_id, v_slot.day, v_slot.time;
end;
$$;

revoke all on function public.book_slot(uuid, text, text, text, text, text)
  from public;
grant execute on function public.book_slot(uuid, text, text, text, text, text)
  to service_role;
