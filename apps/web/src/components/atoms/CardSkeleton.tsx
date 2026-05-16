export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full max-w-xs mx-auto ${className}`}>
      <div className="w-full rounded-3xl glass-strong border border-white/[0.08] relative overflow-hidden p-6 animate-pulse">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-900/40 via-amber-700/40 to-amber-900/40" />

        <div className="flex items-center justify-between mb-5 mt-1">
          <div className="w-9 h-9 rounded-full bg-white/5" />
          <div className="w-16 h-3 rounded bg-white/5" />
        </div>

        <div className="w-3/4 h-6 rounded bg-white/10 mb-3" />

        <div className="w-full h-4 rounded bg-white/5 mb-5" />
        <div className="w-2/3 h-4 rounded bg-white/5 mb-5" />

        <div className="rounded-2xl px-4 py-3 border border-dashed border-white/10 bg-white/5">
          <div className="w-20 h-2 rounded bg-white/10 mb-2" />
          <div className="w-full h-3 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}