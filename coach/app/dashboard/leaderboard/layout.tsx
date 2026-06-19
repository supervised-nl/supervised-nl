import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

export default async function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["member", "admin", "super_admin"]);

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
