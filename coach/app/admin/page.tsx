import Link from "next/link";

import { PageWrapper } from "@/components/page-wrapper";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { eyebrowClass } from "@/lib/ui";

export default async function AdminPage() {
  await requireRole(["super_admin"]);

  const supabase = createServiceClient();
  const [
    { data: organizations, error },
    { data: allUsers, error: usersError },
  ] = await Promise.all([
    supabase.from("organizations").select("*").order("created_at", { ascending: false }),
    supabase.from("users").select("organization_id"),
  ]);

  if (error) throw new Error(error.message);
  if (usersError) throw new Error(usersError.message);

  const userCountByOrg = new Map<string, number>();
  for (const user of allUsers) {
    if (!user.organization_id) continue;
    userCountByOrg.set(user.organization_id, (userCountByOrg.get(user.organization_id) ?? 0) + 1);
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-2">
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">Organisaties</h1>
        <p className="text-supervised-sm text-supervised-ink-3">
          {organizations.length} organisatie{organizations.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col">
        {organizations.length === 0 ? (
          <p className="text-supervised-ink-3">Nog geen organisaties aangemaakt.</p>
        ) : (
          organizations.map((org) => (
            <Link
              key={org.id}
              href={`/admin/organizations/${org.id}`}
              className="flex items-center justify-between gap-4 py-4 border-b border-supervised-rule last:border-0 group"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <p className="font-medium text-supervised-ink-1 truncate group-hover:text-supervised-ink-2 transition-colors">
                  {org.name}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {org.sector ? <span className={eyebrowClass}>{org.sector}</span> : null}
                  {org.size ? <span className={eyebrowClass}>{org.size}</span> : null}
                  <span className="text-supervised-xs text-supervised-ink-4">
                    {userCountByOrg.get(org.id) ?? 0} gebruikers
                  </span>
                </div>
              </div>
              <span className="text-supervised-ink-4 transition-colors group-hover:text-supervised-ink-2 shrink-0">→</span>
            </Link>
          ))
        )}
      </div>

      <Link href="/admin/organizations/new" className={buttonVariants({ variant: "outline" })}>
        Nieuwe organisatie
      </Link>
    </PageWrapper>
  );
}
