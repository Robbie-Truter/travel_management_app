import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CountriesErrorStateProps {
  onRetry: () => void;
}

export function CountriesErrorState({ onRetry }: CountriesErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-surface-2 border border-border rounded-2xl">
      <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mb-4">
        <RefreshCw size={32} className="text-rose-500" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">Failed to load country data</h3>
      <p className="text-text-secondary text-center max-w-sm mb-6 px-4">
        Something went wrong while fetching your trip's destination info.
      </p>
      <Button
        variant="secondary"
        onClick={onRetry}
        className="px-6 font-bold"
      >
        Try Again
      </Button>
    </div>
  );
}
