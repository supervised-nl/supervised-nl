import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { PrintButton } from "@/components/print-button";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
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

export default async function RapportPage({
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

  const [{ data: challenges }, { data: allCompletions }, { data: orgUsers }, { data: context }, orgResult] =
    await Promise.all([
      supabase
        .from("challenges")
        .select("*")
        .eq("organization_id", organizationId)
        .in("status", ["active", "completed"])
        .order("week_number", { ascending: true }),
      supabase
        .from("challenge_completions")
        .select("*")
        .eq("organization_id", organizationId)
        .order("completed_at", { ascending: false }),
      supabase.from("users").select("id, name, role").eq("organization_id", organizationId),
      supabase
        .from("workshop_contexts")
        .select("title, created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      viewingAsSuperAdmin
        ? supabase.from("organizations").select("name").eq("id", organizationId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (viewingAsSuperAdmin && !orgResult?.data) notFound();

  const orgName = viewingAsSuperAdmin ? (orgResult?.data?.name ?? "") : "";
  const members = (orgUsers ?? []).filter((u) => u.role !== "super_admin");
  const nameById = new Map((orgUsers ?? []).map((u) => [u.id, u.name ?? "Onbekend"]));

  const completionsByChallenge = new Map<string, number>();
  for (const c of allCompletions ?? []) {
    completionsByChallenge.set(c.challenge_id, (completionsByChallenge.get(c.challenge_id) ?? 0) + 1);
  }

  const totalMinutes = (allCompletions ?? []).reduce((sum, c) => sum + (c.time_saved_minutes ?? 0), 0);
  const totalCompletions = (allCompletions ?? []).length;
  const avgMinutes = totalCompletions > 0 ? Math.round(totalMinutes / totalCompletions) : 0;

  const challengeCount = (challenges ?? []).length;
  const memberCount = members.length;
  const participatingMembers = new Set((allCompletions ?? []).map((c) => c.user_id)).size;
  const participationPct = memberCount > 0 ? Math.round((participatingMembers / memberCount) * 100) : 0;

  const highlights = (allCompletions ?? [])
    .filter((c) => c.shared_prompt || c.shared_result)
    .slice(0, 3);

  const periodStart = context?.created_at
    ? formatDate(context.created_at)
    : challenges?.[0]?.created_at
      ? formatDate(challenges[0].created_at)
      : null;

  const backHref = viewingAsSuperAdmin
    ? `/dashboard/admin?orgId=${organizationId}`
    : "/dashboard/admin";

  return (
    <>
      {/* Print-specifieke stijlen: wit papier, donkere tekst, geen decoratie */}
      <style>{`
        @media print {
          body { background: white !important; color: #111 !important; }
          header, #glow, #noise, #glow-pulses { display: none !important; }
          .rapport-root { padding-top: 2rem !important; padding-bottom: 2rem !important; }
          .rapport-card { background: white !important; border-color: #d1d5db !important; }
          .rapport-rule { border-color: #d1d5db !important; }
          .rapport-ink-1 { color: #111 !important; }
          .rapport-ink-2 { color: #333 !important; }
          .rapport-ink-3 { color: #555 !important; }
          .rapport-ink-4 { color: #777 !important; }
          .rapport-accent { color: #111 !important; font-weight: 600; }
          .rapport-bar-track { background: #e5e7eb !important; }
          .rapport-bar-fill { background: #374151 !important; }
          .rapport-eyebrow { color: #555 !important; }
        }
      `}</style>

      <main className="rapport-root min-h-screen px-[clamp(1rem,4vw,2.618rem)] pt-(--spacing-header) pb-16">
        <div className="mx-auto flex max-w-2xl flex-col gap-10">

          {/* Nav, verborgen bij printen */}
          <div className="flex items-center justify-between print:hidden">
            <BackLink href={backHref}>Teamoverzicht</BackLink>
            <PrintButton />
          </div>

          {/* Header */}
          <div className="rapport-rule flex flex-col gap-2 border-b border-supervised-rule pb-6">
            <span className={`rapport-eyebrow ${eyebrowClass}`}>Team rapport · Supervised Coach</span>
            <h1 className="rapport-ink-1 text-supervised-xl font-light text-supervised-ink-1">
              {viewingAsSuperAdmin ? orgName : "Jullie AI-voortgang"}
            </h1>
            <p className="rapport-ink-3 text-supervised-sm text-supervised-ink-3">
              {periodStart ? `Gestart op ${periodStart} · ` : ""}
              Gegenereerd op {formatDate(new Date().toISOString())}
            </p>
          </div>

          {/* KPI's */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rapport-card rapport-rule flex flex-col gap-0.5 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4">
              <span className={`rapport-eyebrow ${eyebrowClass}`}>Uitdagingen</span>
              <p className="rapport-ink-1 text-supervised-lg font-light text-supervised-ink-1">{challengeCount}</p>
            </div>
            <div className="rapport-card rapport-rule flex flex-col gap-0.5 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4">
              <span className={`rapport-eyebrow ${eyebrowClass}`}>Deelname</span>
              <p className="rapport-ink-1 text-supervised-lg font-light text-supervised-ink-1">
                {participationPct}<span className="rapport-ink-3 text-supervised-sm text-supervised-ink-3">%</span>
              </p>
              <p className="rapport-ink-4 text-supervised-xs text-supervised-ink-4">
                {participatingMembers} van {memberCount} teamleden
              </p>
            </div>
            {totalMinutes > 0 ? (
              <div className="rapport-card rapport-rule col-span-2 flex flex-col gap-0.5 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4 sm:col-span-1">
                <span className={`rapport-eyebrow ${eyebrowClass}`}>Tijd bespaard</span>
                <p className="rapport-ink-1 text-supervised-lg font-light text-supervised-ink-1">{formatTime(totalMinutes)}</p>
                {avgMinutes > 0 ? (
                  <p className="rapport-ink-4 text-supervised-xs text-supervised-ink-4">gem. {avgMinutes} min per uitvoering</p>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Deelname-grafiek */}
          {(challenges ?? []).length >= 2 ? (
            <div className="flex flex-col gap-3">
              <h2 className="rapport-ink-1 text-supervised-md font-light text-supervised-ink-1">Deelname per week</h2>
              <svg
                viewBox={`0 0 ${(challenges ?? []).length * 44} 104`}
                className="w-full"
                aria-hidden="true"
              >
                {(challenges ?? []).map((c, i) => {
                  const done = completionsByChallenge.get(c.id) ?? 0;
                  const pct = memberCount > 0 ? done / memberCount : 0;
                  const barH = Math.round(pct * 60);
                  const baseline = 76;
                  const x = i * 44 + 6;
                  return (
                    <g key={c.id} transform={`translate(${x}, 0)`}>
                      <rect
                        x={0}
                        y={baseline - barH}
                        width={32}
                        height={barH}
                        className="rapport-bar-fill fill-supervised-accent"
                        rx={2}
                      />
                      {barH === 0 ? (
                        <rect x={0} y={baseline - 1} width={32} height={1} className="rapport-bar-track fill-supervised-rule" rx={1} />
                      ) : null}
                      <text
                        x={16}
                        y={baseline + 14}
                        textAnchor="middle"
                        fontSize={9}
                        className="rapport-ink-4 fill-supervised-ink-4"
                      >
                        {c.week_number}
                      </text>
                      {barH > 0 ? (
                        <text
                          x={16}
                          y={baseline - barH - 4}
                          textAnchor="middle"
                          fontSize={9}
                          className="rapport-ink-3 fill-supervised-ink-3"
                        >
                          {Math.round(pct * 100)}%
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : null}

          {/* Uitdagingen */}
          <div className="flex flex-col gap-3">
            <h2 className="rapport-ink-1 text-supervised-md font-light text-supervised-ink-1">Uitdagingen</h2>
            <div className="flex flex-col">
              {(challenges ?? []).map((challenge) => {
                const done = completionsByChallenge.get(challenge.id) ?? 0;
                const pct = memberCount > 0 ? Math.round((done / memberCount) * 100) : 0;
                return (
                  <div
                    key={challenge.id}
                    className="rapport-rule flex flex-col gap-2 border-b border-supervised-rule py-4 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className={`rapport-eyebrow ${eyebrowClass}`}>Week {challenge.week_number}</span>
                        <p className="rapport-ink-1 text-supervised-sm font-medium leading-snug text-supervised-ink-1">
                          {challenge.title}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="rapport-ink-1 text-supervised-sm font-medium text-supervised-ink-1">{pct}%</p>
                        <p className="rapport-ink-3 text-supervised-xs text-supervised-ink-3">{done}/{memberCount}</p>
                      </div>
                    </div>
                    <div className="rapport-bar-track h-1.5 overflow-hidden rounded-full bg-supervised-rule">
                      <div
                        className="rapport-bar-fill h-full rounded-full bg-supervised-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gedeelde inzichten */}
          {highlights.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h2 className="rapport-ink-1 text-supervised-md font-light text-supervised-ink-1">Wat het team deelde</h2>
              <div className="flex flex-col gap-3">
                {highlights.map((c) => (
                  <div
                    key={c.id}
                    className="rapport-card rapport-rule flex flex-col gap-2 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4"
                  >
                    <span className="rapport-ink-1 text-supervised-sm font-medium text-supervised-ink-1">
                      {nameById.get(c.user_id)}
                    </span>
                    {c.shared_prompt ? (
                      <div className="flex flex-col gap-0.5">
                        <span className={`rapport-eyebrow ${eyebrowClass}`}>Prompt</span>
                        <p className="rapport-ink-3 text-supervised-sm text-supervised-ink-3 line-clamp-3">{c.shared_prompt}</p>
                      </div>
                    ) : null}
                    {c.shared_result ? (
                      <div className="flex flex-col gap-0.5">
                        <span className={`rapport-eyebrow ${eyebrowClass}`}>Resultaat</span>
                        <p className="rapport-ink-3 text-supervised-sm text-supervised-ink-3 line-clamp-3">{c.shared_result}</p>
                      </div>
                    ) : null}
                    {c.time_saved_minutes ? (
                      <p className="rapport-ink-4 text-supervised-xs text-supervised-ink-4">{c.time_saved_minutes} minuten bespaard</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* CTA */}
          <div className="rapport-card rapport-rule flex flex-col gap-2 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-5 print:border-gray-300">
            <p className="rapport-ink-1 text-supervised-sm font-medium text-supervised-ink-1">Klaar voor een vervolg?</p>
            <p className="rapport-ink-3 text-supervised-sm text-supervised-ink-3">
              Stuur dit rapport naar{" "}
              <a href="mailto:info@supervised.nl?subject=Vervolgtraject%20Supervised%20Coach" className="underline">
                info@supervised.nl
              </a>{" "}
              en we kijken samen wat de volgende stap is.
            </p>
          </div>

          {/* Footer */}
          <div className="rapport-rule flex flex-col gap-1 border-t border-supervised-rule pt-6">
            <p className="rapport-ink-3 text-supervised-xs text-supervised-ink-3">
              Dit rapport is gegenereerd door{" "}
              <Link href="https://supervised.nl" target="_blank" rel="noopener noreferrer" className="underline">
                Supervised Coach
              </Link>
              . AI-workshops voor Nederlands MKB.
            </p>
            <p className="rapport-ink-4 text-supervised-xs text-supervised-ink-4">
              supervised.nl · info@supervised.nl
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
