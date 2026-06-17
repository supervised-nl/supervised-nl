-- Bugfix: super_admin heeft organization_id = null, dus de bestaande policy
-- "users_select_own_org" (organization_id = current_org_id(), ook null) levert
-- nooit een match op (null = null is unknown in SQL). Hierdoor kon een
-- super_admin zijn eigen rij niet lezen na inloggen.
-- Permissive policies worden OR'd, dus dit is puur additief.
create policy "users_select_own_row" on public.users
  for select to authenticated
  using (id = auth.uid());
