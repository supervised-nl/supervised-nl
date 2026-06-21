/**
 * Demo-data seeder: organisatie "Supervised" met Jeroen als admin + 3 members, week 5.
 *
 * Gebruik:
 *   npx tsx scripts/seed-demo.ts
 *
 * --clean  verwijdert eerst alle bestaande demo-data (zelfde e-mailadressen)
 */

import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import type { Database } from "../lib/types";

try { process.loadEnvFile(".env.local"); } catch { /* env komt uit shell */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn verplicht.");
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as never },
});

const CLEAN = process.argv.includes("--clean");

// ─── Config ──────────────────────────────────────────────────────────────────

const DEMO_PASSWORD = "Supervised2026!";

const DEMO_USERS = [
  { email: "jeroen@coach.demo",  name: "Jeroen Gijselaar", role: "admin"  as const },
  { email: "sophie@coach.demo",  name: "Sophie de Vries",  role: "member" as const },
  { email: "mark@coach.demo",    name: "Mark Janssen",     role: "member" as const },
  { email: "emma@coach.demo",    name: "Emma Bakker",      role: "member" as const },
];

// Datums: week 5 is 3 dagen geleden gestart (deadline over 4 dagen → "Nog 4 dagen beschikbaar")
const now = new Date("2026-06-21T12:00:00Z");
function weeksAgo(n: number) {
  return new Date(now.getTime() - n * 7 * 24 * 60 * 60 * 1000).toISOString();
}

const CHALLENGES = [
  {
    week_number: 1,
    title: "Schrijf een e-mail met AI",
    description: "Gebruik Claude of ChatGPT om een klant-e-mail te schrijven voor een situatie die je deze week tegenkomt. Vergelijk de AI-versie met wat je zelf zou schrijven.",
    expected_outcome: "Je hebt minstens één e-mail via AI opgesteld en weet wat je moet aanpassen om het jouw stem te geven.",
    status: "completed" as const,
    send_at: weeksAgo(4),
  },
  {
    week_number: 2,
    title: "Samenvatting maken van een document",
    description: "Neem een lang document, rapport of e-mailthread en laat AI er een bondige samenvatting van maken. Probeer dit met minstens twee verschillende prompts.",
    expected_outcome: "Je hebt ontdekt hoe je de samenvatting stuurt met een goede prompt — kort vs. puntsgewijs, formeel vs. informeel.",
    status: "completed" as const,
    send_at: weeksAgo(3),
  },
  {
    week_number: 3,
    title: "Ideeën genereren voor een probleem",
    description: "Beschrijf een actueel probleem of uitdaging in je werk aan AI en vraag om 5 concrete oplossingsrichtingen. Kies er één uit en werk hem samen met AI verder uit.",
    expected_outcome: "Je hebt minstens één bruikbaar idee gekregen dat je zonder AI niet direct had bedacht.",
    status: "completed" as const,
    send_at: weeksAgo(2),
  },
  {
    week_number: 4,
    title: "Vraag stellen die je anders aan een collega zou stellen",
    description: "Identificeer een vraag die je normaal aan een collega, Google of een expert zou stellen. Stel hem aan AI. Evalueer het antwoord kritisch — klopt het, is het volledig?",
    expected_outcome: "Je hebt een concrete inschatting van wanneer AI een betrouwbare 'eerste expert' is en wanneer je moet doorzoeken.",
    status: "completed" as const,
    send_at: weeksAgo(1),
  },
  {
    week_number: 5,
    title: "Maak een werkproces 30% sneller met AI",
    description: "Kies één terugkerend werkproces dat je minstens wekelijks uitvoert. Analyseer samen met AI welke stap de meeste tijd kost en automatiseer of versnel die stap. Meet het verschil.",
    expected_outcome: "Je hebt een concreet voor/na-vergelijking en weet welke AI-aanpak het meest tijdwinst oplevert voor dit proces.",
    status: "active" as const,
    send_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dagen geleden
  },
];

// Completions per week: wie heeft het gedaan?
// Jeroen = index 0, Sophie = 1, Mark = 2, Emma = 3
// Week 5: alleen Sophie en Mark klaar (Emma nog niet → sociale druk zichtbaar)
const COMPLETION_MATRIX: Record<number, { userIdx: number; timeSaved: number; sharedPrompt?: string; sharedResult?: string; reflection?: string; isTeamPrompt?: boolean }[]> = {
  1: [
    { userIdx: 0, timeSaved: 20, sharedPrompt: "Schrijf een professionele follow-up e-mail na een kennismaking met een potentiële klant. Toon, niet vertel. Geen buzzwords.", sharedResult: "De e-mail was direct bruikbaar. Ik paste alleen de naam en het gesprekspunt aan — het spaarde me 20 minuten schrijven.", reflection: "De toon klopt pas als je voorbeeldzinnen meegeeft. Zonder context klinkt AI te formeel." },
    { userIdx: 1, timeSaved: 30, sharedPrompt: "Stel je voor als onze accountmanager en schrijf een offerte-aanbiedingsmail die de klant warm maakt voor een gesprek.", sharedResult: "AI begreep de toon direct. Kleine aanpassingen in de openingszin, rest perfect.", reflection: "Rol meegeven in de prompt maakt een groot verschil. AI schrijft dan vanuit perspectief, niet generiek." },
    { userIdx: 2, timeSaved: 15 },
    { userIdx: 3, timeSaved: 25, sharedPrompt: "Schrijf een interne update over de voortgang van project X in maximaal 5 regels.", sharedResult: "Helder en to the point. Collega's reageerden positief op de beknoptheid." },
  ],
  2: [
    { userIdx: 0, timeSaved: 35, sharedPrompt: "Vat dit rapport samen in maximaal 10 punten, gegroepeerd op thema. Gebruik actieve zinnen.", sharedResult: "Dit bespaarde een halfuur lezen. Ik gebruik dit nu standaard voor lange rapporten.", reflection: "Structuur opleggen in de prompt (groepeer op thema) levert een veel bruikbaarder resultaat dan 'vat samen'." },
    { userIdx: 1, timeSaved: 40, sharedPrompt: "Geef me een executive summary van deze e-mailthread in 3 zinnen: wie wil wat, wat is besloten, wat is de volgende stap.", sharedResult: "Briljant voor lange e-mailthreads. Nu dagelijks in gebruik.", reflection: "Drie vaste vragen in de prompt (wie, wat besloten, volgende stap) werkt elke keer. Sla dit op.", isTeamPrompt: true },
    { userIdx: 2, timeSaved: 20 },
    { userIdx: 3, timeSaved: 30 },
  ],
  3: [
    { userIdx: 0, timeSaved: 45, reflection: "AI geeft brede ideeën, maar de selectie is mensenwerk. Ik had 30 minuten nodig om te kiezen en uit te werken — dat is terecht." },
    { userIdx: 1, timeSaved: 25, sharedPrompt: "We hebben een probleem met ons onboardingproces: nieuwe medewerkers voelen zich na week 2 verloren. Geef 5 concrete, kleine verbeteringen.", sharedResult: "Twee van de vijf ideeën hebben we direct opgepakt. Eén ervan — een buddy-systeem — stond al op de backlog maar was nooit concreet gemaakt." },
    { userIdx: 2, timeSaved: 30 },
    { userIdx: 3, timeSaved: 0 },
  ],
  4: [
    { userIdx: 0, timeSaved: 20 },
    { userIdx: 1, timeSaved: 35 },
    { userIdx: 2, timeSaved: 45, sharedPrompt: "Wat zijn de juridische aandachtspunten bij het inhuren van een ZZP'er in Nederland in 2025?", sharedResult: "Goed vertrekpunt maar ik heb het laten checken door onze adviseur. AI geeft een goede eerste scan maar geen garantie op actualiteit — let op.", reflection: "Goed als startpunt, niet als eindconclusie. Bij juridische vragen altijd laten checken.", isTeamPrompt: true },
    { userIdx: 3, timeSaved: 20, reflection: "Ik merkte dat ik AI nu anders gebruik: niet als zoekmachine maar als denkpartner. Dat is de verschuiving." },
  ],
  5: [
    // Alleen Sophie (1) en Mark (2) klaar — Emma (3) nog niet
    { userIdx: 1, timeSaved: 50, sharedPrompt: "Analyseer mijn offerteproces stap voor stap en vertel me welke stap de meeste tijd kost en hoe AI die kan versnellen.", sharedResult: "De AI identificeerde 'het opstellen van de specificatiesectie' als bottleneck. Met een goede template-prompt is die nu in 10 minuten in plaats van 40. Tijdswinst: 30 minuten per offerte.", reflection: "Procesanalyse is waar AI écht waarde toevoegt. Dit had ik zelf nooit zo gestructureerd uitgedacht.", isTeamPrompt: true },
    { userIdx: 2, timeSaved: 30 },
  ],
};

const QA_THREADS = [
  {
    userIdx: 1,
    question: "Hoe zorg ik dat AI mijn schrijfstijl overneemt en niet zo generiek klinkt?",
    answer: "Geef AI altijd voorbeelden van je eigen schrijfstijl mee in de prompt — kopieer twee à drie e-mails die je eerder schreef en zeg expliciet: 'Schrijf in dezelfde stijl als deze voorbeelden.' Voeg ook toe wat je NIET wilt: 'Geen formele aanhef, geen puntje achter elk bullet, korte actieve zinnen.' Na een paar iteraties leer je welke instructies het meeste verschil maken. Sla die op als vaste toevoeging aan je prompts.",
  },
  {
    userIdx: 1,
    question: "Kan ik vertrouwelijke klantinformatie invoeren in ChatGPT?",
    answer: "Nee — niet zonder aanvullende maatregelen. OpenAI kan data gebruiken voor modeltraining tenzij je een Enterprise-account hebt met uitgeschakelde dataretentie. Hanteer de vuistregel: alles wat je niet op een openbaar prikbord zou hangen, gaat niet onbeheerd in een publieke AI. Praktische oplossing: anonimiseer de data eerst (vervang namen, bedragen en specificaties door placeholders) voordat je een prompt opstelt. Claude via de API heeft striktere dataverwerkingsafspraken — vraag Supervised naar de zakelijke opties.",
  },
  {
    userIdx: 2,
    question: "Wat is het verschil tussen Claude en ChatGPT voor ons werk?",
    answer: "Beide zijn capabel, maar hebben een ander karakter. Claude (Anthropic) is sterk in lange documenten, nuance en instructies precies opvolgen — minder kans op 'hallucinations' bij feitelijke vragen. ChatGPT (OpenAI) heeft een breder netwerk van plug-ins en is populairder, wat betekent dat er meer voorbeeldprompts online staan. Voor jullie use cases — e-mails, samenvattingen, probleemanalyse — presteren ze vergelijkbaar. Kies de tool waarvoor je organisatie al een abonnement heeft en ga daarmee consistent oefenen. Wisselen tussen tools vertraagt het leerproces.",
  },
  {
    userIdx: 3,
    question: "Hoe schrijf ik een goede prompt als ik niet precies weet wat ik wil?",
    answer: "Begin met de context, niet de vraag. Beschrijf wie je bent, voor wie je schrijft en wat het doel is — dan pas de instructie. Een goede structuur: 'Ik ben [rol]. Mijn doelgroep is [wie]. Het doel van dit stuk is [waarom]. Schrijf [wat] in maximaal [lengte].' Als je het resultaat niet goed genoeg vindt, zeg dan WAT er niet klopt: 'Te formeel', 'Te lang', 'Mist de urgentie'. AI leert binnen een gesprek snel bij. Itereer in drie stappen voordat je een prompt afschrijft als 'werkt niet'.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function findOrCreateAuthUser(email: string, name: string) {
  // Zoek bestaande auth-user
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users.find((u) => u.email === email);
  if (existing) {
    console.log(`  ✓ Auth-user bestaat al: ${email}`);
    return existing.id;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error || !data.user) throw error ?? new Error(`Geen user voor ${email}`);
  console.log(`  + Auth-user aangemaakt: ${email}`);
  return data.user.id;
}

async function deleteAuthUser(email: string) {
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users.find((u) => u.email === email);
  if (existing) {
    await supabase.auth.admin.deleteUser(existing.id);
    console.log(`  - Auth-user verwijderd: ${email}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function clean() {
  console.log("\n🧹 Demo-data opruimen…");

  // Verwijder auth-users (cascade verwijdert ook users-tabel rijen)
  for (const u of DEMO_USERS) {
    await deleteAuthUser(u.email);
  }

  // Verwijder organisatie
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", "Supervised")
    .maybeSingle();

  if (org) {
    // Cascade via FK: challenges, completions, qa_threads, workshop_contexts worden meegezogen
    const { error } = await supabase.from("organizations").delete().eq("id", org.id);
    if (error) throw error;
    console.log("  - Organisatie 'Supervised' verwijderd");
  }
}

async function seed() {
  console.log("\n🌱 Demo-data aanmaken…\n");

  // 1. Organisatie
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: "Supervised", sector: "AI-consultancy", size: "1-5" })
    .select()
    .single();
  if (orgError) throw orgError;
  console.log(`✅ Organisatie: ${org.name} (${org.id})`);

  // 2. Auth-users + users-tabel
  const userIds: string[] = [];
  for (const u of DEMO_USERS) {
    const authId = await findOrCreateAuthUser(u.email, u.name);
    const { error } = await supabase.from("users").upsert({
      id: authId,
      email: u.email,
      name: u.name,
      role: u.role,
      organization_id: org.id,
    });
    if (error) throw error;
    userIds.push(authId);
  }
  console.log(`\n✅ Gebruikers aangemaakt (${DEMO_USERS.length})`);
  for (let i = 0; i < DEMO_USERS.length; i++) {
    console.log(`   ${DEMO_USERS[i].role.padEnd(7)} ${DEMO_USERS[i].name} — ${DEMO_USERS[i].email}`);
  }

  // 3. Workshop context
  const { data: ctx, error: ctxError } = await supabase
    .from("workshop_contexts")
    .insert({
      organization_id: org.id,
      title: "AI-toepassingen in het Supervised werkproces",
      processes: "Klantacquisitie, contentcreatie, offertes opstellen, klantcommunicatie via e-mail, rapportages maken",
      tools_used: "Claude (Anthropic), ChatGPT (OpenAI), Microsoft Copilot",
      use_cases: "E-maildraften, samenvattingen van documenten, ideeëngeneratie, klantvragen beantwoorden, offertes schrijven",
      notes: "Team bestaat uit 4 personen. Ervaringsniveau: gevorderd beginner. Focus op tijdsbesparing in dagelijkse communicatie en documentverwerking.",
    })
    .select()
    .single();
  if (ctxError) throw ctxError;
  console.log(`\n✅ Workshopcontext aangemaakt: ${ctx.title}`);

  // 4. Challenges
  const challengeIds: string[] = [];
  for (const ch of CHALLENGES) {
    const { data: challenge, error } = await supabase
      .from("challenges")
      .insert({
        organization_id: org.id,
        workshop_context_id: ctx.id,
        week_number: ch.week_number,
        title: ch.title,
        description: ch.description,
        expected_outcome: ch.expected_outcome,
        status: ch.status,
        send_at: ch.send_at,
        emails_sent: true,
      })
      .select()
      .single();
    if (error) throw error;
    challengeIds.push(challenge.id);
  }
  console.log(`\n✅ Challenges aangemaakt (${CHALLENGES.length} weken)`);

  // 5. Completions
  let totalCompletions = 0;
  for (const [weekStr, completions] of Object.entries(COMPLETION_MATRIX)) {
    const weekNum = Number(weekStr);
    const challengeId = challengeIds[weekNum - 1];
    const completedAt = new Date(
      new Date(CHALLENGES[weekNum - 1].send_at).getTime() + 2 * 24 * 60 * 60 * 1000,
    ).toISOString();

    for (const c of completions) {
      const userId = userIds[c.userIdx];
      const { error } = await supabase.from("challenge_completions").insert({
        challenge_id: challengeId,
        user_id: userId,
        organization_id: org.id,
        completed_at: completedAt,
        time_saved_minutes: c.timeSaved,
        shared_prompt: c.sharedPrompt ?? null,
        shared_result: c.sharedResult ?? null,
        reflection: c.reflection ?? null,
        is_team_prompt: c.isTeamPrompt ?? false,
      });
      if (error) throw error;
      totalCompletions++;
    }
  }
  console.log(`\n✅ Completions aangemaakt (${totalCompletions} stuks)`);
  console.log("   Week 5: Sophie ✓, Mark ✓, Emma — (nog te doen → sociale druk zichtbaar)");

  // 6. Q&A threads
  for (const thread of QA_THREADS) {
    const { error } = await supabase.from("qa_threads").insert({
      organization_id: org.id,
      user_id: userIds[thread.userIdx],
      question: thread.question,
      answer: thread.answer,
      workshop_context_id: ctx.id,
    });
    if (error) throw error;
  }
  console.log(`\n✅ Q&A-threads aangemaakt (${QA_THREADS.length} stuks)`);

  // Samenvatting
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Demo klaar! Inloggegevens (wachtwoord voor allen):

   ${DEMO_PASSWORD}

   Admin  : ${DEMO_USERS[0].email}
   Member : ${DEMO_USERS[1].email}
   Member : ${DEMO_USERS[2].email}
   Member : ${DEMO_USERS[3].email}

   Organisatie-id: ${org.id}
   (Als super-admin: /dashboard/admin?orgId=${org.id})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

async function main() {
  if (CLEAN) await clean();
  await seed();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
