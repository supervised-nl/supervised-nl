import { createUser } from "@/actions/users";
import { UserForm } from "@/components/admin/user-form";
import { BackLink } from "@/components/back-link";
import { PageWrapper } from "@/components/page-wrapper";
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

  if (error) throw new Error(error.message);

  return (
    <PageWrapper>
      <BackLink href={orgId ? `/admin/organizations/${orgId}` : "/admin"}>Terug</BackLink>
      <h1 className="text-supervised-xl font-light text-supervised-ink-1">Nieuwe gebruiker</h1>
      <UserForm action={createUser} organizations={organizations} defaultOrganizationId={orgId} />
    </PageWrapper>
  );
}
