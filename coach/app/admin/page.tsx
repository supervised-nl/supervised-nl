import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

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

  if (error) {
    throw new Error(error.message);
  }

  if (usersError) {
    throw new Error(usersError.message);
  }

  const userCountByOrg = new Map<string, number>();
  for (const user of allUsers) {
    if (!user.organization_id) continue;
    userCountByOrg.set(user.organization_id, (userCountByOrg.get(user.organization_id) ?? 0) + 1);
  }

  return (
    <main className="min-h-screen bg-supervised-bg px-6 pt-(--spacing-header) pb-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">Organisaties</h1>

        <Link href="/admin/organizations/new" className={buttonVariants({ className: "self-start" })}>
          Nieuwe organisatie
        </Link>

        <div className="flex flex-col gap-3">
          {organizations.length === 0 ? (
            <p className="text-supervised-ink-3">Nog geen organisaties aangemaakt.</p>
          ) : (
            organizations.map((org) => (
              <Link
                key={org.id}
                href={`/admin/organizations/${org.id}`}
                className="flex items-center justify-between rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4 transition-colors hover:border-supervised-accent-soft"
              >
                <div>
                  <p className="font-medium text-supervised-ink-1">{org.name}</p>
                  <p className="text-supervised-sm text-supervised-ink-3">
                    {org.sector ?? "Geen sector"} · {org.size ?? "Onbekende grootte"}
                  </p>
                </div>
                <span className="text-supervised-sm text-supervised-ink-3">
                  {userCountByOrg.get(org.id) ?? 0} gebruikers
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
