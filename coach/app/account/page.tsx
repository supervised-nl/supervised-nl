import { AccountForm } from "@/components/account-form";
import { requireRole } from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireRole(["super_admin", "admin", "member"]);

  return (
    <main className="min-h-screen bg-supervised-bg px-6 pt-(--spacing-header) pb-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">Account</h1>
        <p className="text-supervised-sm text-supervised-ink-3">{user.email}</p>
        <AccountForm defaultName={user.name} />
      </div>
    </main>
  );
}
