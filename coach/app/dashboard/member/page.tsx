import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { completeChallenge, updateCompletion } from "@/actions/completion";
import { ChallengeCard } from "@/components/challenge-card";
import { CompletionForm } from "@/components/completion-form";
import { CompletionView } from "@/components/completion-view";
import { HintButton } from "@/components/hint-button";
import { PageWrapper } from "@/components/page-wrapper";
import { requireRole } from "@/lib/auth";
import { eyebrowClass } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { calculateStreak, getReflectionPrompt } from "@/lib/utils";

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

  const [{ data: challenge }, { data: allUserCompletions }, { data: allChallenges }] =
    await Promise.all([
      supabase
        .from("challenges")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .lte("send_at", new Date().toISOString())
        .order("week_number", { ascending: false })
        .limit(1)
        .maybeSingle(),
      viewingAsSuperAdmin
        ? Promise.resolve({ data: null })
        : supabase
            .from("challenge_completions")
            .select("challenge_id")
            .eq("user_id", user.id),
      supabase
        .from("challenges")
        .select("id, week_number")
        .eq("organization_id", organizationId),
    ]);

  const streak = !viewingAsSuperAdmin
    ? calculateStreak(allUserCompletions ?? [], allChallenges ?? [])
    : 0;
  const totalDone = allUserCompletions?.length ?? 0;

  if (!challenge) {
    return (
      <PageWrapper>
        {readOnlyBanner}
        <div className="flex flex-col gap-3">
          <h1 className="text-supervised-xl font-light text-supervised-ink-1">
            {viewingAsSuperAdmin ? "Uitdaging van het team" : "Jouw uitdaging"}
          </h1>
          {viewingAsSuperAdmin ? (
            <p className="text-supervised-ink-3">Er is nog geen actieve uitdaging voor {teamLabel}.</p>
          ) : totalDone > 0 ? (
            <p className="text-supervised-sm text-supervised-ink-3">
              Je hebt {totalDone} uitdaging{totalDone !== 1 ? "en" : ""} afgerond.
              {streak >= 2 ? ` ${streak} weken op rij.` : ""} De volgende uitdaging komt eraan.
            </p>
          ) : (
            <p className="text-supervised-ink-3">Je coach bereidt je eerste uitdaging voor.</p>
          )}
        </div>
        {!viewingAsSuperAdmin ? (
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard/member/qa"
              className="self-start link-underline text-supervised-sm text-supervised-ink-3"
            >
              Ondertussen kun je de vraagbaak gebruiken →
            </Link>
            {totalDone > 0 ? (
              <Link
                href="/dashboard/member/history"
                className="self-start link-underline text-supervised-sm text-supervised-ink-3"
              >
                Bekijk je voortgang →
              </Link>
            ) : null}
          </div>
        ) : (
          <Link
            href={`/dashboard/leaderboard?orgId=${organizationId}`}
            className="self-start link-underline text-supervised-sm text-supervised-ink-3"
          >
            Bekijk de ranglijst →
          </Link>
        )}
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
  const teamDoneCount = completions?.length ?? 0;
  const teamTotalCount = orgUsers?.length ?? 0;
  const teamPct = teamTotalCount > 0 ? Math.round((teamDoneCount / teamTotalCount) * 100) : 0;

  return (
    <PageWrapper>
      {readOnlyBanner}
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">
          {viewingAsSuperAdmin ? "Uitdaging van het team" : "Jouw uitdaging"}
        </h1>

        <ChallengeCard challenge={challenge} />

        {/* Primary action immediately after the challenge — no scroll required */}
        {viewingAsSuperAdmin ? null : (
          <div className="flex flex-col gap-4">
            {!ownCompletion ? <HintButton challengeId={challenge.id} /> : null}
            {ownCompletion ? (
              <CompletionView
                completion={ownCompletion}
                updateAction={updateCompletion.bind(null, ownCompletion.id)}
                teamDoneCount={teamDoneCount}
                teamTotalCount={teamTotalCount}
              />
            ) : (
              <CompletionForm
                action={completeChallenge.bind(null, challenge.id)}
                reflectionPrompt={getReflectionPrompt(challenge.week_number)}
              />
            )}

            {streak >= 2 ? (
              <div className="rounded-supervised-md border border-supervised-accent-soft bg-supervised-accent-bg px-4 py-3">
                <p className="text-supervised-sm text-supervised-ink-1">
                  <span className="text-supervised-accent font-medium">{streak} weken op rij.</span>{" "}
                  {streak >= 8 ? "Dit werkt voor je." : streak >= 4 ? "Je doet dit gewoon." : "Je houdt het bij."}
                </p>
              </div>
            ) : null}

            <Link
              href="/dashboard/member/qa"
              className="self-start link-underline text-supervised-sm text-supervised-ink-3"
            >
              Vraag over deze uitdaging? Ga naar de vraagbaak →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h2 className="text-supervised-md font-light text-supervised-ink-1">Wat {teamLabel} deelde</h2>

          {!viewingAsSuperAdmin && !ownCompletion && teamTotalCount > 0 ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-supervised-xs text-supervised-ink-3">
                <span>{teamDoneCount} van {teamTotalCount} teamleden klaar</span>
                <span>{teamPct}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-supervised-surface">
                <div
                  className="h-full rounded-full bg-supervised-accent transition-all"
                  style={{ width: `${teamPct}%` }}
                />
              </div>
            </div>
          ) : null}

          {completions && completions.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {completions.map((completion) => (
                <li
                  key={completion.id}
                  className="flex flex-col gap-3 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-supervised-sm font-medium text-supervised-ink-1">
                        {nameById.get(completion.user_id) ?? "Onbekend teamlid"}
                      </span>
                      {completion.is_team_prompt ? (
                        <span className="rounded-full bg-supervised-accent-bg text-supervised-accent-text-em px-2 py-0.5 text-supervised-xs shrink-0">
                          teamprompt
                        </span>
                      ) : null}
                    </div>
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
                  {completion.reflection ? (
                    <div className="flex flex-col gap-0.5 border-t border-supervised-rule pt-2">
                      <span className={eyebrowClass}>Wat zij leerden</span>
                      <p className="text-supervised-sm text-supervised-ink-3 line-clamp-2">
                        {completion.reflection}
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
