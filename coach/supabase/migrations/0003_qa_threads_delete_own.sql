-- qa_threads: eigen vragen mogen worden verwijderd door de eigenaar
create policy "qa_threads_delete_own" on public.qa_threads
  for delete to authenticated
  using (user_id = auth.uid());
