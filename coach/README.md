# Supervised Coach

Wekelijkse AI-microuitdagingen en een workshop-vraagbaak voor MKB-teams die een
AI-workshop bij Supervised hebben gevolgd. Next.js (App Router) + Supabase (database
én auth) + Vercel.

## Lokaal draaien

```bash
npm install
npm run dev   # http://localhost:3000
```

Maak een `.env.local` op basis van `.env.local.example`:

| Variabele | Doel |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key, alleen server-side |
| `ANTHROPIC_API_KEY` | Claude API voor challenges en vraagbaak |
| `RESEND_API_KEY` | Resend voor uitnodigings- en challengemails |
| `NEXT_PUBLIC_APP_URL` | Publieke URL, bijv. `https://coach.supervised.nl` |
| `CRON_SECRET` | Bearer-token waarmee Vercel de cron-routes mag aanroepen |

## Database

Migraties staan in `supabase/migrations/`. Toepassen op een (nieuw) project:

```bash
supabase db push
```

Daarna één super-admin aanmaken:

```bash
npx tsx scripts/seed-super-admin.ts info@supervised.nl <wachtwoord>
```

## Build

```bash
npm run build
npm run start
```

## Architectuur

- `app/` — App Router routes. `(auth)` = inlog/wachtwoord, `admin` = super-admin
  beheer, `dashboard` = member/admin app, `api/cron` = door Vercel geplande jobs.
- `actions/` — server actions. Elke actie gate't met `requireRole(...)`.
- `lib/supabase/` — `server`/`client`/`middleware` gebruiken de anon key (RLS),
  `service` gebruikt de service-role key (alleen achter een rolcheck).
- Autorisatie: RLS op alle tabellen, org-scoping via `current_org_id()`.
  Super-admin werkt via de service-role key in server actions.

## Cron

Vercel roept twee endpoints aan (zie `vercel.json`), beveiligd met `CRON_SECRET`:

- `/api/cron/challenge-send` — elk uur, verstuurt geplande challenges.
- `/api/cron/challenge-reminders` — dagelijks 08:00, herinnert wie nog niet klaar is.
