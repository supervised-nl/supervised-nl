"use server";

import { anthropic } from "@/lib/anthropic";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function getChallengeHint(challengeId: string): Promise<string> {
  const user = await requireRole(["member", "admin"]);
  const supabase = await createClient();

  const [{ data: challenge }, { data: context }] = await Promise.all([
    supabase
      .from("challenges")
      .select("title, description")
      .eq("id", challengeId)
      .maybeSingle(),
    supabase
      .from("workshop_contexts")
      .select("tools_used, use_cases, processes")
      .eq("organization_id", user.organization_id!)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!challenge) {
    throw new Error("Uitdaging niet gevonden.");
  }

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Geef één concrete, praktische tip om aan de slag te gaan met deze AI-uitdaging. Maximaal 2 korte zinnen. Direct, in het Nederlands, "je/jouw" aanspreekvorm. Geen inleiding of uitleg.

Uitdaging: ${challenge.title}
${challenge.description}

Beschikbare tools: ${context?.tools_used ?? "onbekend"}
Processen: ${context?.processes ?? "onbekend"}`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error("Tip genereren mislukt.");
  }

  return block.text;
}
