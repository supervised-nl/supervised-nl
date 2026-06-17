import { createClient } from "@supabase/supabase-js";
import ws from "ws";

import type { Database } from "../lib/types";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Geen .env.local — env-vars komen dan uit de shell.
}

const email = process.argv[2] ?? process.env.SEED_SUPER_ADMIN_EMAIL;
const password = process.argv[3] ?? process.env.SEED_SUPER_ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Gebruik: npx tsx scripts/seed-super-admin.ts <email> <wachtwoord>");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn verplicht.");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as never },
});

async function main() {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    throw createError ?? new Error("Geen user terugontvangen van Supabase Auth.");
  }

  const { error: insertError } = await supabase.from("users").insert({
    id: created.user.id,
    role: "super_admin",
    email,
  });

  if (insertError) {
    throw insertError;
  }

  console.log(`Super-admin aangemaakt: ${email} (${created.user.id})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
