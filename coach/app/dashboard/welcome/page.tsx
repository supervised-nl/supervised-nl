import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { markWelcomed } from "./actions";
import { requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function WelcomePage() {
  const user = await requireRole(["member"]);

  const cookieStore = await cookies();
  if (cookieStore.get("coach-welcomed")) {
    redirect("/dashboard/member");
  }

  const firstName = user.name?.split(" ")[0] ?? "daar";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-supervised-sm text-supervised-ink-3">Welkom, {firstName}</p>
          <h1 className="text-supervised-xl font-light text-supervised-ink-1">
            Zo leer je AI echt gebruiken.
          </h1>
          <p className="text-supervised-sm text-supervised-ink-2">
            Elke week een uitdaging, rechtstreeks gebouwd op de AI-workshop die jullie gevolgd hebben.
            Klein genoeg om te doen, groot genoeg om verschil te maken.
          </p>
        </div>

        <ul className="flex flex-col gap-5">
          {[
            {
              label: "Wekelijkse uitdaging",
              description: "Eén uitdaging per week, rechtstreeks uit jullie workshop. Uitvoerbaar in je eigen werk.",
            },
            {
              label: "Ranglijst",
              description: "Zie wie in je team al klaar is. Daag elkaar uit.",
            },
            {
              label: "Vraagbaak",
              description: "Stel vragen over AI in jouw werk. Antwoorden zijn gebonden aan de context van jullie workshop.",
            },
          ].map((item, i) => (
            <li key={item.label} className="flex gap-4">
              <span
                className="mt-0.5 w-5 shrink-0 text-right text-supervised-sm font-light tabular-nums text-supervised-accent"
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-supervised-ink-1">{item.label}</span>
                <span className="text-supervised-sm text-supervised-ink-3">{item.description}</span>
              </div>
            </li>
          ))}
        </ul>

        <form action={markWelcomed}>
          <Button type="submit">
            Bekijk mijn eerste uitdaging →
          </Button>
        </form>
      </div>
    </main>
  );
}
