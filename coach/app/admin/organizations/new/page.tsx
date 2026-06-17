import Link from "next/link";

import { createOrganization } from "@/actions/organizations";
import { OrganizationForm } from "@/components/admin/organization-form";
import { requireRole } from "@/lib/auth";

export default async function NewOrganizationPage() {
  await requireRole(["super_admin"]);

  return (
    <main className="min-h-screen bg-supervised-bg px-6 pt-(--spacing-header) pb-12">
      <div className="mx-auto flex max-w-sm flex-col gap-6">
        <Link href="/admin" className="link-underline text-supervised-sm text-supervised-ink-3">
          ← Terug naar organisaties
        </Link>
        <h1 className="text-supervised-lg font-light text-supervised-ink-1">Nieuwe organisatie</h1>
        <OrganizationForm action={createOrganization} submitLabel="Organisatie aanmaken" />
      </div>
    </main>
  );
}
