import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteOrganization, updateOrganization } from "@/actions/organizations";
import { deleteUser } from "@/actions/users";
import { upsertWorkshopContext } from "@/actions/workshop-context";
import { OrganizationForm } from "@/components/admin/organization-form";
import { WorkshopContextForm } from "@/components/admin/workshop-context-form";
import { ConfirmButton } from "@/components/confirm-button";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

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
    { data: workshopContext, error: contextError },
  ] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", orgId).maybeSingle(),
    supabase.from("users").select("*").eq("organization_id", orgId).order("created_at", { ascending: true }),
    supabase
      .from("workshop_contexts")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (orgError) {
    throw new Error(orgError.message);
  }

  if (!org) {
    notFound();
  }

  if (usersError) {
    throw new Error(usersError.message);
  }

  if (contextError) {
    throw new Error(contextError.message);
  }

  return (
    <main className="min-h-screen bg-supervised-bg px-6 pt-(--spacing-header) pb-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        <Link href="/admin" className="link-underline text-supervised-sm text-supervised-ink-3">
          ← Terug naar organisaties
        </Link>

        <section className="flex flex-col gap-4">
          <h1 className="text-supervised-lg font-light text-supervised-ink-1">{org.name}</h1>
          <OrganizationForm
            action={updateOrganization.bind(null, orgId)}
            defaultValues={org}
            submitLabel="Wijzigingen opslaan"
          />
          <form action={deleteOrganization.bind(null, orgId)}>
            <ConfirmButton
              type="submit"
              variant="destructive"
              confirmMessage={`Organisatie "${org.name}" verwijderen? Gebruikers van deze organisatie blijven bestaan maar verliezen de koppeling.`}
            >
              Organisatie verwijderen
            </ConfirmButton>
          </form>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-supervised-md font-light text-supervised-ink-1">Gebruikers</h2>
            <Link href={`/admin/users/new?orgId=${orgId}`} className={buttonVariants({ size: "sm" })}>
              Gebruiker toevoegen
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {users.length === 0 ? (
              <p className="text-supervised-sm text-supervised-ink-3">Nog geen gebruikers in deze organisatie.</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-supervised-sm font-medium text-supervised-ink-1">
                      {user.name ?? user.email}
                    </p>
                    <p className="text-supervised-xs text-supervised-ink-3">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-supervised-xs text-supervised-ink-3">{user.role}</span>
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Wijzigen
                    </Link>
                    <form action={deleteUser.bind(null, user.id, orgId)}>
                      <ConfirmButton
                        type="submit"
                        variant="destructive"
                        size="sm"
                        confirmMessage={`Gebruiker "${user.name ?? user.email}" verwijderen? Dit kan niet ongedaan worden gemaakt.`}
                      >
                        Verwijderen
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-supervised-md font-light text-supervised-ink-1">Workshopcontext</h2>
          <WorkshopContextForm
            action={upsertWorkshopContext.bind(null, orgId)}
            defaultValues={workshopContext ?? undefined}
          />
        </section>

        <div className="flex flex-wrap items-start gap-3 self-start">
          <Link href={`/dashboard/admin?orgId=${orgId}`} className={buttonVariants({ variant: "outline" })}>
            Bekijk teamoverzicht
          </Link>
          <Link href={`/dashboard/member?orgId=${orgId}`} className={buttonVariants({ variant: "outline" })}>
            Bekijk teamdashboard
          </Link>
          <Link href={`/admin/challenges/${orgId}`} className={buttonVariants({ variant: "outline" })}>
            Uitdagingen beheren
          </Link>
        </div>
      </div>
    </main>
  );
}
