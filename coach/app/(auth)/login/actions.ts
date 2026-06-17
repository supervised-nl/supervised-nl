"use server";

import { redirect } from "next/navigation";

import { roleHome } from "@/lib/role-home";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Vul je e-mailadres en wachtwoord in." };
  }

  const supabase = await createClient();
  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signIn.user) {
    return { error: "E-mailadres of wachtwoord onjuist." };
  }

  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", signIn.user.id)
    .single();

  if (!user) {
    return { error: "Je account is nog niet volledig ingericht. Vraag je beheerder om dit af te maken." };
  }

  redirect(roleHome(user.role));
}
