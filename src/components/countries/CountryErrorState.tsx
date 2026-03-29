import { RefreshCw } from "lucide-react";

interface CountryErrorStateProps {
  onRetry: () => void;
}

export function CountryErrorState({ onRetry }: CountryErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-surface-2 border border-border rounded-2xl">
      <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mb-4">
        <RefreshCw size={32} className="text-rose-500" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">Failed to load country data</h3>
      <p className="text-text-secondary text-center max-w-sm mb-6 px-4">
        Something went wrong while fetching your trip's destination info.
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-lavender-500 hover:bg-lavender-600 text-white rounded-lg font-bold shadow-lg shadow-lavender-500/20 transition-all active:scale-95 cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
