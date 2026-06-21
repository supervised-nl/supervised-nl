import type { Metadata } from "next";

import { LogoMark } from "@/components/logo-mark";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Wachtwoord vergeten | Supervised Coach",
};

export default function ForgotPasswordPage() {
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
          <h1 className="text-supervised-lg font-light text-supervised-ink-1">Wachtwoord vergeten</h1>
          <p className="text-supervised-sm text-supervised-ink-3">
            Vul je e-mailadres in. Als het bekend is, sturen we je een resetlink.
          </p>
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
