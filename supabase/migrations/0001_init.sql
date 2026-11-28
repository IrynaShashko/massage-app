-- Massage app schema: profiles, reviews, articles.
-- Run once in Supabase Dashboard -> SQL Editor (or `supabase db push`).

-- ---------------------------------------------------------------- profiles --

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '',
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- Every new auth user gets a profile; the name comes from signUp metadata
-- (email sign-up) or from the Google account.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      ''
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- security definer so RLS policies can call it without recursing into profiles
create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

-- Names are shown next to reviews, so profiles are public (no email stored here)
create policy "profiles are readable by everyone"
  on public.profiles for select
  using (true);

create policy "users update their own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Explicit grants, so the schema works whether or not the project grants API
-- access to new tables automatically. RLS policies above still filter rows.
-- Users may change only their name, never their role.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (name) on public.profiles to authenticated;

-- ----------------------------------------------------------------- reviews --

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
                references public.profiles (id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text not null check (length(trim(comment)) > 0),
  created_at  timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "reviews are readable by everyone"
  on public.reviews for select
  using (true);

create policy "signed-in users add their own reviews"
  on public.reviews for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "admins delete reviews"
  on public.reviews for delete
  using (public.is_admin());

revoke all on public.reviews from anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant insert, delete on public.reviews to authenticated;

-- ---------------------------------------------------------------- articles --

create table public.articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique
                check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_ua    text not null,
  title_en    text not null default '',
  content_ua  text not null default '',
  content_en  text not null default '',
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger articles_touch_updated_at
  before update on public.articles
  for each row execute function public.touch_updated_at();

alter table public.articles enable row level security;

create policy "published articles are readable by everyone"
  on public.articles for select
  using (published or public.is_admin());

create policy "admins insert articles"
  on public.articles for insert
  with check (public.is_admin());

create policy "admins update articles"
  on public.articles for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins delete articles"
  on public.articles for delete
  using (public.is_admin());

revoke all on public.articles from anon, authenticated;
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;

-- RLS policies call is_admin() as the requesting role
grant execute on function public.is_admin() to anon, authenticated;

-- ------------------------------------------------------------ make an admin --
-- After signing up on the site, run (with your email):
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
