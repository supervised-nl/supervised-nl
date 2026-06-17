import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { completeChallenge, updateCompletion } from "@/actions/completion";
import { ChallengeCard } from "@/components/challenge-card";
import { CompletionForm } from "@/components/completion-form";
import { CompletionView } from "@/components/completion-view";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export default async function DashboardMemberPage({
  searchParams,
}: {
  searchParams: Promise<{ orgId?: string }>;
}) {
  const user = await requireRole(["member", "admin", "super_admin"]);
  const { orgId: orgIdParam } = await searchParams;
  const viewingAsSuperAdmin = user.role === "super_admin";

  if (viewingAsSuperAdmin && !orgIdParam) {
    redirect("/admin");
  }

  const organizationId = viewingAsSuperAdmin ? orgIdParam! : user.organization_id!;
  const supabase = viewingAsSuperAdmin ? createServiceClient() : await createClient();
  const teamLabel = viewingAsSuperAdmin ? "het team" : "je team";

  if (viewingAsSuperAdmin) {
    const { data: org } = await supabase.from("organizations").select("id").eq("id", organizationId).maybeSingle();
    if (!org) {
      notFound();
    }
  }

  const readOnlyBanner = viewingAsSuperAdmin ? (
    <div className="rounded-supervised-md border border-supervised-rule bg-supervised-surface p-3 text-supervised-sm text-supervised-ink-3">
      Je bekijkt dit teamdashboard als super-admin (alleen-lezen).{" "}
      <Link href={`/admin/organizations/${organizationId}`} className="link-underline">
        Terug naar organisatiebeheer
      </Link>
    </div>
  ) : null;

  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("week_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!challenge) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-supervised-bg px-6 pt-(--spacing-header) text-center">
        {readOnlyBanner}
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">
          {viewingAsSuperAdmin ? "Uitdaging van het team" : "Jouw uitdaging"}
        </h1>
        <p className="text-supervised-ink-3">Er is nog geen actieve uitdaging voor {teamLabel}.</p>
        {viewingAsSuperAdmin ? null : (
          <Link href="/dashboard/member/qa" className={buttonVariants({ variant: "outline" })}>
            Naar de vraagbaak
          </Link>
        )}
      </main>
    );
  }

  const [{ data: ownCompletion }, { data: completions }, { data: orgUsers }] = await Promise.all([
    viewingAsSuperAdmin
      ? Promise.resolve({ data: null })
      : supabase
          .from("challenge_completions")
          .select("*")
          .eq("challenge_id", challenge.id)
          .eq("user_id", user.id)
          .maybeSingle(),
    supabase
      .from("challenge_completions")
      .select("*")
      .eq("challenge_id", challenge.id)
      .order("completed_at", { ascending: false }),
    supabase.from("users").select("id, name").eq("organization_id", organizationId),
  ]);

  const nameById = new Map((orgUsers ?? []).map((u) => [u.id, u.name]));

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-supervised-bg px-6 pt-(--spacing-header) pb-12">
      <div className="flex w-full max-w-xl flex-col gap-8">
        {readOnlyBanner}
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">
          {viewingAsSuperAdmin ? "Uitdaging van het team" : "Jouw uitdaging"}
        </h1>

        {viewingAsSuperAdmin ? null : (
          <Link href="/dashboard/member/qa" className={buttonVariants({ variant: "outline", className: "self-start" })}>
            Naar de vraagbaak
          </Link>
        )}

        <ChallengeCard challenge={challenge} />

        {viewingAsSuperAdmin ? null : ownCompletion ? (
          <CompletionView
            completion={ownCompletion}
            updateAction={updateCompletion.bind(null, ownCompletion.id)}
          />
        ) : (
          <CompletionForm action={completeChallenge.bind(null, challenge.id)} />
        )}

        <div className="flex flex-col gap-4">
          <h2 className="text-supervised-md font-light text-supervised-ink-1">Wat {teamLabel} deelde</h2>
          {completions && completions.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {completions.map((completion) => (
                <li
                  key={completion.id}
                  className="flex flex-col gap-1 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4"
                >
                  <span className="text-supervised-sm font-medium text-supervised-ink-1">
                    {nameById.get(completion.user_id) ?? "Onbekend teamlid"}
                  </span>
                  {completion.shared_prompt ? (
                    <p className="text-supervised-sm text-supervised-ink-3">Prompt: {completion.shared_prompt}</p>
                  ) : null}
                  {completion.shared_result ? (
                    <p className="text-supervised-sm text-supervised-ink-3">Resultaat: {completion.shared_result}</p>
                  ) : null}
                  {completion.time_saved_minutes !== null ? (
                    <p className="text-supervised-sm text-supervised-ink-3">
                      Tijdsbesparing: {completion.time_saved_minutes} minuten
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-supervised-ink-3">Nog niemand heeft deze uitdaging gedeeld.</p>
          )}
        </div>
      </div>
    </main>
  );
}
