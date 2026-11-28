-- Shows the Google photo next to a user's reviews, unless they turn it off.
--
-- The photo lives in auth.users metadata, which only its owner can read.
-- profiles is public (names next to reviews), so it gets a copy of the photo
-- URL only while show_avatar is on; when it is off the column is null and the
-- photo is not exposed through the API at all.
--
-- Users can change show_avatar, never avatar_url itself: the URL is always
-- copied from the Google account by the triggers below.

alter table public.profiles
  add column avatar_url  text,
  add column show_avatar boolean not null default true;

grant update (show_avatar) on public.profiles to authenticated;

-- The photo URL in auth metadata (Google sets avatar_url and picture)
create function public.google_avatar(meta jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(coalesce(meta ->> 'avatar_url', meta ->> 'picture'), '');
$$;

-- New profiles and a changed switch: copy the photo, or clear it
create function public.profiles_sync_avatar()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.show_avatar then
    select public.google_avatar(u.raw_user_meta_data)
      into new.avatar_url
      from auth.users u
      where u.id = new.id;
  else
    new.avatar_url := null;
  end if;
  return new;
end;
$$;

create trigger profiles_sync_avatar
  before insert or update of show_avatar on public.profiles
  for each row execute function public.profiles_sync_avatar();

-- Google sign-ins refresh the metadata: keep the copy up to date
create function public.sync_avatar_from_auth()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.profiles
  set avatar_url = public.google_avatar(new.raw_user_meta_data)
  where id = new.id
    and show_avatar
    and avatar_url is distinct from public.google_avatar(new.raw_user_meta_data);
  return new;
end;
$$;

create trigger on_auth_user_meta_updated
  after update of raw_user_meta_data on auth.users
  for each row execute function public.sync_avatar_from_auth();

-- Existing users
update public.profiles p
set avatar_url = public.google_avatar(u.raw_user_meta_data)
from auth.users u
where u.id = p.id and p.show_avatar;
