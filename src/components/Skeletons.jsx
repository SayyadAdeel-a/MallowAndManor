import AnimatedIcon, { ICONS } from "./AnimatedIcon";

export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-brand-blush/40 rounded-2xl mb-3" />
      <div className="h-3 bg-brand-blush/40 rounded w-3/4 mb-2" />
      <div className="h-3 bg-brand-blush/40 rounded w-1/2" />
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <div className="text-center py-20">
      <AnimatedIcon
        path={ICONS.warning}
        animation="shake"
        className="w-12 h-12 mx-auto mb-4 text-brand-wine-dark/30"
        strokeWidth={1.5}
      />
      <p className="text-brand-wine-dark/60 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 text-sm font-medium text-brand-burgundy border border-brand-border hover:border-brand-gold hover:text-brand-gold transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
