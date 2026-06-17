-- challenge_completions: eigen afronding mag worden bijgewerkt
create policy "challenge_completions_update_own" on public.challenge_completions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
