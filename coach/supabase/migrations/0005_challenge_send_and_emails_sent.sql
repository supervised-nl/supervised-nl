-- Kolommen die in de app en de TypeScript-types gebruikt worden maar ontbraken
-- in de migraties (waren handmatig in het dashboard toegevoegd). Hiermee bouwt
-- een verse omgeving correct op vanuit de migraties.

-- organizations: per organisatie instelbaar wanneer challenges verstuurd worden.
-- challenge_send_day volgt JS getDay(): 0 = zondag ... 6 = zaterdag. null = direct.
alter table public.organizations
  add column if not exists challenge_send_day integer
    check (challenge_send_day between 0 and 6),
  add column if not exists challenge_send_time text;

-- challenges: markeert of de aankondigingsmails al verstuurd zijn, zodat de
-- cron een challenge niet dubbel verstuurt.
alter table public.challenges
  add column if not exists emails_sent boolean not null default false;
