import { createClient } from "@supabase/supabase-js";
import ws from "ws";

import type { Database } from "../lib/types";

process.loadEnvFile(".env.local");

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws as never } },
);

const PASSWORD = "DemoCoach2026!";

async function createUser(email: string, organizationId: string, role: "admin" | "member", name: string) {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (createError || !created.user) throw createError;

  const { error: insertError } = await supabase.from("users").insert({
    id: created.user.id,
    organization_id: organizationId,
    role,
    name,
    email,
  });
  if (insertError) throw insertError;

  return created.user.id;
}

async function main() {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: "Demo Installatiebedrijf BV", sector: "Installatietechniek", size: "15-50" })
    .select("*")
    .single();
  if (orgError) throw orgError;

  const { data: context, error: contextError } = await supabase
    .from("workshop_contexts")
    .insert({
      organization_id: org.id,
      title: "AI-workshop februari 2026",
      processes: "Offertes opstellen, klantmails beantwoorden, werkbonnen verwerken, planning maken",
      tools_used: "ChatGPT, Outlook, Excel",
      use_cases: "Offertes sneller opstellen, klantcommunicatie verbeteren, planning optimaliseren",
      notes: "Team is enthousiast maar onzeker over wat wel/niet mag met klantgegevens.",
    })
    .select("*")
    .single();
  if (contextError) throw contextError;

  const adminId = await createUser("admin@demo.supervised.nl", org.id, "admin", "Sandra de Boer");
  const memberNames = [
    { email: "lars@demo.supervised.nl", name: "Lars Hendriks" },
    { email: "fatima@demo.supervised.nl", name: "Fatima El Idrissi" },
    { email: "tom@demo.supervised.nl", name: "Tom Veenstra" },
    { email: "noor@demo.supervised.nl", name: "Noor Bakker" },
  ];
  const memberIds: string[] = [];
  for (const m of memberNames) {
    memberIds.push(await createUser(m.email, org.id, "member", m.name));
  }

  const { data: draftChallenge, error: draftError } = await supabase
    .from("challenges")
    .insert({
      organization_id: org.id,
      workshop_context_id: context.id,
      week_number: 4,
      title: "Plan een week vooruit met AI",
      description: "Laat AI helpen bij het indelen van je planning voor volgende week op basis van openstaande klussen.",
      expected_outcome: "Een planningsvoorstel dat je zelf nog kunt bijschaven.",
      status: "draft",
    })
    .select("*")
    .single();
  if (draftError) throw draftError;

  const { data: activeChallenge, error: activeError } = await supabase
    .from("challenges")
    .insert({
      organization_id: org.id,
      workshop_context_id: context.id,
      week_number: 3,
      title: "Beantwoord een klantmail met AI",
      description: "Gebruik AI om een conceptantwoord te schrijven op een klantvraag die binnenkwam deze week.",
      expected_outcome: "Een professioneel conceptantwoord in minder dan 5 minuten.",
      status: "active",
    })
    .select("*")
    .single();
  if (activeError) throw activeError;

  const { data: completedChallenge1, error: completedError1 } = await supabase
    .from("challenges")
    .insert({
      organization_id: org.id,
      workshop_context_id: context.id,
      week_number: 2,
      title: "Stel een offerte op met AI",
      description: "Laat AI een eerste opzet maken voor een offerte op basis van een korte beschrijving van de klus.",
      expected_outcome: "Een offerteconcept dat je alleen nog moet controleren en aanpassen.",
      status: "completed",
    })
    .select("*")
    .single();
  if (completedError1) throw completedError1;

  const { data: completedChallenge2, error: completedError2 } = await supabase
    .from("challenges")
    .insert({
      organization_id: org.id,
      workshop_context_id: context.id,
      week_number: 1,
      title: "Vat een lang e-mailgesprek samen",
      description: "Gebruik AI om een lang e-mailgesprek met een klant samen te vatten in drie zinnen.",
      expected_outcome: "Een duidelijke samenvatting om snel een collega bij te praten.",
      status: "completed",
    })
    .select("*")
    .single();
  if (completedError2) throw completedError2;

  const completions = [
    {
      challenge_id: completedChallenge2.id,
      user_id: memberIds[0],
      shared_prompt: "Vat dit e-mailgesprek met de klant samen in 3 zinnen voor mijn collega.",
      shared_result: "Klant wil de cv-ketel voor vrijdag vervangen, heeft al een offerte gehad, wacht nog op akkoord van de VvE.",
      time_saved_minutes: 10,
    },
    {
      challenge_id: completedChallenge2.id,
      user_id: memberIds[1],
      shared_prompt: null,
      shared_result: null,
      time_saved_minutes: 8,
    },
    {
      challenge_id: completedChallenge2.id,
      user_id: memberIds[2],
      shared_prompt: "Vat dit e-mailgesprek samen voor de planning.",
      shared_result: "Klant verplaatst de afspraak naar volgende week donderdag, wil graag dezelfde monteur.",
      time_saved_minutes: 6,
    },
    {
      challenge_id: completedChallenge1.id,
      user_id: memberIds[0],
      shared_prompt: "Maak een offerteconcept voor het vervangen van een cv-ketel, inclusief arbeid en materiaal.",
      shared_result: "Offerteconcept stond binnen 3 minuten klaar, alleen prijzen nog aangepast.",
      time_saved_minutes: 25,
    },
    {
      challenge_id: completedChallenge1.id,
      user_id: memberIds[3],
      shared_prompt: null,
      shared_result: null,
      time_saved_minutes: 15,
    },
    {
      challenge_id: activeChallenge.id,
      user_id: memberIds[1],
      shared_prompt: "Schrijf een vriendelijk antwoord op deze klacht over een te late afspraak.",
      shared_result: "Antwoord stond klaar in 2 minuten, klant reageerde positief.",
      time_saved_minutes: 12,
    },
  ];

  for (const completion of completions) {
    const { error } = await supabase.from("challenge_completions").insert({
      organization_id: org.id,
      challenge_id: completion.challenge_id,
      user_id: completion.user_id,
      shared_prompt: completion.shared_prompt,
      shared_result: completion.shared_result,
      time_saved_minutes: completion.time_saved_minutes,
    });
    if (error) throw error;
  }

  const { error: qaError } = await supabase.from("qa_threads").insert({
    organization_id: org.id,
    user_id: memberIds[0],
    workshop_context_id: context.id,
    question: "Mag ik klantgegevens in ChatGPT zetten als ik een offerte wil opstellen?",
    answer:
      "Wees terughoudend met persoonsgegevens in algemene AI-tools. Beschrijf de klus in algemene termen (type werk, materialen, duur) zonder naam, adres of contactgegevens van de klant. Vul die pas zelf in nadat je het concept hebt gekregen.",
  });
  if (qaError) throw qaError;

  console.log("Demo-data aangemaakt.\n");
  console.log("Organisatie:", org.name, `(${org.id})`);
  console.log("\nInloggegevens (wachtwoord voor alle demo-accounts):", PASSWORD);
  console.log("\nAdmin:");
  console.log("  admin@demo.supervised.nl  ->  /dashboard/admin");
  console.log("\nMembers:");
  for (const m of memberNames) {
    console.log(`  ${m.email}  ->  /dashboard/member`);
  }
  console.log("\nSuper-admin (bestaand account, info@supervised.nl) ziet deze organisatie op /admin.");
}

main();
