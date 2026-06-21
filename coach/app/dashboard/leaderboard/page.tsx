import { notFound, redirect } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { PageWrapper } from "@/components/page-wrapper";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";

function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}u ${m}m` : `${h}u`;
}

export default async function LeaderboardPage({
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

  if (viewingAsSuperAdmin) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", organizationId)
      .maybeSingle();
    if (!org) notFound();
  }

  const [{ data: members }, { data: allCompletions }, { data: activeChallenge }] =
    await Promise.all([
      supabase
        .from("users")
        .select("id, name")
        .eq("organization_id", organizationId)
        .in("role", ["member", "admin"]),
      supabase
        .from("challenge_completions")
        .select("user_id, challenge_id, time_saved_minutes, shared_prompt, shared_result")
        .eq("organization_id", organizationId),
      supabase
        .from("challenges")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .maybeSingle(),
    ]);

  const activeChallengeId = activeChallenge?.id ?? null;

  const statsMap = new Map<
    string,
    { count: number; timeSaved: number; sharedCount: number }
  >();

  for (const c of allCompletions ?? []) {
    const prev = statsMap.get(c.user_id) ?? { count: 0, timeSaved: 0, sharedCount: 0 };
    statsMap.set(c.user_id, {
      count: prev.count + 1,
      timeSaved: prev.timeSaved + (c.time_saved_minutes ?? 0),
      sharedCount: prev.sharedCount + (c.shared_prompt || c.shared_result ? 1 : 0),
    });
  }

  const activeCompleterIds = new Set(
    (allCompletions ?? [])
      .filter((c) => c.challenge_id === activeChallengeId)
      .map((c) => c.user_id),
  );

  const rows = (members ?? [])
    .map((m) => {
      const stats = statsMap.get(m.id) ?? { count: 0, timeSaved: 0, sharedCount: 0 };
      const score = stats.count * 10 + Math.floor(stats.timeSaved / 5) + stats.sharedCount * 5;
      return {
        id: m.id,
        name: m.name ?? "Onbekend",
        count: stats.count,
        timeSaved: stats.timeSaved,
        sharedCount: stats.sharedCount,
        doneThisWeek: activeCompleterIds.has(m.id),
        score,
        isMe: m.id === user.id,
      };
    })
    .sort((a, b) => b.score - a.score || b.timeSaved - a.timeSaved);

  return (
    <PageWrapper>
        {viewingAsSuperAdmin ? (
          <>
            <BackLink href={`/admin/organizations/${organizationId}`}>Terug naar organisatiebeheer</BackLink>
            <div className="rounded-supervised-md border border-supervised-rule bg-supervised-surface p-3 text-supervised-sm text-supervised-ink-3">
              Je bekijkt deze ranglijst als super-admin (alleen-lezen).
            </div>
          </>
        ) : null}

        <div className="flex flex-col gap-2">
          <h1 className="text-supervised-xl font-light text-supervised-ink-1">Ranglijst</h1>
          <p className="text-supervised-sm text-supervised-ink-3">
            10 pt per afgeronde uitdaging · 5 pt per gedeeld · 1 pt per 5 minuten bespaard
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="text-supervised-ink-3">Nog geen teamleden op de ranglijst.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {rows.map((row, index) => {
              const rank = index + 1;
              return (
                <li
                  key={row.id}
                  className={cn(
                    "flex items-center gap-4 rounded-supervised-md border bg-supervised-surface p-4",
                    row.isMe ? "border-supervised-accent-soft" : "border-supervised-rule"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 shrink-0 text-center text-supervised-md font-light tabular-nums",
                      rank === 1 ? "text-supervised-accent" : "text-supervised-ink-4"
                    )}
                  >
                    {rank}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-supervised-ink-1">
                        {row.name}
                      </span>
                      {row.isMe ? (
                        <span className="text-supervised-xs text-supervised-ink-3">jij</span>
                      ) : null}
                      {row.doneThisWeek ? (
                        <span className="rounded-full bg-supervised-accent-bg text-supervised-accent-text-em px-2 py-0.5 text-supervised-xs">
                          deze week klaar
                        </span>
                      ) : activeChallengeId ? (
                        <span className="rounded-full border border-supervised-rule px-2 py-0.5 text-supervised-xs text-supervised-ink-4">
                          nog te doen
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-3 text-supervised-xs text-supervised-ink-3">
                      <span>
                        {row.count} uitdaging{row.count !== 1 ? "en" : ""}
                      </span>
                      {row.sharedCount > 0 ? <span>{row.sharedCount}× gedeeld</span> : null}
                      {row.timeSaved > 0 ? <span>{formatTime(row.timeSaved)} bespaard</span> : null}
                    </div>
                  </div>

                  <span className="shrink-0 text-supervised-md font-light tabular-nums text-supervised-accent">
                    {row.score}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
    </PageWrapper>
  );
}
