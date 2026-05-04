import { getFlagEmoji } from "@/lib/utils";
import Widget from "../ui/Widget";
import { useDestinations } from "@/hooks/useDestinations";
import type { TripCountry } from "@/db/types";
import { Button } from "../ui/Button";
import { AlertCircle, MapPin, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DestinationWidgetProps {
  tripId: number;
  tripCountries: TripCountry[];
}

const DestinationsWidget = ({ tripId, tripCountries }: DestinationWidgetProps) => {
  const { destinations, isLoading, isError, refetch } = useDestinations(tripId);

  return (
    <Widget
      title="Destinations"
      icon={<MapPin size={14} />}
      subtitle={
        tripCountries.length > 0
          ? `${tripCountries.length} Countr${tripCountries.length === 1 ? "y" : "ies"}`
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
              className="space-y-4 py-1"
            >
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse opacity-70">
                  <div className="w-10 h-10 rounded-xl bg-border/40" />
                  <div className="flex-1 space-y-2.5 mt-1">
                    <div className="h-2.5 w-24 bg-border/40 rounded" />
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-border/30 rounded-md" />
                      <div className="h-5 w-12 bg-border/30 rounded-md" />
                    </div>
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
                Failed to load destinations
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetch()}
                className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider"
              >
                <RefreshCcw size={10} className="mr-1.5" />
                Retry
              </Button>
            </motion.div>
          ) : destinations.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4 flex flex-col items-center text-center text-text-muted"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center mb-2 border border-border/40">
                <MapPin size={20} strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                No destinations
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 pt-1"
            >
              {tripCountries.map((tc, idx) => {
                const countryDests = destinations.filter((d) => d.tripCountryId === tc.id);
                if (countryDests.length === 0) return null;

                return (
                  <motion.div
                    key={tc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-4 group"
                  >
                    <div className="text-2xl shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-surface-2 border border-border/40 group-hover:border-lavender-200 dark:group-hover:border-lavender-900 transition-all duration-300">
                      {getFlagEmoji(tc.countryCode)}
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <h5 className="text-[11px] font-black text-text-primary leading-tight mb-2 tracking-wide uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                        {tc.countryName}
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {countryDests.map((d) => (
                          <span
                            key={d.id}
                            className="text-[10px] font-bold px-1.5 py-1 bg-surface-2 hover:bg-lavender-50 dark:hover:bg-lavender-900/30 rounded-lg border border-border/40 hover:border-lavender-200 dark:hover:border-lavender-800 text-text-secondary hover:text-lavender-600 dark:hover:text-lavender-400 transition-all duration-200 cursor-default flex items-center gap-1.5"
                          >
                            {d.image && (
                              <img
                                src={d.image}
                                alt=""
                                className="w-4 h-4 rounded-md object-cover border border-border/20 shrink-0"
                              />
                            )}
                            {d.name}
                          </span>
                        ))}
                      </div>
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

export default DestinationsWidget;
