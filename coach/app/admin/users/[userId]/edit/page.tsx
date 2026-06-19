import { notFound } from "next/navigation";

import { updateUser } from "@/actions/users";
import { UserForm } from "@/components/admin/user-form";
import { BackLink } from "@/components/back-link";
import { PageWrapper } from "@/components/page-wrapper";
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

  if (userError) throw new Error(userError.message);
  if (!user) notFound();
  if (orgError) throw new Error(orgError.message);

  return (
    <PageWrapper>
      <BackLink href={`/admin/organizations/${user.organization_id}`}>Terug</BackLink>
      <h1 className="text-supervised-xl font-light text-supervised-ink-1">Gebruiker wijzigen</h1>
      <UserForm
        mode="edit"
        action={updateUser.bind(null, userId)}
        organizations={organizations}
        defaultValues={user}
      />
    </PageWrapper>
  );
}
