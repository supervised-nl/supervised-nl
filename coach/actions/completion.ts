"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function completeChallenge(challengeId: string, formData: FormData) {
  const user = await requireRole(["member", "admin"]);
  const supabase = await createClient();

  const { sharedPrompt, sharedResult, timeSavedMinutes } = parseCompletionFormData(formData);

  const { error } = await supabase.from("challenge_completions").insert({
    challenge_id: challengeId,
    user_id: user.id,
    organization_id: user.organization_id!,
    shared_prompt: sharedPrompt,
    shared_result: sharedResult,
    time_saved_minutes: timeSavedMinutes,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("Je hebt deze uitdaging al afgerond.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/member");
}

function parseCompletionFormData(formData: FormData) {
  const sharedPromptRaw = formData.get("sharedPrompt");
  const sharedResultRaw = formData.get("sharedResult");
  const timeSavedRaw = formData.get("timeSavedMinutes");

  const sharedPrompt =
    typeof sharedPromptRaw === "string" && sharedPromptRaw.trim() ? sharedPromptRaw.trim() : null;
  const sharedResult =
    typeof sharedResultRaw === "string" && sharedResultRaw.trim() ? sharedResultRaw.trim() : null;

  let timeSavedMinutes: number | null = null;
  if (typeof timeSavedRaw === "string" && timeSavedRaw.trim()) {
    const parsed = Number(timeSavedRaw);
    if (Number.isFinite(parsed) && parsed >= 0) {
      timeSavedMinutes = Math.trunc(parsed);
    }
  }
  if (timeSavedMinutes === null) {
    throw new Error("Vul de tijdsbesparing in minuten in.");
  }

  return { sharedPrompt, sharedResult, timeSavedMinutes };
}

export async function updateCompletion(completionId: string, formData: FormData) {
  const user = await requireRole(["member", "admin"]);
  const { sharedPrompt, sharedResult, timeSavedMinutes } = parseCompletionFormData(formData);

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("challenge_completions")
    .update({ shared_prompt: sharedPrompt, shared_result: sharedResult, time_saved_minutes: timeSavedMinutes })
    .eq("id", completionId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/member");
}
