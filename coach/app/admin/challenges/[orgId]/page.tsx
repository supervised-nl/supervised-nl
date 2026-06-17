import Link from "next/link";
import { notFound } from "next/navigation";

import { activateChallenge, generateChallenge, updateChallenge } from "@/actions/challenge";
import { ChallengeEditor } from "@/components/admin/challenge-editor";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export default async function ChallengesPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  await requireRole(["super_admin"]);
  const { orgId } = await params;

  const supabase = createServiceClient();

  const [
    { data: org, error: orgError },
    { data: challenges, error: challengesError },
  ] = await Promise.all([
    supabase.from("organizations").select("id, name").eq("id", orgId).maybeSingle(),
    supabase.from("challenges").select("*").eq("organization_id", orgId).order("week_number", { ascending: false }),
  ]);

  if (orgError) {
    throw new Error(orgError.message);
  }

  if (!org) {
    notFound();
  }

  if (challengesError) {
    throw new Error(challengesError.message);
  }

  return (
    <main className="min-h-screen bg-supervised-bg px-6 pt-(--spacing-header) pb-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <Link href={`/admin/organizations/${orgId}`} className="link-underline text-supervised-sm text-supervised-ink-3">
          ← Terug naar {org.name}
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-supervised-xl font-light text-supervised-ink-1">Uitdagingen — {org.name}</h1>
          <form action={generateChallenge.bind(null, orgId)}>
            <Button type="submit">Genereer uitdaging</Button>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          {challenges.length === 0 ? (
            <p className="text-supervised-ink-3">Nog geen uitdagingen voor deze organisatie.</p>
          ) : (
            challenges.map((challenge) => (
              <ChallengeEditor
                key={challenge.id}
                challenge={challenge}
                updateAction={updateChallenge.bind(null, challenge.id)}
                activateAction={activateChallenge.bind(null, challenge.id)}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
