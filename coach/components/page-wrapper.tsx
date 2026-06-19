import { cn } from "@/lib/utils";

export function PageWrapper({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="min-h-screen px-[clamp(1rem,4vw,2.618rem)] pt-(--spacing-header) pb-12">
      <div className={cn("mx-auto flex flex-col gap-8", wide ? "max-w-4xl" : "max-w-xl")}>
        {children}
      </div>
    </main>
  );
}
