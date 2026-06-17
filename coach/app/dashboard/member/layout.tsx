import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";
import { roleHome } from "@/lib/role-home";

export default async function DashboardMemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["member", "admin", "super_admin"]);

  return (
    <>
      <AppHeader
        homeHref={roleHome(user.role)}
        qaHref={user.role === "member" || user.role === "admin" ? "/dashboard/member/qa" : undefined}
      />
      {children}
    </>
  );
}
