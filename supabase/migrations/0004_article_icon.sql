-- Icon shown next to the article in the sidebar. Holds a key from
-- src/config/articleIcons.ts; unknown keys fall back to the document icon.

alter table public.articles
  add column icon text not null default 'file-text';

update public.articles set icon = 'help-circle' where slug = 'questions';
update public.articles set icon = 'heart-pulse' where slug = 'health';
update public.articles set icon = 'sparkles'    where slug = 'expectation';
