import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

export default async function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["admin", "super_admin"]);

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
