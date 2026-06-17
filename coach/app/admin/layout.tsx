import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";
import { roleHome } from "@/lib/role-home";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["super_admin"]);

  return (
    <>
      <AppHeader homeHref={roleHome(user.role)} />
      {children}
    </>
  );
}
