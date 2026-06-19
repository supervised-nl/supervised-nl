import { getResend } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://coach.supervised.nl";
  const now = new Date().toISOString();

  const { data: challenges, error } = await supabase
    .from("challenges")
    .select("id, organization_id, title, description")
    .eq("status", "active")
    .eq("emails_sent", false)
    .lte("send_at", now);

  if (error) {
    console.error("challenge-send cron: ophalen mislukt", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!challenges || challenges.length === 0) {
    return Response.json({ sent: 0 });
  }

  const resend = getResend();
  let totalSent = 0;

  for (const challenge of challenges) {
    const { data: members } = await supabase
      .from("users")
      .select("email, name")
      .eq("organization_id", challenge.organization_id)
      .eq("role", "member");

    for (const member of (members ?? [])) {
      if (!member.email) continue;
      try {
        await resend.emails.send({
          from: "Supervised Coach <coach@supervised.nl>",
          to: member.email,
          subject: `Nieuwe uitdaging: ${challenge.title}`,
          text: `Hoi${member.name ? ` ${member.name.split(" ")[0]}` : ""},\n\nEr staat een nieuwe uitdaging voor je klaar.\n\n${challenge.title}\n\n${challenge.description}\n\nGa naar ${appUrl}/dashboard/member om aan de slag te gaan.\n\nGroeten,\nSupervised Coach`,
        });
        totalSent++;
      } catch (err) {
        console.error(`challenge-send: e-mail mislukt voor ${member.email}:`, err);
      }
    }

    await supabase
      .from("challenges")
      .update({ emails_sent: true })
      .eq("id", challenge.id);
  }

  return Response.json({ sent: totalSent, challenges: challenges.length });
}
