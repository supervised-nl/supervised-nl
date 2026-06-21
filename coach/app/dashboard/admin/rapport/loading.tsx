import { PageWrapper } from "@/components/page-wrapper";

export default function Loading() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-supervised-surface" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-supervised-md bg-supervised-surface" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded bg-supervised-surface" />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
