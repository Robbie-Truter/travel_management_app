import Widget from "../ui/Widget";
import { CheckCircle, AlertCircle, RefreshCcw, Activity } from "lucide-react";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";

interface ConfirmationWidgetProps {
  tripId: number;
}

const ConfirmationWidget = ({ tripId }: ConfirmationWidgetProps) => {
  const { flights, isLoading: loadingFlights, isError: errF, refetch: refF } = useFlights(tripId);
  const {
    accommodations,
    isLoading: loadingAcc,
    isError: errA,
    refetch: refA,
  } = useAccommodations(tripId);
  const {
    activities,
    isLoading: loadingAct,
    isError: errAct,
    refetch: refAct,
  } = useActivities(tripId);

  const isLoading = loadingFlights || loadingAcc || loadingAct;
  const isError = errF || errA || errAct;

  const stats = useMemo(() => {
    let confirmed = 0;
    let unconfirmed = 0;

    flights.forEach((f) => (f.isConfirmed ? confirmed++ : unconfirmed++));
    accommodations.forEach((a) => (a.isConfirmed ? confirmed++ : unconfirmed++));
    activities.forEach((a) => (a.isConfirmed ? confirmed++ : unconfirmed++));

    return { confirmed, unconfirmed, total: confirmed + unconfirmed };
  }, [flights, accommodations, activities]);

  const progress = stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0;

  return (
    <Widget
      title="Confirmations"
      icon={<CheckCircle size={14} />}
      subtitle={stats.total > 0 ? `${stats.confirmed} of ${stats.total} Confirmed` : undefined}
    >
      <div className="mt-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 py-2"
            >
              <div className="flex justify-between items-end mb-2">
                <div className="h-3 w-16 bg-border/40 rounded animate-pulse" />
                <div className="h-4 w-8 bg-border/40 rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-border/30 rounded-full animate-pulse" />
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="h-16 bg-border/20 rounded-xl animate-pulse" />
                <div className="h-16 bg-border/20 rounded-xl animate-pulse" />
              </div>
            </motion.div>
          ) : isError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-4 flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-pastel-50 dark:bg-rose-pastel-900/30 flex items-center justify-center text-rose-pastel-500 mb-2 border border-rose-pastel-100 dark:border-rose-pastel-800">
                <AlertCircle size={20} />
              </div>
              <p className="text-[10px] font-bold text-text-primary mb-3">Failed to load data</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  refF();
                  refA();
                  refAct();
                }}
                className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider"
              >
                <RefreshCcw size={10} className="mr-1.5" />
                Retry
              </Button>
            </motion.div>
          ) : stats.total === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 flex flex-col items-center text-center text-text-muted"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center mb-2 border border-border/40">
                <Activity size={20} strokeWidth={1.5} className="text-text-muted/50" />
              </div>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                No items added
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-2"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Progress
                </span>
                <span className="text-xs font-black text-lavender-600 dark:text-lavender-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 w-full bg-surface-3 rounded-full overflow-hidden border border-border/50 mb-5 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute left-0 top-0 bottom-0 bg-lavender-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center justify-center text-center group cursor-default hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 transition-colors">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none mb-1">
                    {stats.confirmed}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-widest group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    Confirmed
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 flex flex-col items-center justify-center text-center group cursor-default hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none mb-1">
                    {stats.unconfirmed}
                  </span>
                  <span className="text-[9px] font-bold text-amber-700/70 dark:text-amber-400/70 uppercase tracking-widest group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    Pending
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Widget>
  );
};

export default ConfirmationWidget;
