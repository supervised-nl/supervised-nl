"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import type { OrganizationSize } from "@/lib/types";

function readOrganizationFields(formData: FormData) {
  const name = formData.get("name");
  const sector = formData.get("sector");
  const size = formData.get("size");

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Naam is verplicht.");
  }

  return {
    name: name.trim(),
    sector: typeof sector === "string" && sector.trim() ? sector.trim() : null,
    size: typeof size === "string" && size ? (size as OrganizationSize) : null,
  };
}

export async function createOrganization(formData: FormData) {
  await requireRole(["super_admin"]);
  const fields = readOrganizationFields(formData);

  const supabase = createServiceClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .insert(fields)
    .select("id")
    .single();

  if (error || !org) {
    throw new Error(error?.message ?? "Organisatie aanmaken is mislukt.");
  }

  redirect(`/admin/organizations/${org.id}`);
}

export async function updateOrganization(orgId: string, formData: FormData) {
  await requireRole(["super_admin"]);
  const fields = readOrganizationFields(formData);

  const supabase = createServiceClient();
  const { error } = await supabase.from("organizations").update(fields).eq("id", orgId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/organizations/${orgId}`);
}

export async function deleteOrganization(orgId: string) {
  await requireRole(["super_admin"]);

  const supabase = createServiceClient();
  const { error } = await supabase.from("organizations").delete().eq("id", orgId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  redirect("/admin");
}
