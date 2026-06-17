import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { headerNavLinkClass } from "@/lib/ui";

async function signOut() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export function LogoutButton() {
  return (
    <form action={signOut} className="contents">
      <button type="submit" className={headerNavLinkClass}>
        uitloggen
      </button>
    </form>
  );
}
