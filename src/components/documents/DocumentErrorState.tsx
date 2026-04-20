import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DocumentErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function DocumentErrorState({
  message = "Failed to load documents",
  onRetry,
}: DocumentErrorStateProps) {
  return (
    <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10">
      <CardContent className="p-8 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="text-rose-600 dark:text-rose-400" size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mb-6">
          {message}. This could be due to a temporary connection issue.
        </p>
        <Button
          variant="secondary"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
