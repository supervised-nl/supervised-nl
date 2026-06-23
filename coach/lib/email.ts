const BASE = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a14;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f0;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">
<tr><td style="padding-bottom:20px;">
<p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#888880;">Supervised Coach</p>
</td></tr>
<tr><td style="background-color:#ffffff;border-radius:10px;padding:32px;border:1px solid #e5e5de;">
{{CONTENT}}
</td></tr>
<tr><td style="padding-top:16px;text-align:center;">
<p style="margin:0;font-size:11px;color:#aaa89c;">coach.supervised.nl</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

function wrap(content: string): string {
  return BASE.replace("{{CONTENT}}", content);
}

function p(text: string, muted = false): string {
  const color = muted ? "#888880" : "#1a1a14";
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${color};">${text}</p>`;
}

function h(text: string): string {
  return `<p style="margin:0 0 8px;font-size:17px;font-weight:600;line-height:1.4;color:#1a1a14;">${text}</p>`;
}

function blockquote(text: string): string {
  return `<div style="margin:16px 0;padding:12px 16px;background-color:#f9f9f7;border-radius:6px;border-left:3px solid #ff6205;">
<p style="margin:0;font-size:14px;line-height:1.6;color:#444440;">${text}</p>
</div>`;
}

function cta(label: string, href: string): string {
  return `<div style="margin:24px 0 0;">
<a href="${href}" style="display:inline-block;padding:12px 24px;background-color:#ff6205;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">${label}</a>
</div>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e5de;margin:20px 0;">`;
}

export function challengeAnnouncementEmail(args: {
  firstName: string;
  challengeTitle: string;
  challengeDescription: string;
  appUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Nieuwe uitdaging: ${args.challengeTitle}`;
  const html = wrap(
    p(`Hoi${args.firstName ? ` ${args.firstName}` : ""},`) +
    p("Er staat een nieuwe uitdaging voor je klaar.") +
    h(args.challengeTitle) +
    blockquote(args.challengeDescription) +
    cta("Bekijk de uitdaging →", `${args.appUrl}/dashboard/member`) +
    divider() +
    p("Je ontvangt dit bericht omdat je deelneemt aan Supervised Coach.", true),
  );
  const text = `Hoi${args.firstName ? ` ${args.firstName}` : ""},\n\nEr staat een nieuwe uitdaging voor je klaar.\n\n${args.challengeTitle}\n\n${args.challengeDescription}\n\nGa naar ${args.appUrl}/dashboard/member om aan de slag te gaan.\n\nGroeten,\nSupervised Coach`;
  return { subject, html, text };
}

export function challengeReminderEmail(args: {
  firstName: string;
  challengeTitle: string;
  challengeDescription: string;
  socialProof: string | null;
  appUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Nog niet gedaan: ${args.challengeTitle}`;
  const html = wrap(
    p(`Hoi${args.firstName ? ` ${args.firstName}` : ""},`) +
    p("Je hebt de uitdaging van deze week nog niet afgerond.") +
    h(args.challengeTitle) +
    blockquote(args.challengeDescription) +
    (args.socialProof ? p(`<em>${args.socialProof}</em>`) : "") +
    cta("Ga aan de slag →", `${args.appUrl}/dashboard/member`) +
    divider() +
    p("Je ontvangt dit bericht omdat je deelneemt aan Supervised Coach.", true),
  );
  const text = `Hoi${args.firstName ? ` ${args.firstName}` : ""},\n\nJe hebt de uitdaging van deze week nog niet afgerond:\n\n${args.challengeTitle}\n\n${args.challengeDescription}\n\n${args.socialProof ? `${args.socialProof}\n\n` : ""}Het kost maar een paar minuten. Ga naar ${args.appUrl}/dashboard/member om te beginnen.\n\nGroeten,\nSupervised Coach`;
  return { subject, html, text };
}

export function inviteEmail(args: {
  name: string;
  orgName: string;
  confirmUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "Je bent uitgenodigd voor Supervised Coach";
  const html = wrap(
    p(`Hoi ${args.name},`) +
    p(`Je bent uitgenodigd voor <strong>Supervised Coach</strong> van ${args.orgName}.`) +
    p("Via de link hieronder stel je je wachtwoord in en kun je meteen aan de slag met de wekelijkse AI-uitdagingen.") +
    cta("Wachtwoord instellen →", args.confirmUrl) +
    divider() +
    p("De link is 24 uur geldig.", true),
  );
  const text = `Hoi ${args.name},\n\nJe bent uitgenodigd voor Supervised Coach van ${args.orgName}.\n\nKlik op de link hieronder om je wachtwoord in te stellen en aan de slag te gaan:\n\n${args.confirmUrl}\n\nDe link is 24 uur geldig.\n\nGroeten,\nSupervised Coach`;
  return { subject, html, text };
}

export function resendInviteEmail(args: {
  name: string;
  orgName: string;
  confirmUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "Stel je wachtwoord in voor Supervised Coach";
  const html = wrap(
    p(`Hoi ${args.name},`) +
    p(`Je kunt via onderstaande link je wachtwoord instellen voor Supervised Coach van ${args.orgName}.`) +
    cta("Wachtwoord instellen →", args.confirmUrl) +
    divider() +
    p("De link is 24 uur geldig.", true),
  );
  const text = `Hoi ${args.name},\n\nJe kunt via onderstaande link je wachtwoord instellen voor Supervised Coach van ${args.orgName}.\n\n${args.confirmUrl}\n\nDe link is 24 uur geldig.\n\nGroeten,\nSupervised Coach`;
  return { subject, html, text };
}
