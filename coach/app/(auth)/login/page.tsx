import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/app/(auth)/login/login-form";
import { LogoMark } from "@/components/logo-mark";

export const metadata: Metadata = {
  title: "Inloggen | Supervised Coach",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
          <h1 className="text-supervised-lg font-light text-supervised-ink-1">Inloggen</h1>
          {error === "link-verlopen" ? (
            <p className="text-supervised-sm text-destructive">
              Deze link is verlopen. Vraag een nieuwe resetlink aan.
            </p>
          ) : null}
          <LoginForm />
          <Link
            href="/forgot-password"
            className="self-start text-supervised-sm text-supervised-ink-3 transition-colors hover:text-supervised-ink-2"
          >
            Wachtwoord vergeten?
          </Link>
        </div>
      </div>
    </main>
  );
}
