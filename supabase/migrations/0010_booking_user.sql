-- Links bookings to the account of a signed-in client, so they can see their
-- bookings in the profile.
--
-- Guests still book without an account (user_id stays null). Bookings made
-- before this migration are not linked: the email typed in the form is not
-- verified, so matching on it could show someone else's booking.

alter table public.bookings
  add column user_id uuid references public.profiles (id) on delete set null;

create index bookings_user_id on public.bookings (user_id)
  where user_id is not null;

-- book_slot takes the user id from booking-telegram, which checks the
-- caller's session itself. The new parameter has a default, so the function
-- deployed before this migration (7 named arguments) keeps working.
drop function public.book_slot(uuid, text, text, text, text, text, text);

create function public.book_slot(
  p_slot_id  uuid,
  p_name     text,
  p_phone    text,
  p_email    text,
  p_service  text,
  p_note     text,
  p_lang     text,
  p_user_id  uuid default null
)
returns table (booking_id uuid, telegram_token text, day date, "time" time)
language plpgsql
security definer set search_path = ''
as $$
declare
  v_slot  public.slots;
  v_id    uuid;
  v_token text;
begin
  select * into v_slot from public.slots s
  where s.id = p_slot_id
    and s.day + s.time > (now() at time zone 'Europe/Kiev');
  if not found then
    raise exception 'slot_unavailable';
  end if;

  begin
    insert into public.bookings
      (slot_id, name, phone, email, service, note, lang, user_id)
    values (
      p_slot_id,
      trim(p_name),
      trim(p_phone),
      nullif(trim(p_email), ''),
      coalesce(trim(p_service), ''),
      nullif(trim(p_note), ''),
      case when p_lang = 'en' then 'en' else 'ua' end,
      p_user_id
    )
    returning id, bookings.telegram_token into v_id, v_token;
  exception when unique_violation then
    raise exception 'slot_unavailable';
  end;

  return query select v_id, v_token, v_slot.day, v_slot.time;
end;
$$;

revoke all on function
  public.book_slot(uuid, text, text, text, text, text, text, uuid)
  from public;
grant execute on function
  public.book_slot(uuid, text, text, text, text, text, text, uuid)
  to service_role;

-- -------------------------------------------------------------- my_bookings --

-- The signed-in user's bookings, newest time first. A function rather than
-- an RLS policy: clients cannot read slots, and this returns only what the
-- profile shows (no telegram token or chat id).
create function public.my_bookings()
returns table (
  id          uuid,
  day         date,
  "time"      time,
  service     text,
  note        text,
  status      text,
  created_at  timestamptz
)
language sql
stable
security definer set search_path = ''
as $$
  select b.id, s.day, s.time, b.service, b.note, b.status, b.created_at
  from public.bookings b
  join public.slots s on s.id = b.slot_id
  where b.user_id = auth.uid()
  order by s.day desc, s.time desc;
$$;

revoke all on function public.my_bookings() from public;
grant execute on function public.my_bookings() to authenticated;
