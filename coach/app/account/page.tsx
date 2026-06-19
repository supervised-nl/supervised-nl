import { PageWrapper } from "@/components/page-wrapper";
import { AccountForm } from "@/components/account-form";
import { requireRole } from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireRole(["super_admin", "admin", "member"]);

  return (
    <PageWrapper>
      <h1 className="text-supervised-xl font-light text-supervised-ink-1">Account</h1>
      <p className="text-supervised-sm text-supervised-ink-3">{user.email}</p>
      <AccountForm defaultName={user.name} />
    </PageWrapper>
  );
}
