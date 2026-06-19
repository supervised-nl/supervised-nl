import { cache } from "react";
import { redirect } from "next/navigation";

import { roleHome } from "@/lib/role-home";
import { createClient } from "@/lib/supabase/server";
import type { User, UserRole } from "@/lib/types";

export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return null;
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  return user;
});

export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await getUser();

  if (!user || !allowedRoles.includes(user.role)) {
    redirect(user ? roleHome(user.role) : "/login");
  }

  return user;
}
