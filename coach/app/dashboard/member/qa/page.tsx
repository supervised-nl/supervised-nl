import { askQuestion, clearQaHistory } from "@/actions/qa";
import { ConfirmButton } from "@/components/confirm-button";
import { MarkdownAnswer } from "@/components/markdown-answer";
import { PageWrapper } from "@/components/page-wrapper";
import { QaInput } from "@/components/qa-input";
import { requireRole } from "@/lib/auth";
import { eyebrowClass } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";

const QA_RATE_LIMIT = 10;

export default async function QaPage() {
  const user = await requireRole(["member", "admin"]);
  const supabase = await createClient();

  const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [{ data: threads }, { data: context }, { count: usedCount }, { data: oldestInWindow }] = await Promise.all([
    supabase
      .from("qa_threads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("workshop_contexts")
      .select("title, tools_used, use_cases")
      .eq("organization_id", user.organization_id!)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("qa_threads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", windowStart),
    supabase
      .from("qa_threads")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", windowStart)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const questionsUsed = usedCount ?? 0;
  const questionsRemaining = Math.max(0, QA_RATE_LIMIT - questionsUsed);

  const resetTime = oldestInWindow?.created_at
    ? new Date(new Date(oldestInWindow.created_at).getTime() + 60 * 60 * 1000).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <PageWrapper>
        <div className="flex flex-col gap-2">
          <h1 className="text-supervised-xl font-light text-supervised-ink-1">Vraagbaak</h1>
          <p className="text-supervised-sm text-supervised-ink-3">
            Stel vragen over AI in jouw werk. Antwoorden zijn gebaseerd op jullie workshop. Vragen die buiten de workshopcontext vallen beantwoord ik niet. Voor nieuwe onderwerpen is een nieuwe workshop nodig.
          </p>
          <p className="text-supervised-xs text-supervised-ink-4">
            Antwoorden worden door AI gegenereerd en kunnen fouten bevatten.
          </p>
        </div>

        {context ? (
          <div className="rounded-supervised-md border border-supervised-rule bg-supervised-surface px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <span className={eyebrowClass}>Gebaseerd op</span>
              <p className="text-supervised-sm font-medium text-supervised-ink-1">{context.title}</p>
            </div>
            {(context.tools_used || context.use_cases) ? (
              <details className="mt-2">
                <summary className="text-supervised-xs text-supervised-ink-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  Details
                </summary>
                <div className="flex flex-col gap-3 mt-3">
                  {context.tools_used ? (
                    <div className="flex flex-col gap-0.5">
                      <span className={eyebrowClass}>Tools</span>
                      <p className="text-supervised-sm text-supervised-ink-3">{context.tools_used}</p>
                    </div>
                  ) : null}
                  {context.use_cases ? (
                    <div className="flex flex-col gap-0.5">
                      <span className={eyebrowClass}>Use cases</span>
                      <p className="text-supervised-sm text-supervised-ink-3">{context.use_cases}</p>
                    </div>
                  ) : null}
                </div>
              </details>
            ) : null}
          </div>
        ) : null}

        {questionsUsed > 0 ? (
          <p className={`text-supervised-xs ${questionsRemaining <= 2 ? "text-destructive" : "text-supervised-ink-4"}`}>
            {questionsUsed} van {QA_RATE_LIMIT} vragen gebruikt dit uur
            {questionsRemaining === 0 && resetTime ? ` — je kunt weer vragen stellen om ${resetTime}` : questionsRemaining === 0 ? " — probeer het over een uur opnieuw" : null}.
          </p>
        ) : null}

        <QaInput action={askQuestion} />

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-supervised-md font-light text-supervised-ink-1">Jouw vragen</h2>
            {threads && threads.length > 0 ? (
              <form action={clearQaHistory}>
                <ConfirmButton
                  type="submit"
                  variant="outline"
                  size="sm"
                  confirmMessage="Wil je je hele vraaggeschiedenis wissen? Dit kan niet ongedaan worden gemaakt."
                >
                  Geschiedenis wissen
                </ConfirmButton>
              </form>
            ) : null}
          </div>
          {threads && threads.length > 0 ? (
            <ul className="flex flex-col">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  className="flex flex-col gap-2 border-b border-supervised-rule py-4 last:border-0"
                >
                  <p className="text-supervised-sm font-medium text-supervised-ink-1">{thread.question}</p>
                  {thread.answer ? <MarkdownAnswer text={thread.answer} /> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-supervised-ink-3">Je hebt nog geen vragen gesteld.</p>
          )}
        </div>
    </PageWrapper>
  );
}
