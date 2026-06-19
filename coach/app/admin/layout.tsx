import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["super_admin"]);

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
