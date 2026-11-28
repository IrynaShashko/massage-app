-- Emails that become admins automatically, whether they sign up before or
-- after being added here. Fill it from the SQL Editor only, so addresses stay
-- out of the repository:
--
--   insert into public.admin_emails (email) values ('someone@example.com');

create table public.admin_emails (
  email text primary key check (email = lower(email))
);

-- RLS on with no policies: the API can neither read nor change this table
alter table public.admin_emails enable row level security;
revoke all on public.admin_emails from anon, authenticated;

-- New sign-ups: admin when the email is listed
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      ''
    ),
    case
      when exists (
        select 1 from public.admin_emails where email = lower(new.email)
      ) then 'admin'
      else 'user'
    end
  );
  return new;
end;
$$;

-- Users who signed up before their email was listed: promote on insert
create function public.promote_listed_admin()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.profiles p
  set role = 'admin'
  from auth.users u
  where u.id = p.id and lower(u.email) = new.email;
  return new;
end;
$$;

create trigger admin_emails_promote
  after insert on public.admin_emails
  for each row execute function public.promote_listed_admin();
