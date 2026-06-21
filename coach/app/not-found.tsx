import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-supervised-lg font-light text-supervised-ink-1">Pagina niet gevonden</h1>
      <p className="text-supervised-sm text-supervised-ink-3">
        De pagina die je zoekt bestaat niet of is verplaatst.
      </p>
      <Link
        href="/"
        className="text-supervised-sm text-supervised-ink-3 transition-colors hover:text-supervised-ink-2"
      >
        Terug naar home
      </Link>
    </main>
  );
}
