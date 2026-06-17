import Link from "next/link";
import { notFound } from "next/navigation";

import { updateUser } from "@/actions/users";
import { UserForm } from "@/components/admin/user-form";
import { requireRole } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireRole(["super_admin"]);
  const { userId } = await params;

  const supabase = createServiceClient();

  const [
    { data: user, error: userError },
    { data: organizations, error: orgError },
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    supabase.from("organizations").select("id, name").order("name", { ascending: true }),
  ]);

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    notFound();
  }

  if (orgError) {
    throw new Error(orgError.message);
  }

  return (
    <main className="min-h-screen bg-supervised-bg px-6 pt-(--spacing-header) pb-12">
      <div className="mx-auto flex max-w-sm flex-col gap-6">
        <Link
          href={`/admin/organizations/${user.organization_id}`}
          className="link-underline text-supervised-sm text-supervised-ink-3"
        >
          ← Terug
        </Link>
        <h1 className="text-supervised-lg font-light text-supervised-ink-1">Gebruiker wijzigen</h1>
        <UserForm
          mode="edit"
          action={updateUser.bind(null, userId)}
          organizations={organizations}
          defaultValues={user}
        />
      </div>
    </main>
  );
}
