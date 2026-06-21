import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth";
import { roleHome } from "@/lib/role-home";

export default async function RootPage() {
  const user = await getUser();
  redirect(user ? roleHome(user.role) : "/login");
}
