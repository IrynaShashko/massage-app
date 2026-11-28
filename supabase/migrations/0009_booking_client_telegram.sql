-- Lets clients get their booking's confirmation from the Telegram bot.
--
-- After booking, the site offers a t.me/<bot>?start=<telegram_token> link.
-- When the client presses Start, telegram-webhook saves their chat id here,
-- and every later status change is sent to that chat.

alter table public.bookings
  -- language of the site when booking, for messages to the client
  add column lang text not null default 'ua' check (lang in ('ua', 'en')),
  -- the secret part of the bot link; each existing row gets its own value
  add column telegram_token text not null unique
    default replace(gen_random_uuid()::text, '-', ''),
  -- set once the client opens the bot from that link
  add column client_chat_id bigint;

-- book_slot now also takes the language and returns the token, so its
-- signature changes: drop and recreate
drop function public.book_slot(uuid, text, text, text, text, text);

create function public.book_slot(
  p_slot_id  uuid,
  p_name     text,
  p_phone    text,
  p_email    text,
  p_service  text,
  p_note     text,
  p_lang     text
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
      (slot_id, name, phone, email, service, note, lang)
    values (
      p_slot_id,
      trim(p_name),
      trim(p_phone),
      nullif(trim(p_email), ''),
      coalesce(trim(p_service), ''),
      nullif(trim(p_note), ''),
      case when p_lang = 'en' then 'en' else 'ua' end
    )
    returning id, bookings.telegram_token into v_id, v_token;
  exception when unique_violation then
    raise exception 'slot_unavailable';
  end;

  return query select v_id, v_token, v_slot.day, v_slot.time;
end;
$$;

revoke all on function public.book_slot(uuid, text, text, text, text, text, text)
  from public;
grant execute on function public.book_slot(uuid, text, text, text, text, text, text)
  to service_role;
