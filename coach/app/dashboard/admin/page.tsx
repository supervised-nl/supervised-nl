import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { buttonVariants } from "@/components/ui/button";
import { eyebrowClass, statusBadgeClass } from "@/lib/ui";

const STATUS_LABELS: Record<string, string> = {
  active: "Actief",
  completed: "Afgerond",
};

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

  const [{ data: challenges }, { data: statsCompletions }, { data: feedCompletions }, { data: orgUsers }, orgResult] =
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
        .select("id, user_id, challenge_id, shared_prompt, shared_result, time_saved_minutes")
        .eq("organization_id", organizationId)
        .or("shared_prompt.not.is.null,shared_result.not.is.null")
        .order("completed_at", { ascending: false })
        .limit(20),
      supabase.from("users").select("id, name, role").eq("organization_id", organizationId),
      viewingAsSuperAdmin
        ? supabase.from("organizations").select("name").eq("id", organizationId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (viewingAsSuperAdmin && !orgResult?.data) {
    notFound();
  }

  const orgName = orgResult?.data?.name ?? null;

  const memberCount = (orgUsers ?? []).filter((u) => u.role === "member").length;
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

  return (
    <main className="min-h-screen bg-supervised-bg px-6 pt-(--spacing-header) pb-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
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
          {!viewingAsSuperAdmin ? (
            <Link href="/dashboard/member" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Mijn uitdaging
            </Link>
          ) : null}
        </div>

        <div className="rounded-supervised-md border border-supervised-rule bg-supervised-surface p-6 flex flex-col gap-4">
          <div>
            <span className={eyebrowClass}>Teamresultaat</span>
            <p className="text-supervised-xl font-light" style={{ color: "var(--color-supervised-accent)" }}>
              {totalTimeSavedMinutes} minuten
            </p>
            <p className="text-supervised-sm text-supervised-ink-3">
              bespaard door het team op één uitvoering van de opdracht
            </p>
          </div>
          {avgMinutesPerCompletion > 0 ? (
            <div className="border-t border-supervised-rule pt-4 flex flex-col gap-1">
              <span className={eyebrowClass}>Werkelijk potentieel</span>
              <p className="text-supervised-sm text-supervised-ink-2">
                Gemiddeld bespaart een medewerker{" "}
                <span className="font-medium text-supervised-ink-1">{avgMinutesPerCompletion} minuten</span> per keer.
                Dit is gemeten op één uitvoering, maar in de praktijk komt zo&apos;n taak meerdere keren per dag voor.
                Bij 10 herhalingen per dag loopt de besparing op tot{" "}
                <span className="font-medium text-supervised-ink-1">
                  {weeklyHoursPerPerson > 0 ? `${weeklyHoursPerPerson} uur` : `${avgMinutesPerCompletion * 50} minuten`}
                </span>{" "}
                per persoon per week.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-supervised-md font-light text-supervised-ink-1">Challenges en adoptie</h2>
          {challenges && challenges.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {challenges.map((challenge) => {
                const completedCount = completionCountByChallenge.get(challenge.id) ?? 0;
                const adoptionLabel =
                  memberCount === 0
                    ? "n.v.t."
                    : `${Math.round((completedCount / memberCount) * 100)}%`;

                return (
                  <li
                    key={challenge.id}
                    className="flex flex-col gap-2 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className={eyebrowClass}>Week {challenge.week_number}</span>
                        <span className={statusBadgeClass}>
                          {STATUS_LABELS[challenge.status] ?? challenge.status}
                        </span>
                      </div>
                      <p className="font-medium text-supervised-ink-1">{challenge.title}</p>
                    </div>
                    <span className="shrink-0 text-supervised-sm text-supervised-ink-3">
                      {completedCount} van {memberCount} ({adoptionLabel})
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-supervised-ink-3">Nog geen actieve of afgeronde challenges.</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-supervised-md font-light text-supervised-ink-1">Gedeelde prompts en resultaten</h2>
          {feedItems.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {feedItems.map((completion) => (
                <li
                  key={completion.id}
                  className="flex flex-col gap-1 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4"
                >
                  <span className="text-supervised-sm font-medium text-supervised-ink-1">
                    {nameById.get(completion.user_id) ?? "Onbekend teamlid"} ·{" "}
                    {titleByChallenge.get(completion.challenge_id) ?? "Onbekende challenge"}
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
            <p className="text-supervised-ink-3">Nog niemand heeft een prompt of resultaat gedeeld.</p>
          )}
        </div>
      </div>
    </main>
  );
}
