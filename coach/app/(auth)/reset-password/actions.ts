"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ResetPasswordState = { error: string | null };

export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = formData.get("password");
  const confirm = formData.get("confirm");

  if (typeof password !== "string" || password.length < 8) {
    return { error: "Wachtwoord moet minimaal 8 tekens zijn." };
  }
  if (password !== confirm) {
    return { error: "Wachtwoorden komen niet overeen." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Wachtwoord wijzigen mislukt. De link is mogelijk verlopen. Vraag een nieuwe aan." };
  }

  redirect("/login");
}
