import { challengeReminderEmail } from "@/lib/email";
import { getResend } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://coach.supervised.nl";

  // Actieve challenges waarbij send_at precies 3-4 dagen geleden is.
  // Dagelijkse cron garandeert dat elke challenge één keer in dit venster valt.
  const windowStart = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data: challenges, error: challengeError } = await supabase
    .from("challenges")
    .select("id, organization_id, title, description")
    .eq("status", "active")
    .gte("send_at", windowStart)
    .lte("send_at", windowEnd);

  if (challengeError) {
    console.error("Reminder cron: challenges ophalen mislukt", challengeError.message);
    return Response.json({ error: challengeError.message }, { status: 500 });
  }

  if (!challenges || challenges.length === 0) {
    return Response.json({ sent: 0 });
  }

  const resend = getResend();
  let totalSent = 0;

  for (const challenge of challenges) {
    const { data: allMembers } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("organization_id", challenge.organization_id)
      .eq("role", "member");

    const { data: completions } = await supabase
      .from("challenge_completions")
      .select("user_id, time_saved_minutes")
      .eq("challenge_id", challenge.id);

    const completedUserIds = new Set((completions ?? []).map((c) => c.user_id));
    const totalMembers = (allMembers ?? []).length;
    const completedCount = completedUserIds.size;
    const completedPct = totalMembers > 0 ? Math.round((completedCount / totalMembers) * 100) : 0;
    const totalTimeSaved = (completions ?? []).reduce((sum, c) => sum + (c.time_saved_minutes ?? 0), 0);

    const socialProof =
      completedCount > 0
        ? `${completedPct}% van je team heeft de uitdaging al gedaan${totalTimeSaved > 0 ? ` en samen ${totalTimeSaved} minuten bespaard` : ""}. Doe ook mee.`
        : null;

    const recipients = (allMembers ?? []).filter(
      (m) => m.email && !completedUserIds.has(m.id),
    );

    for (const member of recipients) {
      const email = challengeReminderEmail({
        firstName: member.name ? member.name.split(" ")[0] : "",
        challengeTitle: challenge.title,
        challengeDescription: challenge.description,
        socialProof,
        appUrl,
      });
      try {
        await resend.emails.send({
          from: "Supervised Coach <coach@supervised.nl>",
          to: member.email!,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });
        totalSent++;
      } catch (err) {
        console.error(`Reminder mislukt voor ${member.email}:`, err);
      }
    }
  }

  return Response.json({ sent: totalSent, challenges: challenges.length });
}
