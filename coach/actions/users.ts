"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import type { UserRole } from "@/lib/types";

export async function createUser(formData: FormData) {
  await requireRole(["super_admin"]);

  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");
  const organizationId = formData.get("organizationId");

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password ||
    (role !== "admin" && role !== "member") ||
    typeof organizationId !== "string" ||
    !organizationId
  ) {
    throw new Error("Vul alle velden in.");
  }

  const supabase = createServiceClient();
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Gebruiker aanmaken is mislukt.");
  }

  const { error: insertError } = await supabase.from("users").insert({
    id: created.user.id,
    organization_id: organizationId,
    role: role as UserRole,
    name: name.trim(),
    email: email.trim(),
  });

  if (insertError) {
    await supabase.auth.admin.deleteUser(created.user.id);
    throw new Error(insertError.message);
  }

  redirect(`/admin/organizations/${organizationId}`);
}

export async function updateUser(userId: string, formData: FormData) {
  await requireRole(["super_admin"]);

  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");
  const organizationId = formData.get("organizationId");

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    (role !== "admin" && role !== "member") ||
    typeof organizationId !== "string" ||
    !organizationId
  ) {
    throw new Error("Vul alle velden in.");
  }

  if (typeof password === "string" && password.length > 0 && password.length < 8) {
    throw new Error("Wachtwoord moet minimaal 8 tekens zijn.");
  }

  const supabase = createServiceClient();

  const { error: updateError } = await supabase
    .from("users")
    .update({
      organization_id: organizationId,
      role: role as UserRole,
      name: name.trim(),
      email: email.trim(),
    })
    .eq("id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const authUpdate: { email?: string; password?: string } = { email: email.trim() };
  if (typeof password === "string" && password.length > 0) {
    authUpdate.password = password;
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdate);

  if (authError) {
    throw new Error(authError.message);
  }

  revalidatePath(`/admin/organizations/${organizationId}`);
  redirect(`/admin/organizations/${organizationId}`);
}

export async function deleteUser(userId: string, organizationId: string) {
  await requireRole(["super_admin"]);

  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/organizations/${organizationId}`);
  redirect(`/admin/organizations/${organizationId}`);
}
