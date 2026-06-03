export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-px bg-foreground animate-pulse" aria-hidden="true" />
        <p className="text-nav uppercase tracking-nav text-muted-foreground">Loading</p>
      </div>
    </div>
  );
}
