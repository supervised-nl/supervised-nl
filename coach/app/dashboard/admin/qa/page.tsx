import { notFound, redirect } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { MarkdownAnswer } from "@/components/markdown-answer";
import { PageWrapper } from "@/components/page-wrapper";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { eyebrowClass } from "@/lib/ui";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AdminQaPage({
  searchParams,
}: {
  searchParams: Promise<{ orgId?: string }>;
}) {
  const user = await requireRole(["admin", "super_admin"]);
  const { orgId: orgIdParam } = await searchParams;
  const viewingAsSuperAdmin = user.role === "super_admin";

  if (viewingAsSuperAdmin && !orgIdParam) {
    redirect("/admin");
  }

  const organizationId = viewingAsSuperAdmin ? orgIdParam! : user.organization_id!;
  const supabase = viewingAsSuperAdmin ? createServiceClient() : await createClient();

  if (viewingAsSuperAdmin) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", organizationId)
      .maybeSingle();
    if (!org) notFound();
  }

  const [{ data: threads }, { data: orgUsers }] = await Promise.all([
    supabase
      .from("qa_threads")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
    supabase
      .from("users")
      .select("id, name")
      .eq("organization_id", organizationId),
  ]);

  const nameById = new Map((orgUsers ?? []).map((u) => [u.id, u.name ?? "Onbekend"]));

  const backHref = viewingAsSuperAdmin
    ? `/dashboard/admin?orgId=${organizationId}`
    : "/dashboard/admin";

  return (
    <PageWrapper>
        <BackLink href={backHref}>Teamoverzicht</BackLink>

        <div className="flex flex-col gap-2">
          <h1 className="text-supervised-xl font-light text-supervised-ink-1">Vragen van het team</h1>
          <p className="text-supervised-sm text-supervised-ink-3">
            {(threads ?? []).length} vraag{(threads ?? []).length !== 1 ? "en" : ""} gesteld
          </p>
        </div>

        {(threads ?? []).length === 0 ? (
          <p className="text-supervised-ink-3">Het team heeft nog geen vragen gesteld.</p>
        ) : (
          <ul className="flex flex-col">
            {(threads ?? []).map((thread) => (
              <li
                key={thread.id}
                className="flex flex-col gap-2 border-b border-supervised-rule py-4 last:border-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={eyebrowClass}>{nameById.get(thread.user_id)}</span>
                  <span className="text-supervised-xs text-supervised-ink-4">
                    {formatDate(thread.created_at)}
                  </span>
                </div>
                <p className="text-supervised-sm font-medium text-supervised-ink-1">{thread.question}</p>
                {thread.answer ? (
                  <div className="border-t border-supervised-rule pt-3">
                    <MarkdownAnswer text={thread.answer} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
    </PageWrapper>
  );
}
