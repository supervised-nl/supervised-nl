import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { PageWrapper } from "@/components/page-wrapper";
import { buttonVariants } from "@/components/ui/button";
import { eyebrowClass, statusBadgeClass } from "@/lib/ui";

const STATUS_LABELS: Record<string, string> = {
  active: "Actief",
  completed: "Afgerond",
};

const NL_STOPWORDS = new Set(["ik", "je", "jij", "de", "het", "een", "is", "hoe", "kan", "wat", "dit", "dat", "voor", "in", "op", "met", "van", "aan", "te", "ze", "we", "ook", "maar", "en", "of", "als", "zo", "niet", "wel", "mijn", "mij", "zijn", "heeft", "hebben", "naar", "bij", "door", "uit", "over", "mee", "nog", "al", "om"]);

function extractTopics(questions: string[]): string[] {
  const freq = new Map<string, number>();
  for (const q of questions) {
    for (const word of q.toLowerCase().split(/\W+/).filter((w) => w.length > 3 && !NL_STOPWORDS.has(w))) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w]) => w);
}

function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes} minuten`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} uur en ${m} minuten` : `${h} uur`;
}

export default async function DashboardAdminPage({
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

  const [{ data: challenges }, { data: statsCompletions }, { data: feedCompletions }, { data: orgUsers }, orgResult, { data: recentThreads }, { data: workshopContext }] =
    await Promise.all([
      supabase
        .from("challenges")
        .select("*")
        .eq("organization_id", organizationId)
        .in("status", ["active", "completed"])
        .order("week_number", { ascending: false }),
      supabase
        .from("challenge_completions")
        .select("challenge_id, time_saved_minutes")
        .eq("organization_id", organizationId),
      supabase
        .from("challenge_completions")
        .select("id, user_id, challenge_id, shared_prompt, shared_result, time_saved_minutes, is_team_prompt")
        .eq("organization_id", organizationId)
        .or("shared_prompt.not.is.null,shared_result.not.is.null")
        .order("completed_at", { ascending: false })
        .limit(10),
      supabase.from("users").select("id, name, role").eq("organization_id", organizationId),
      viewingAsSuperAdmin
        ? supabase.from("organizations").select("name").eq("id", organizationId).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("qa_threads")
        .select("id, user_id, question, created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("workshop_contexts")
        .select("title, use_cases")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (viewingAsSuperAdmin && !orgResult?.data) {
    notFound();
  }

  const orgName = orgResult?.data?.name ?? null;

  const memberCount = (orgUsers ?? []).filter((u) => u.role !== "super_admin").length;
  const nameById = new Map((orgUsers ?? []).map((u) => [u.id, u.name]));
  const titleByChallenge = new Map((challenges ?? []).map((c) => [c.id, c.title]));

  const completionCountByChallenge = new Map<string, number>();
  for (const completion of statsCompletions ?? []) {
    completionCountByChallenge.set(
      completion.challenge_id,
      (completionCountByChallenge.get(completion.challenge_id) ?? 0) + 1,
    );
  }

  const completionsWithTime = (statsCompletions ?? []).filter((c) => c.time_saved_minutes !== null);
  const totalTimeSavedMinutes = completionsWithTime.reduce(
    (sum, c) => sum + (c.time_saved_minutes ?? 0),
    0,
  );
  const avgMinutesPerCompletion =
    completionsWithTime.length > 0
      ? Math.round(totalTimeSavedMinutes / completionsWithTime.length)
      : 0;
  const weeklyHoursPerPerson = Math.round((avgMinutesPerCompletion * 10 * 5) / 60);

  const feedItems = feedCompletions ?? [];
  const allThreads = recentThreads ?? [];
  const threads = allThreads.slice(0, 5);
  const topics = extractTopics(allThreads.map((t) => t.question));

  return (
    <PageWrapper>
        {viewingAsSuperAdmin ? (
          <div className="rounded-supervised-md border border-supervised-rule bg-supervised-surface p-3 text-supervised-sm text-supervised-ink-3">
            Je bekijkt {orgName} als super-admin (alleen-lezen).{" "}
            <Link href={`/admin/organizations/${organizationId}`} className="link-underline">
              Terug naar organisatiebeheer
            </Link>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-supervised-xl font-light text-supervised-ink-1">Teamoverzicht</h1>
          <div className="flex items-center gap-2">
            <Link
              href={viewingAsSuperAdmin ? `/dashboard/admin/rapport?orgId=${organizationId}` : "/dashboard/admin/rapport"}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Rapport
            </Link>
            {viewingAsSuperAdmin ? (
              <Link
                href={`/dashboard/leaderboard?orgId=${organizationId}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Ranglijst
              </Link>
            ) : null}
          </div>
        </div>

        {/* Stats — compact horizontal strip */}
        {totalTimeSavedMinutes > 0 ? (
          <div className="rounded-supervised-md border border-supervised-accent-soft bg-supervised-accent-bg px-5 py-4 flex flex-wrap gap-x-10 gap-y-4">
            <div className="flex flex-col gap-0.5">
              <span className={eyebrowClass}>Tijd bespaard</span>
              <p className="text-supervised-lg font-light text-supervised-ink-1">
                <span className="text-supervised-accent">{totalTimeSavedMinutes}</span>{" "}
                <span className="text-supervised-sm text-supervised-ink-3">minuten door het team</span>
              </p>
            </div>
            {avgMinutesPerCompletion > 0 ? (
              <div className="flex flex-col gap-0.5">
                <span className={eyebrowClass}>Gemiddeld per uitvoering</span>
                <p className="text-supervised-lg font-light text-supervised-ink-1">
                  <span className="text-supervised-accent">{avgMinutesPerCompletion}</span>{" "}
                  <span className="text-supervised-sm text-supervised-ink-3">minuten</span>
                </p>
              </div>
            ) : null}
            {weeklyHoursPerPerson > 0 ? (
              <div className="flex flex-col gap-0.5">
                <span className={eyebrowClass}>Potentieel per persoon</span>
                <p className="text-supervised-lg font-light text-supervised-ink-1">
                  <span className="text-supervised-accent">{weeklyHoursPerPerson}</span>{" "}
                  <span className="text-supervised-sm text-supervised-ink-3">uur per week (10× dagelijks)</span>
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
            <h2 className="text-supervised-md font-light text-supervised-ink-1">Uitdagingen</h2>
            {challenges && challenges.length > 0 ? (
              <div className="flex flex-col">
                {challenges.map((challenge) => {
                  const completedCount = completionCountByChallenge.get(challenge.id) ?? 0;
                  const pct =
                    memberCount > 0
                      ? Math.round((completedCount / memberCount) * 100)
                      : null;
                  return (
                    <div
                      key={challenge.id}
                      className="flex items-start justify-between gap-4 py-3 border-b border-supervised-rule last:border-0"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <p className="text-supervised-sm font-medium text-supervised-ink-1 leading-snug">
                          {challenge.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={eyebrowClass}>Week {challenge.week_number}</span>
                          <span className={statusBadgeClass}>{STATUS_LABELS[challenge.status] ?? challenge.status}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-supervised-sm font-medium text-supervised-ink-1">
                          {pct !== null ? `${pct}%` : "n.v.t."}
                        </p>
                        <p className="text-supervised-xs text-supervised-ink-3">
                          {completedCount}/{memberCount}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-supervised-ink-3">Nog geen actieve of afgeronde challenges.</p>
            )}
          </div>

        {!viewingAsSuperAdmin && (challenges ?? []).length >= 6 ? (
          <div className="rounded-supervised-md border border-supervised-accent-soft bg-supervised-accent-bg p-4 flex flex-col gap-2">
            <p className="text-supervised-sm font-medium text-supervised-ink-1">Jullie team is klaar voor de volgende stap.</p>
            <p className="text-supervised-sm text-supervised-ink-3">
              In {(challenges ?? []).length} weken heeft het team{totalTimeSavedMinutes > 0 ? ` ${formatTime(totalTimeSavedMinutes)} bespaard` : " flink geoefend"}.
              {workshopContext?.title ? ` Jullie workshop richtte zich op ${workshopContext.title}.` : ""} Tijd voor verdieping op nieuwe AI-toepassingen.
            </p>
            <a
              href="https://supervised.nl/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="self-start text-supervised-sm text-supervised-accent hover:text-supervised-ink-1 transition-colors"
            >
              Plan een verdiepingssessie →
            </a>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <h2 className="text-supervised-md font-light text-supervised-ink-1">Gedeeld door het team</h2>
          {feedItems.length > 0 ? (
            <div className="flex flex-col">
              {feedItems.map((completion) => (
                <div
                  key={completion.id}
                  className="flex items-start justify-between gap-3 py-3 border-b border-supervised-rule last:border-0"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-supervised-sm font-medium text-supervised-ink-1 leading-snug">
                        <Link
                          href={viewingAsSuperAdmin
                            ? `/dashboard/admin/members/${completion.user_id}?orgId=${organizationId}`
                            : `/dashboard/admin/members/${completion.user_id}`}
                          className="hover:text-supervised-ink-2 transition-colors"
                        >
                          {nameById.get(completion.user_id) ?? "Onbekend"}
                        </Link>
                        <span className="font-normal text-supervised-ink-3">
                          {" "}· {titleByChallenge.get(completion.challenge_id) ?? "?"}
                        </span>
                      </p>
                      {completion.is_team_prompt ? (
                        <span className="rounded-full bg-supervised-accent-bg text-supervised-accent-text-em px-2 py-0.5 text-supervised-xs shrink-0">
                          teamprompt
                        </span>
                      ) : null}
                    </div>
                    {completion.shared_prompt ? (
                      <p className="text-supervised-xs text-supervised-ink-3 line-clamp-1">
                        {completion.shared_prompt}
                      </p>
                    ) : completion.shared_result ? (
                      <p className="text-supervised-xs text-supervised-ink-3 line-clamp-1">
                        {completion.shared_result}
                      </p>
                    ) : null}
                  </div>
                  {completion.time_saved_minutes !== null ? (
                    <span className="text-supervised-xs text-supervised-ink-3 shrink-0">
                      {completion.time_saved_minutes}min
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-supervised-ink-3">Nog niemand heeft een prompt of resultaat gedeeld.</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-supervised-md font-light text-supervised-ink-1">Vragen van het team</h2>
            {allThreads.length > 0 ? (
              <Link
                href={viewingAsSuperAdmin ? `/dashboard/admin/qa?orgId=${organizationId}` : "/dashboard/admin/qa"}
                className="text-supervised-sm text-supervised-ink-3 transition-colors hover:text-supervised-ink-2"
              >
                Bekijk alles →
              </Link>
            ) : null}
          </div>
          {topics.length > 0 ? (
            <p className="text-supervised-xs text-supervised-ink-4">
              Meest besproken: {topics.join(" · ")}
            </p>
          ) : null}
          {threads.length > 0 ? (
            <div className="flex flex-col">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className="flex flex-col gap-1 py-3 border-b border-supervised-rule last:border-0"
                >
                  <span className={eyebrowClass}>
                    {nameById.get(thread.user_id) ?? "Onbekend teamlid"}
                  </span>
                  <p className="text-supervised-sm text-supervised-ink-3 line-clamp-2">
                    {thread.question}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-supervised-ink-3">Het team heeft nog geen vragen gesteld.</p>
          )}
        </div>
    </PageWrapper>
  );
}
