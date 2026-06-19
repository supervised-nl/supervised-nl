import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["super_admin", "admin", "member"]);

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
