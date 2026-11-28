-- Reviews collected before the site had its own (from Instagram).
-- Run after 0005_reviews_admin.sql. Safe to run again: a review with the same
-- author and text is not added twice. Ratings and dates can be changed later
-- in the admin panel (/admin/reviews).

insert into public.reviews (author_name, rating, comment, created_at)
select v.author_name, v.rating, v.comment, v.created_at
from (values
  ($a$wandering.wanderess$a$, 5, $a$Моя спина, шия та плечі кажуть Дякую! Після масажів у Марії набагато покращилось самопочуття.$a$, timestamptz '2026-02-12 12:00:00+02'),
  ($a$Ангеліна$a$, 5, $a$Дивовижна дівчина, дивовижний майстер своєї справи, поєднання тонкого душевного відчуття та таланту.$a$, timestamptz '2026-01-18 12:00:00+02'),
  ($a$pelme6ko$a$, 5, $a$Марія повернула до життя мою спину і руки після пологів. Наразі відчуваю себе набагато краще.$a$, timestamptz '2025-12-03 12:00:00+02'),
  ($a$ginger_elve$a$, 5, $a$Маріє, дякую тобі за те, що ти є) Масаж пушка бомба ракєта. Кожного разу відчуваю себе більш живою.$a$, timestamptz '2025-10-21 12:00:00+02'),
  ($a$marichkamikitska$a$, 5, $a$Найкращий масажист! Результат відчула вже після першого разу. В Марії ідеальна сила натиску і супер техніка.$a$, timestamptz '2025-09-07 12:00:00+02'),
  ($a$i_am_evgeniia$a$, 5, $a$Машуля, свою спину довіряю тепер тільки тобі! Ти справжній професіонал свого діла! Чекаю🙌🏻$a$, timestamptz '2025-07-15 12:00:00+02'),
  ($a$julia_danza_ri$a$, 5, $a$Всім відомо, що наші невиражені емоції накопичуються в нашому тілі. Я часто маю затиск і болі в шиї, а сеанси з Марією для мене не просто масаж, а сеанси психотерапії 😅.$a$, timestamptz '2025-05-29 12:00:00+02'),
  ($a$zinchenko.photography$a$, 5, $a$Масажист - вогінь! 🔥 Я, як людина з сидячою роботою, відвідував багато різних масажів. Але Марія прям крута) Прям круто робить боляче)$a$, timestamptz '2025-04-10 12:00:00+02'),
  ($a$melluni$a$, 5, $a$Маша! Я скучаю і думаю про тебе щотижня! Моя спина не знала кращих рук за твої і вона не може без тебе🥲, якраз позавчора цілий день про тебе думала.❤️$a$, timestamptz '2025-02-22 12:00:00+02'),
  ($a$podobedyulia$a$, 5, $a$Ти найкращий масажист у моєму житті Маріє! ❤️ Всіх до кого я потрапляю я порівнюю саме з тобою! бо твій професіоналізм і чуттєвість - для мене еталон. Обіймаю$a$, timestamptz '2024-12-14 12:00:00+02')
) as v (author_name, rating, comment, created_at)
where not exists (
  select 1 from public.reviews r
  where r.author_name = v.author_name and r.comment = v.comment
);
