import { PageWrapper } from "@/components/page-wrapper";

export default function Loading() {
  return (
    <PageWrapper>
      <div className="h-9 w-44 animate-pulse rounded-supervised-sm bg-supervised-surface" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-supervised-md border border-supervised-rule bg-supervised-surface" />
        ))}
      </div>
    </PageWrapper>
  );
}
