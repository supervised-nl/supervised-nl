import { PageWrapper } from "@/components/page-wrapper";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { eyebrowClass } from "@/lib/ui";

export default async function TeamPromptsPage() {
  const user = await requireRole(["member", "admin"]);
  const supabase = await createClient();

  const [{ data: completions }, { data: challenges }, { data: orgUsers }] = await Promise.all([
    supabase
      .from("challenge_completions")
      .select("id, user_id, challenge_id, shared_prompt, shared_result, reflection, time_saved_minutes, completed_at")
      .eq("organization_id", user.organization_id!)
      .eq("is_team_prompt", true)
      .order("completed_at", { ascending: false }),
    supabase
      .from("challenges")
      .select("id, title, week_number")
      .eq("organization_id", user.organization_id!),
    supabase
      .from("users")
      .select("id, name")
      .eq("organization_id", user.organization_id!),
  ]);

  const challengeById = new Map((challenges ?? []).map((c) => [c.id, c]));
  const nameById = new Map((orgUsers ?? []).map((u) => [u.id, u.name]));

  return (
    <PageWrapper>
      <div className="flex flex-col gap-2">
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">Teamprompts</h1>
        <p className="text-supervised-sm text-supervised-ink-3">
          De beste AI-prompts en -aanpakken van je team. Gebruik ze als startpunt voor je eigen werk.
        </p>
      </div>

      {!completions || completions.length === 0 ? (
        <p className="text-supervised-ink-3">
          Er zijn nog geen teamprompts. Markeer een inzending als teamprompt om hem hier te tonen.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {completions.map((completion) => {
            const challenge = challengeById.get(completion.challenge_id);
            const name = nameById.get(completion.user_id);
            return (
              <li
                key={completion.id}
                className="flex flex-col gap-3 rounded-supervised-md border border-supervised-accent-soft bg-supervised-accent-bg p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {challenge ? (
                      <span className={eyebrowClass}>Week {challenge.week_number}</span>
                    ) : null}
                    {name ? (
                      <span className="text-supervised-xs text-supervised-ink-3">{name}</span>
                    ) : null}
                  </div>
                  {completion.time_saved_minutes !== null ? (
                    <span className="text-supervised-xs text-supervised-ink-3">
                      {completion.time_saved_minutes} min bespaard
                    </span>
                  ) : null}
                </div>
                {challenge ? (
                  <p className="text-supervised-sm font-medium text-supervised-ink-1">{challenge.title}</p>
                ) : null}
                {completion.shared_prompt ? (
                  <div className="flex flex-col gap-0.5">
                    <span className={eyebrowClass}>Prompt</span>
                    <p className="text-supervised-sm text-supervised-ink-2 whitespace-pre-wrap">
                      {completion.shared_prompt}
                    </p>
                  </div>
                ) : null}
                {completion.shared_result ? (
                  <div className="flex flex-col gap-0.5">
                    <span className={eyebrowClass}>Resultaat</span>
                    <p className="text-supervised-sm text-supervised-ink-3 whitespace-pre-wrap">
                      {completion.shared_result}
                    </p>
                  </div>
                ) : null}
                {completion.reflection ? (
                  <div className="flex flex-col gap-0.5 border-t border-supervised-rule pt-2">
                    <span className={eyebrowClass}>Wat zij leerden</span>
                    <p className="text-supervised-sm text-supervised-ink-3">{completion.reflection}</p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </PageWrapper>
  );
}
