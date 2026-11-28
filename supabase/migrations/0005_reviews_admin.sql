-- Lets admins manage reviews, including ones from clients without an account
-- on the site (e.g. reviews collected on Instagram).

-- A review either belongs to a site user or carries the author's name itself
alter table public.reviews
  alter column user_id drop not null,
  add column author_name text
    check (author_name is null or length(trim(author_name)) > 0);

alter table public.reviews
  add constraint reviews_has_author
    check (user_id is not null or author_name is not null);

create policy "admins add reviews"
  on public.reviews for insert
  to authenticated
  with check (public.is_admin());

create policy "admins update reviews"
  on public.reviews for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant update on public.reviews to authenticated;
