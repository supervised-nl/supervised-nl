import { PageWrapper } from "@/components/page-wrapper";

export default function Loading() {
  return (
    <PageWrapper>
      <div className="h-9 w-48 animate-pulse rounded-supervised-sm bg-supervised-surface" />
      <div className="flex flex-col gap-3 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-6">
        <div className="h-3 w-16 animate-pulse rounded-supervised-sm bg-supervised-rule" />
        <div className="h-5 w-3/4 animate-pulse rounded-supervised-sm bg-supervised-rule" />
        <div className="h-4 w-full animate-pulse rounded-supervised-sm bg-supervised-rule" />
        <div className="h-4 w-2/3 animate-pulse rounded-supervised-sm bg-supervised-rule" />
      </div>
    </PageWrapper>
  );
}
