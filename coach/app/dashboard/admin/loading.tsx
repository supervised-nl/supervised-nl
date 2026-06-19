import { PageWrapper } from "@/components/page-wrapper";

export default function Loading() {
  return (
    <PageWrapper>
      <div className="h-9 w-40 animate-pulse rounded-supervised-sm bg-supervised-surface" />
      <div className="rounded-supervised-md border border-supervised-rule bg-supervised-surface p-6 flex flex-col gap-4">
        <div className="h-3 w-24 animate-pulse rounded-supervised-sm bg-supervised-rule" />
        <div className="h-8 w-32 animate-pulse rounded-supervised-sm bg-supervised-rule" />
        <div className="h-4 w-full animate-pulse rounded-supervised-sm bg-supervised-rule" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-supervised-md border border-supervised-rule bg-supervised-surface" />
        ))}
      </div>
    </PageWrapper>
  );
}
