import type { Metadata } from "next";

import { LogoMark } from "@/components/logo-mark";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Nieuw wachtwoord — Supervised Coach",
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex items-center gap-[0.382rem] self-center leading-none opacity-80">
          <LogoMark className="h-[1rem] w-[1rem] shrink-0 text-supervised-ink-1" />
          <span className="text-supervised-xs leading-none font-normal tracking-[0.02em] text-supervised-ink-2 lowercase">
            supervised coach
          </span>
        </div>
        <div className="flex flex-col gap-6">
          <h1 className="text-supervised-lg font-light text-supervised-ink-1">Nieuw wachtwoord</h1>
          <p className="text-supervised-sm text-supervised-ink-3">
            Kies een nieuw wachtwoord van minimaal 8 tekens.
          </p>
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
