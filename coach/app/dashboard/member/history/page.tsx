import { PageWrapper } from "@/components/page-wrapper";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { eyebrowClass } from "@/lib/ui";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}u ${m}m` : `${h}u`;
}

function calculateStreak(
  completions: Array<{ challenge_id: string }>,
  challenges: Array<{ id: string; week_number: number }>,
): number {
  const weekByChallenge = new Map(challenges.map((c) => [c.id, c.week_number]));
  const completedWeeks = new Set(
    completions.map((c) => weekByChallenge.get(c.challenge_id)).filter((w): w is number => w !== undefined),
  );
  if (completedWeeks.size === 0) return 0;
  const maxWeek = Math.max(...completedWeeks);
  let streak = 0;
  for (let w = maxWeek; w >= 1; w--) {
    if (completedWeeks.has(w)) streak++;
    else break;
  }
  return streak;
}

export default async function HistoryPage() {
  const user = await requireRole(["member", "admin"]);
  const supabase = await createClient();

  const [{ data: completions }, { data: challenges }] = await Promise.all([
    supabase
      .from("challenge_completions")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false }),
    supabase
      .from("challenges")
      .select("id, title, week_number, description")
      .eq("organization_id", user.organization_id!),
  ]);

  const challengeById = new Map((challenges ?? []).map((c) => [c.id, c]));

  const totalMinutes = (completions ?? []).reduce(
    (sum, c) => sum + (c.time_saved_minutes ?? 0),
    0,
  );

  const streak = calculateStreak(completions ?? [], challenges ?? []);

  return (
    <PageWrapper>
        <div className="flex flex-col gap-2">
          <h1 className="text-supervised-xl font-light text-supervised-ink-1">Mijn voortgang</h1>
          {(completions ?? []).length > 0 ? (
            <p className="text-supervised-sm text-supervised-ink-3">
              {completions!.length} uitdaging{completions!.length !== 1 ? "en" : ""} afgerond
              {totalMinutes > 0 ? ` · ${formatTime(totalMinutes)} bespaard` : ""}
              {streak >= 2 ? ` · ${streak} weken op rij voltooid` : ""}
            </p>
          ) : null}
        </div>

        {streak >= 2 ? (
          <div className="rounded-supervised-md border border-supervised-accent-soft bg-supervised-accent-bg px-4 py-3">
            <p className="text-supervised-sm text-supervised-ink-1">
              <span className="text-supervised-accent font-medium">{streak} weken op rij.</span>{" "}
              {streak >= 8
                ? "Dit werkt voor je."
                : streak >= 4
                  ? "Je doet dit gewoon."
                  : "Je houdt het bij."}
            </p>
          </div>
        ) : null}

        {(completions ?? []).length === 0 ? (
          <p className="text-supervised-ink-3">
            Je hebt nog geen uitdagingen afgerond. Ga aan de slag met de actieve uitdaging.
          </p>
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
                      <span className={eyebrowClass}>Wat je leerde</span>
                      <p className="text-supervised-sm text-supervised-ink-3">{completion.reflection}</p>
                    </div>
                  ) : null}
                  {new Date(completion.completed_at).getTime() < Date.now() - 28 * 24 * 60 * 60 * 1000 ? (
                    <p className="text-supervised-xs text-supervised-ink-4 border-t border-supervised-rule pt-2">
                      Gebruik je dit nog in je werk?
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
    </PageWrapper>
  );
}
