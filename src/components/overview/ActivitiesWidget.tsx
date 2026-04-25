import Widget from "../ui/Widget";
import { useActivities } from "@/hooks/useActivities";
import { useDestinations } from "@/hooks/useDestinations";
import { useTripCountries } from "@/hooks/useTripCountries";
import { getFlagEmoji } from "@/lib/utils";
import { Button } from "../ui/Button";
import { AlertCircle, Compass, RefreshCcw, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActivitiesWidgetProps {
  tripId: number;
}

const ActivitiesWidget = ({ tripId }: ActivitiesWidgetProps) => {
  const {
    activities,
    isLoading: isLoadingActs,
    isError: isErrorActs,
    refetch: refetchActs,
  } = useActivities(tripId);
  const { destinations, isLoading: isLoadingDests } = useDestinations(tripId);
  const { tripCountries, isLoading: isLoadingCountries } = useTripCountries(tripId);

  const isLoading = isLoadingActs || isLoadingDests || isLoadingCountries;
  const isError = isErrorActs;

  // Group activities by destination
  const groupedActivities = activities.reduce(
    (acc, activity) => {
      const destId = activity.destinationId || 0;
      if (!acc[destId]) acc[destId] = [];
      acc[destId].push(activity);
      return acc;
    },
    {} as Record<number, typeof activities>,
  );

  return (
    <Widget
      title="Activities"
      icon={<Compass size={14} />}
      subtitle={
        activities.length > 0
          ? `${activities.length} Plan${activities.length === 1 ? "" : "s"}`
          : undefined
      }
    >
      <div className="mt-1">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-1"
            >
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3 animate-pulse opacity-70">
                  <div className="h-3 w-32 bg-border/40 rounded ml-1" />
                  <div className="space-y-2.5">
                    {[1, 2].map((j) => (
                      <div key={j} className="flex items-center justify-between">
                        <div className="h-3 w-40 bg-border/30 rounded" />
                        <div className="h-4 w-12 bg-border/20 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : isError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-2 flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-pastel-50 dark:bg-rose-pastel-900/30 flex items-center justify-center text-rose-pastel-500 mb-2 border border-rose-pastel-100 dark:border-rose-pastel-800">
                <AlertCircle size={20} />
              </div>
              <p className="text-[10px] font-bold text-text-primary mb-3 max-w-[140px]">
                Failed to load activities
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetchActs()}
                className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider"
              >
                <RefreshCcw size={10} className="mr-1.5" />
                Retry
              </Button>
            </motion.div>
          ) : activities.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4 flex flex-col items-center text-center text-text-muted"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center mb-2 border border-border/40">
                <Compass size={20} strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                No activities yet
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 pt-1"
            >
              {Object.entries(groupedActivities).map(([destId, acts], idx) => {
                const destination = destinations.find((d) => d.id === Number(destId));
                const destName = destination ? destination.name : "Unassigned";
                const tripCountry = destination
                  ? tripCountries.find((tc) => tc.id === destination.tripCountryId)
                  : null;

                return (
                  <motion.div
                    key={destId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 pb-1.5 border-b border-border/30">
                      {tripCountry && (
                        <span className="text-[12px]">{getFlagEmoji(tripCountry.countryCode)}</span>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/80">
                        {destName}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {acts.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between group/act"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {activity.isConfirmed ? (
                              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                            ) : (
                              <Circle size={12} className="text-text-muted/40 shrink-0" />
                            )}
                            <span className="text-xs text-text-secondary group-hover/act:text-lavender-600 transition-colors truncate">
                              {activity.name}
                            </span>
                          </div>
                          {activity.type && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-surface-3/50 rounded text-text-muted uppercase tracking-wider border border-border/20">
                              {activity.type}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Widget>
  );
};

export default ActivitiesWidget;
