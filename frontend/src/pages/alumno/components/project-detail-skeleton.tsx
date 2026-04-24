export function ProjectDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      <div className="lg:col-span-8 space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-28 rounded-full bg-muted" />
            <div className="h-6 w-20 rounded-full bg-muted" />
          </div>
          <div className="h-10 w-3/4 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </div>
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-24 rounded-xl bg-muted" />
      </div>
      <div className="lg:col-span-4 space-y-4">
        <div className="h-52 rounded-xl bg-muted" />
        <div className="h-20 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
