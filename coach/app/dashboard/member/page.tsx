import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { completeChallenge, updateCompletion } from "@/actions/completion";
import { ChallengeCard } from "@/components/challenge-card";
import { CompletionForm } from "@/components/completion-form";
import { CompletionView } from "@/components/completion-view";
import { PageWrapper } from "@/components/page-wrapper";
import { requireRole } from "@/lib/auth";
import { eyebrowClass } from "@/lib/ui";
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

  // Onboarding: stuur nieuwe members naar welkomstscherm als ze nog niets hebben gedaan.
  if (user.role === "member") {
    const cookieStore = await cookies();
    if (!cookieStore.get("coach-welcomed")) {
      const { count } = await supabase
        .from("challenge_completions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if ((count ?? 0) === 0) {
        redirect("/dashboard/welcome");
      }
    }
  }

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
    .lte("send_at", new Date().toISOString())
    .order("week_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!challenge) {
    return (
      <PageWrapper>
        {readOnlyBanner}
        <div className="flex flex-col gap-3">
          <h1 className="text-supervised-xl font-light text-supervised-ink-1">
            {viewingAsSuperAdmin ? "Uitdaging van het team" : "Jouw uitdaging"}
          </h1>
          <p className="text-supervised-ink-3">Er is nog geen actieve uitdaging voor {teamLabel}.</p>
        </div>
        <Link
          href={viewingAsSuperAdmin ? `/dashboard/leaderboard?orgId=${organizationId}` : "/dashboard/leaderboard"}
          className="self-start link-underline text-supervised-sm text-supervised-ink-3"
        >
          Bekijk de ranglijst →
        </Link>
      </PageWrapper>
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
    <PageWrapper>
      {readOnlyBanner}
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">
          {viewingAsSuperAdmin ? "Uitdaging van het team" : "Jouw uitdaging"}
        </h1>

        <ChallengeCard challenge={challenge} />

        {viewingAsSuperAdmin ? null : (
          <Link
            href="/dashboard/member/qa"
            className="self-start link-underline text-supervised-sm text-supervised-ink-3"
          >
            Vraag over deze uitdaging? Ga naar de vraagbaak →
          </Link>
        )}

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
                  className="flex flex-col gap-3 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-supervised-sm font-medium text-supervised-ink-1">
                      {nameById.get(completion.user_id) ?? "Onbekend teamlid"}
                    </span>
                    {completion.time_saved_minutes !== null ? (
                      <span className="text-supervised-xs text-supervised-ink-3 shrink-0">
                        {completion.time_saved_minutes} min bespaard
                      </span>
                    ) : null}
                  </div>
                  {completion.shared_prompt ? (
                    <div className="flex flex-col gap-0.5">
                      <span className={eyebrowClass}>Prompt</span>
                      <p className="text-supervised-sm text-supervised-ink-3 line-clamp-3">
                        {completion.shared_prompt}
                      </p>
                    </div>
                  ) : null}
                  {completion.shared_result ? (
                    <div className="flex flex-col gap-0.5">
                      <span className={eyebrowClass}>Resultaat</span>
                      <p className="text-supervised-sm text-supervised-ink-3 line-clamp-3">
                        {completion.shared_result}
                      </p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-supervised-ink-3">Nog niemand heeft deze uitdaging gedeeld.</p>
          )}
        </div>
    </PageWrapper>
  );
}
