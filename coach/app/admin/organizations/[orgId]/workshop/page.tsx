import { notFound } from "next/navigation";

import { upsertWorkshopContext } from "@/actions/workshop-context";
import { WorkshopContextForm } from "@/components/admin/workshop-context-form";
import { BackLink } from "@/components/back-link";
import { PageWrapper } from "@/components/page-wrapper";
import { requireRole } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export default async function OrganizationWorkshopPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  await requireRole(["super_admin"]);
  const { orgId } = await params;

  const supabase = createServiceClient();

  const [
    { data: org, error: orgError },
    { data: workshopContext, error: contextError },
  ] = await Promise.all([
    supabase.from("organizations").select("id, name").eq("id", orgId).maybeSingle(),
    supabase
      .from("workshop_contexts")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (orgError) throw new Error(orgError.message);
  if (!org) notFound();
  if (contextError) throw new Error(contextError.message);

  return (
    <PageWrapper>
      <BackLink href={`/admin/organizations/${orgId}`}>Terug naar {org.name}</BackLink>

      <div className="flex flex-col gap-2">
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">Workshop</h1>
        <p className="text-supervised-sm text-supervised-ink-3">
          De context die de vraagbaak gebruikt voor {org.name}. Antwoorden zijn beperkt tot wat hier staat.
        </p>
      </div>

      <WorkshopContextForm
        action={upsertWorkshopContext.bind(null, orgId)}
        defaultValues={workshopContext ?? undefined}
      />
    </PageWrapper>
  );
}
