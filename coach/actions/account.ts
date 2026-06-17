"use server";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type AccountState = { error: string | null; success: string | null };

export async function updateAccount(
  _prevState: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await requireRole(["super_admin", "admin", "member"]);

  const nameRaw = formData.get("name");
  const passwordRaw = formData.get("password");
  const passwordConfirmRaw = formData.get("passwordConfirm");

  const name = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim() : null;
  const password = typeof passwordRaw === "string" ? passwordRaw : "";
  const passwordConfirm = typeof passwordConfirmRaw === "string" ? passwordConfirmRaw : "";

  if (password || passwordConfirm) {
    if (password.length < 8) {
      return { error: "Wachtwoord moet minstens 8 tekens zijn.", success: null };
    }
    if (password !== passwordConfirm) {
      return { error: "Wachtwoorden komen niet overeen.", success: null };
    }
  }

  if (name && name !== user.name) {
    const serviceClient = createServiceClient();
    const { error } = await serviceClient.from("users").update({ name }).eq("id", user.id);

    if (error) {
      return { error: "Naam kon niet worden opgeslagen. Probeer opnieuw.", success: null };
    }
  }

  if (password) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: "Wachtwoord kon niet worden opgeslagen. Probeer opnieuw.", success: null };
    }
  }

  return { error: null, success: "Wijzigingen opgeslagen." };
}
