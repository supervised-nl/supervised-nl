import type { UserRole } from "@/lib/types";

export function roleHome(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/admin";
    case "admin":
      return "/dashboard/admin";
    case "member":
      return "/dashboard/member";
  }
}
