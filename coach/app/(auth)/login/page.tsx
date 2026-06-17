import type { Metadata } from "next";

import { LoginForm } from "@/app/(auth)/login/login-form";
import { LogoMark } from "@/components/logo-mark";

export const metadata: Metadata = {
  title: "Inloggen — Supervised Coach",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-supervised-bg px-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-[0.382rem] self-center leading-none opacity-80">
          <LogoMark className="h-[1rem] w-[1rem] shrink-0 text-supervised-ink-1" />
          <span className="text-supervised-xs leading-none font-normal tracking-[0.02em] text-supervised-ink-2 lowercase">
            supervised coach
          </span>
        </div>
        <div className="rounded-supervised-md border border-supervised-rule bg-supervised-surface p-8">
          <h1 className="text-supervised-lg font-light text-supervised-ink-1">Inloggen</h1>
          <p className="mt-1 mb-6 text-supervised-sm text-supervised-ink-3">
            Log in om verder te gaan.
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
