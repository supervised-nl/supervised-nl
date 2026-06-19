import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteOrganization, updateOrganization } from "@/actions/organizations";
import { OrganizationForm } from "@/components/admin/organization-form";
import { BackLink } from "@/components/back-link";
import { ConfirmButton } from "@/components/confirm-button";
import { PageWrapper } from "@/components/page-wrapper";
import { requireRole } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { eyebrowClass } from "@/lib/ui";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  await requireRole(["super_admin"]);
  const { orgId } = await params;

  const supabase = createServiceClient();

  const [
    { data: org, error: orgError },
    { data: users, error: usersError },
  ] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", orgId).maybeSingle(),
    supabase.from("users").select("id, role").eq("organization_id", orgId),
  ]);

  if (orgError) throw new Error(orgError.message);
  if (!org) notFound();
  if (usersError) throw new Error(usersError.message);

  const memberCount = users.filter((u) => u.role === "member").length;

  return (
    <PageWrapper>
      <BackLink href="/admin">Terug naar organisaties</BackLink>

      <div className="flex flex-col gap-2">
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">{org.name}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {org.sector ? <span className={eyebrowClass}>{org.sector}</span> : null}
          {org.size ? <span className={eyebrowClass}>{org.size}</span> : null}
          <span className="text-supervised-xs text-supervised-ink-4">{memberCount} leden</span>
          <span className="text-supervised-ink-4 text-supervised-xs">·</span>
          <Link href={`/dashboard/admin?orgId=${orgId}`} className="text-supervised-xs text-supervised-ink-4 hover:text-supervised-ink-2 transition-colors">
            Teamoverzicht
          </Link>
          <Link href={`/dashboard/member?orgId=${orgId}`} className="text-supervised-xs text-supervised-ink-4 hover:text-supervised-ink-2 transition-colors">
            Teamdashboard
          </Link>
        </div>
      </div>

      <div className="flex flex-col">
        {[
          { href: `/admin/challenges/${orgId}`, label: "Uitdagingen", meta: null },
          { href: `/admin/organizations/${orgId}/gebruikers`, label: "Gebruikers", meta: `${users.length}` },
          { href: `/admin/organizations/${orgId}/workshop`, label: "Workshop", meta: "Context voor de vraagbaak" },
        ].map(({ href, label, meta }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between gap-4 py-4 border-b border-supervised-rule last:border-0 group"
          >
            <div className="flex items-baseline gap-3">
              <p className="text-supervised-sm font-medium text-supervised-ink-1 group-hover:text-supervised-ink-2 transition-colors">
                {label}
              </p>
              {meta ? <span className="text-supervised-xs text-supervised-ink-4">{meta}</span> : null}
            </div>
            <span className="text-supervised-ink-4 group-hover:text-supervised-ink-2 transition-colors shrink-0">→</span>
          </Link>
        ))}
      </div>

      <div className="border-t border-supervised-rule" />

      <OrganizationForm
        action={updateOrganization.bind(null, orgId)}
        defaultValues={org}
        submitLabel="Wijzigingen opslaan"
      />

      <div className="border-t border-supervised-rule" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-supervised-xs text-supervised-ink-4">
          Verwijderen ontkoppelt gebruikers maar verwijdert ze niet.
        </p>
        <form action={deleteOrganization.bind(null, orgId)}>
          <ConfirmButton
            type="submit"
            variant="destructive"
            size="sm"
            confirmMessage={`Organisatie "${org.name}" verwijderen? Gebruikers van deze organisatie blijven bestaan maar verliezen de koppeling.`}
          >
            Verwijderen
          </ConfirmButton>
        </form>
      </div>
    </PageWrapper>
  );
}
