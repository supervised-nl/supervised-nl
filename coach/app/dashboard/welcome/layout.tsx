import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

export default async function WelcomeLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["member"]);

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
