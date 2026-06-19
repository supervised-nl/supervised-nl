"use server";

import { createClient } from "@/lib/supabase/server";

export type ForgotPasswordState = { error: string | null; sent: boolean };

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.trim()) {
    return { error: "Vul je e-mailadres in.", sent: false };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: "Verzenden mislukt. Probeer het later opnieuw.", sent: false };
  }

  // Altijd succesvol tonen — geen informatie lekken over welke e-mails bestaan.
  return { error: null, sent: true };
}
