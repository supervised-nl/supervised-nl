import { PageWrapper } from "@/components/page-wrapper";
import { AccountForm } from "@/components/account-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { eyebrowClass } from "@/lib/ui";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Platform beheerder",
  admin: "Beheerder",
  member: "Deelnemer",
};

export default async function AccountPage() {
  const user = await requireRole(["super_admin", "admin", "member"]);

  let organizationName: string | null = null;
  if (user.organization_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", user.organization_id)
      .single();
    organizationName = data?.name ?? null;
  }

  const aangemeldOp = new Date(user.created_at).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <PageWrapper>
      <div className="flex flex-col gap-1">
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">Account</h1>
        <p className="text-supervised-sm text-supervised-ink-3">Beheer je accountgegevens.</p>
      </div>

      <div className="flex flex-col gap-3">
        {organizationName ? (
          <div className="flex flex-col gap-0.5">
            <span className={eyebrowClass}>Organisatie</span>
            <span className="text-supervised-sm text-supervised-ink-2">
              {organizationName}{" "}
              <span className="text-supervised-ink-3">, {ROLE_LABELS[user.role]}</span>
            </span>
          </div>
        ) : null}
        <div className="flex flex-col gap-0.5">
          <span className={eyebrowClass}>Lid sinds</span>
          <span className="text-supervised-sm text-supervised-ink-3">{aangemeldOp}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className={eyebrowClass}>E-mailadres</span>
          <span className="text-supervised-sm text-supervised-ink-3">{user.email}</span>
        </div>
      </div>

      <AccountForm defaultName={user.name} />
    </PageWrapper>
  );
}
