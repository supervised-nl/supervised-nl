import { createOrganization } from "@/actions/organizations";
import { OrganizationForm } from "@/components/admin/organization-form";
import { BackLink } from "@/components/back-link";
import { PageWrapper } from "@/components/page-wrapper";
import { requireRole } from "@/lib/auth";

export default async function NewOrganizationPage() {
  await requireRole(["super_admin"]);

  return (
    <PageWrapper>
      <BackLink href="/admin">Terug naar organisaties</BackLink>
      <h1 className="text-supervised-xl font-light text-supervised-ink-1">Nieuwe organisatie</h1>
      <OrganizationForm action={createOrganization} submitLabel="Organisatie aanmaken" />
    </PageWrapper>
  );
}
