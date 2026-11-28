-- The telegram-webhook function changes booking statuses with the service
-- role. This project does not grant new tables to API roles automatically,
-- so 0007 left service_role without access to the tables themselves
-- (book_slot worked only because it runs as its owner).

grant select, insert, update, delete on public.slots to service_role;
grant select, insert, update, delete on public.bookings to service_role;
