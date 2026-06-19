import Link from "next/link";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="self-start link-underline text-supervised-xs uppercase tracking-[0.382em] text-supervised-ink-3 pb-[0.236rem]"
    >
      ← {children}
    </Link>
  );
}
