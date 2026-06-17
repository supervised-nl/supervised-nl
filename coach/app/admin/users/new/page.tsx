import Link from "next/link";

import { createUser } from "@/actions/users";
import { UserForm } from "@/components/admin/user-form";
import { requireRole } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ orgId?: string }>;
}) {
  await requireRole(["super_admin"]);
  const { orgId } = await searchParams;

  const supabase = createServiceClient();
  const { data: organizations, error } = await supabase
    .from("organizations")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="min-h-screen bg-supervised-bg px-6 pt-(--spacing-header) pb-12">
      <div className="mx-auto flex max-w-sm flex-col gap-6">
        <Link
          href={orgId ? `/admin/organizations/${orgId}` : "/admin"}
          className="link-underline text-supervised-sm text-supervised-ink-3"
        >
          ← Terug
        </Link>
        <h1 className="text-supervised-lg font-light text-supervised-ink-1">Nieuwe gebruiker</h1>
        <UserForm action={createUser} organizations={organizations} defaultOrganizationId={orgId} />
      </div>
    </main>
  );
}
