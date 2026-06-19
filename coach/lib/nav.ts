import type { UserRole } from "@/lib/types";

export interface NavLink {
  href: string;
  label: string;
  exact?: boolean;
}

const MEMBER_LINKS: NavLink[] = [
  { href: "/dashboard/member", label: "Uitdaging", exact: true },
  { href: "/dashboard/member/history", label: "Voortgang", exact: false },
  { href: "/dashboard/leaderboard", label: "Ranglijst", exact: false },
  { href: "/dashboard/member/qa", label: "Vraagbaak", exact: false },
];

const SUPER_ADMIN_LINKS: NavLink[] = [
  { href: "/admin", label: "Organisaties", exact: false },
];

export function getMemberNavLinks(role: UserRole): NavLink[] {
  if (role === "super_admin") return SUPER_ADMIN_LINKS;
  if (role === "admin") {
    return [
      { href: "/dashboard/admin", label: "Overzicht", exact: false },
      ...MEMBER_LINKS,
    ];
  }
  return MEMBER_LINKS;
}
