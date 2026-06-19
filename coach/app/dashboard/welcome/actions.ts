"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function markWelcomed() {
  const cookieStore = await cookies();
  cookieStore.set("coach-welcomed", "1", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  redirect("/dashboard/member");
}
