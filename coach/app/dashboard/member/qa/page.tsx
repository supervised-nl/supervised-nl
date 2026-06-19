import { askQuestion, clearQaHistory } from "@/actions/qa";
import { ConfirmButton } from "@/components/confirm-button";
import { MarkdownAnswer } from "@/components/markdown-answer";
import { PageWrapper } from "@/components/page-wrapper";
import { QaInput } from "@/components/qa-input";
import { requireRole } from "@/lib/auth";
import { eyebrowClass } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";

export default async function QaPage() {
  const user = await requireRole(["member", "admin"]);
  const supabase = await createClient();

  const [{ data: threads }, { data: context }] = await Promise.all([
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
  ]);

  return (
    <PageWrapper>
        <div className="flex flex-col gap-2">
          <h1 className="text-supervised-xl font-light text-supervised-ink-1">Vraagbaak</h1>
          <p className="text-supervised-sm text-supervised-ink-3">
            Stel vragen over AI in jouw werk. Antwoorden zijn gebaseerd op jullie workshop. Vragen die daar buiten vallen beantwoord ik niet — voor nieuwe onderwerpen is een nieuwe workshop nodig.
          </p>
        </div>

        {context ? (
          <div className="flex flex-col gap-3 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4">
            <div className="flex flex-col gap-0.5">
              <span className={eyebrowClass}>Workshopcontext</span>
              <p className="text-supervised-sm font-medium text-supervised-ink-1">{context.title}</p>
            </div>
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
