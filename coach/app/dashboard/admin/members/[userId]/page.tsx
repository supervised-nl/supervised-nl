import Link from "next/link";
import { notFound } from "next/navigation";

import { PageWrapper } from "@/components/page-wrapper";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { eyebrowClass } from "@/lib/ui";
import { calculateStreak } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}u ${m}m` : `${h}u`;
}

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ orgId?: string }>;
}) {
  const viewer = await requireRole(["admin", "super_admin"]);
  const { userId } = await params;
  const { orgId: orgIdParam } = await searchParams;

  const organizationId = viewer.role === "super_admin" ? orgIdParam ?? null : viewer.organization_id;
  const supabase = viewer.role === "super_admin" ? createServiceClient() : await createClient();

  const [{ data: member }, { data: completions }, { data: challenges }, { data: threads }] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, role, created_at, organization_id")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("challenge_completions")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false }),
    supabase
      .from("challenges")
      .select("id, title, week_number")
      .eq("organization_id", organizationId ?? ""),
    supabase
      .from("qa_threads")
      .select("id, question, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (!member) notFound();

  // Verify the member belongs to the viewer's org (or super_admin can see anyone)
  if (viewer.role !== "super_admin" && member.organization_id !== viewer.organization_id) {
    notFound();
  }

  const challengeById = new Map((challenges ?? []).map((c) => [c.id, c]));
  const streak = calculateStreak(completions ?? [], challenges ?? []);
  const totalMinutes = (completions ?? []).reduce((sum, c) => sum + (c.time_saved_minutes ?? 0), 0);
  const teamPromptCount = (completions ?? []).filter((c) => c.is_team_prompt).length;

  const backHref =
    viewer.role === "super_admin" && orgIdParam
      ? `/dashboard/admin?orgId=${orgIdParam}`
      : "/dashboard/admin";

  return (
    <PageWrapper>
      <div className="flex flex-col gap-1">
        <Link
          href={backHref}
          className="text-supervised-xs text-supervised-ink-4 hover:text-supervised-ink-3 transition-colors"
        >
          ← Terug naar overzicht
        </Link>
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">
          {member.name ?? "Onbekend teamlid"}
        </h1>
        <p className="text-supervised-sm text-supervised-ink-3">{member.email}</p>
      </div>

      <div className="flex flex-wrap gap-6 rounded-supervised-md border border-supervised-rule bg-supervised-surface px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className={eyebrowClass}>Uitdagingen</span>
          <p className="text-supervised-lg font-light text-supervised-ink-1">
            {(completions ?? []).length}
          </p>
        </div>
        {totalMinutes > 0 ? (
          <div className="flex flex-col gap-0.5">
            <span className={eyebrowClass}>Tijd bespaard</span>
            <p className="text-supervised-lg font-light text-supervised-ink-1">
              {formatTime(totalMinutes)}
            </p>
          </div>
        ) : null}
        {streak >= 2 ? (
          <div className="flex flex-col gap-0.5">
            <span className={eyebrowClass}>Reeks</span>
            <p className="text-supervised-lg font-light text-supervised-ink-1">
              {streak} <span className="text-supervised-sm text-supervised-ink-3">weken op rij</span>
            </p>
          </div>
        ) : null}
        {teamPromptCount > 0 ? (
          <div className="flex flex-col gap-0.5">
            <span className={eyebrowClass}>Teamprompts</span>
            <p className="text-supervised-lg font-light text-supervised-ink-1">{teamPromptCount}</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-supervised-md font-light text-supervised-ink-1">Uitdagingen</h2>
        {(completions ?? []).length === 0 ? (
          <p className="text-supervised-ink-3">Nog geen uitdagingen afgerond.</p>
        ) : (
          <ul className="flex flex-col">
            {(completions ?? []).map((completion) => {
              const challenge = challengeById.get(completion.challenge_id);
              return (
                <li
                  key={completion.id}
                  className="flex flex-col gap-2 py-4 border-b border-supervised-rule last:border-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {challenge ? (
                        <span className={eyebrowClass}>Week {challenge.week_number}</span>
                      ) : null}
                      {completion.is_team_prompt ? (
                        <span className="rounded-full bg-supervised-accent-bg text-supervised-accent-text-em px-2 py-0.5 text-supervised-xs">
                          teamprompt
                        </span>
                      ) : null}
                      <span className="text-supervised-xs text-supervised-ink-4">
                        {formatDate(completion.completed_at)}
                      </span>
                    </div>
                    {completion.time_saved_minutes !== null ? (
                      <span className="text-supervised-xs text-supervised-ink-3">
                        {formatTime(completion.time_saved_minutes)} bespaard
                      </span>
                    ) : null}
                  </div>
                  <p className="font-medium text-supervised-ink-1">
                    {challenge?.title ?? "Uitdaging"}
                  </p>
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
                    <div className="flex flex-col gap-0.5">
                      <span className={eyebrowClass}>Reflectie</span>
                      <p className="text-supervised-sm text-supervised-ink-3">{completion.reflection}</p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {threads && threads.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-supervised-md font-light text-supervised-ink-1">Vragen</h2>
          <ul className="flex flex-col">
            {threads.map((thread) => (
              <li
                key={thread.id}
                className="flex flex-col gap-0.5 py-3 border-b border-supervised-rule last:border-0"
              >
                <span className="text-supervised-xs text-supervised-ink-4">
                  {formatDate(thread.created_at)}
                </span>
                <p className="text-supervised-sm text-supervised-ink-2">{thread.question}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </PageWrapper>
  );
}
