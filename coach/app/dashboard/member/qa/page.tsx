import Link from "next/link";

import { askQuestion, clearQaHistory } from "@/actions/qa";
import { ConfirmButton } from "@/components/confirm-button";
import { MarkdownAnswer } from "@/components/markdown-answer";
import { QaInput } from "@/components/qa-input";
import { buttonVariants } from "@/components/ui/button";
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
    <main className="flex min-h-screen flex-col items-center gap-8 bg-supervised-bg px-6 pt-(--spacing-header) pb-12">
      <div className="flex w-full max-w-xl flex-col gap-8">
        <h1 className="text-supervised-xl font-light text-supervised-ink-1">Vraagbaak</h1>

        <Link href="/dashboard/member" className={buttonVariants({ variant: "outline", className: "self-start" })}>
          Terug naar dashboard
        </Link>

        {context ? (
          <div className="flex flex-col gap-1 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4">
            <span className={eyebrowClass}>Jouw workshop</span>
            <p className="text-supervised-sm text-supervised-ink-1">{context.title}</p>
            {context.tools_used ? (
              <p className="text-supervised-sm text-supervised-ink-3">Tools: {context.tools_used}</p>
            ) : null}
            {context.use_cases ? (
              <p className="text-supervised-sm text-supervised-ink-3">Use cases: {context.use_cases}</p>
            ) : null}
          </div>
        ) : null}

        <QaInput action={askQuestion} />

        <div className="flex flex-col gap-4">
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
            <ul className="flex flex-col gap-3">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  className="flex flex-col gap-2 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4"
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
      </div>
    </main>
  );
}
