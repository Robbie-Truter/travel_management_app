import { RefreshCw } from "lucide-react";

interface BudgetBreakdownErrorStateProps {
  onRetry: () => void;
}

export function BudgetBreakdownErrorState({ onRetry }: BudgetBreakdownErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-surface-2 border border-border rounded-2xl mt-10 shadow-sm transition-all duration-300">
      <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mb-4 ring-4 ring-white dark:ring-surface-2 shadow-inner">
        <RefreshCw size={32} className="text-rose-500" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">Failed to calculate budget</h3>
      <p className="text-text-secondary text-center max-w-sm mb-6 px-4 leading-relaxed">
        Something went wrong while crunching the numbers for your trip. Please check your connection
        and try again.
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-rose-pastel-500 hover:bg-rose-pastel-600 text-white rounded-lg font-bold shadow-lg shadow-rose-pastel-500/20 transition-all active:scale-95 cursor-pointer ring-2 ring-offset-2 ring-transparent focus:ring-rose-pastel-400 focus:outline-none"
      >
        Recalculate
      </button>
    </div>
  );
}
