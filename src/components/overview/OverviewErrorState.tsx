import { AlertCircle, RefreshCw, Smartphone, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface OverviewErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export function OverviewErrorState({
  onRetry,
  message = "We couldn't aggregate your trip overview at this time.",
}: OverviewErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full p-6">
      <Card className="max-w-md w-full border-rose-100 dark:border-rose-900/30 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-rose-500/20 group-hover:bg-rose-500/40 transition-colors" />

        <CardContent className="p-10 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center animate-bounce shadow-inner">
              <AlertCircle className="text-rose-600 dark:text-rose-400" size={40} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-4 border-rose-50 dark:border-slate-900 flex items-center justify-center">
              <WifiOff className="text-rose-500" size={14} />
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
            Syncing Interrupted
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
            {message} This might be due to a temporary connection drop or our data nodes being
            refreshed.
            <span className="block mt-2 font-semibold text-rose-600/80 dark:text-rose-400/80 uppercase tracking-widest text-[9px]">
              Technical Timeout Encountered
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="primary"
              onClick={onRetry}
              className="flex-1 bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 border-none shadow-xl shadow-slate-200 dark:shadow-none font-bold tracking-wide uppercase text-xs h-11"
            >
              <RefreshCw
                size={14}
                className="mr-2 group-hover:rotate-180 transition-transform duration-500"
              />
              Force Re-Sync
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              className="flex-1 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold tracking-wide uppercase text-xs h-11"
            >
              <Smartphone size={14} className="mr-2" />
              Hard Reload
            </Button>
          </div>
        </CardContent>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Status: Disconnected</span>
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        </div>
      </Card>
    </div>
  );
}
