"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export async function upsertWorkshopContext(orgId: string, formData: FormData) {
  await requireRole(["super_admin"]);

  const title = formData.get("title");
  const processes = formData.get("processes");
  const toolsUsed = formData.get("toolsUsed");
  const useCases = formData.get("useCases");
  const notes = formData.get("notes");
  const existingId = formData.get("existingId");

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Titel is verplicht.");
  }

  const fields = {
    title: title.trim(),
    processes: typeof processes === "string" && processes.trim() ? processes.trim() : null,
    tools_used: typeof toolsUsed === "string" && toolsUsed.trim() ? toolsUsed.trim() : null,
    use_cases: typeof useCases === "string" && useCases.trim() ? useCases.trim() : null,
    notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
  };

  const supabase = createServiceClient();

  if (typeof existingId === "string" && existingId) {
    const { error } = await supabase
      .from("workshop_contexts")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", existingId);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("workshop_contexts")
      .insert({ ...fields, organization_id: orgId });

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath(`/admin/organizations/${orgId}`);
}
