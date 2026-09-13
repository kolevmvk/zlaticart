-- Admin čitanje poruka iz javnih formi (kontakt i porudžbine).
--
-- Tabele iz 20260829000002/20260830000001 dozvoljavaju samo INSERT za anon.
-- Admin API ih čita serverskim `service_role` ključem. service_role zaobilazi
-- RLS, ali NE i GRANT-ove: u zasebnoj šemi bez ovoga čitanje vraća
-- "permission denied". Samo SELECT — admin ne menja niti briše poruke.
-- anon/authenticated ne dobijaju čitanje.

grant usage on schema zlaticart to service_role;

grant select on table zlaticart.contact_submissions to service_role;
grant select on table zlaticart.commission_requests to service_role;
