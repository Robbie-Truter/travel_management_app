import Widget from "../ui/Widget";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useDestinations } from "@/hooks/useDestinations";
import { useTripCountries } from "@/hooks/useTripCountries";
import { getFlagEmoji } from "@/lib/utils";
import { Button } from "../ui/Button";
import { AlertCircle, Hotel, MapPin, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInDays, parseISO } from "date-fns";
import { useMemo } from "react";
import type { Accommodation } from "@/db/types";

interface StaysWidgetProps {
  tripId: number;
}

const StaysWidget = ({ tripId }: StaysWidgetProps) => {
  const {
    accommodations,
    isLoading: isLoadingAcc,
    isError: isErrorAcc,
    refetch: refetchAcc,
  } = useAccommodations(tripId);
  const { destinations, isLoading: isLoadingDests } = useDestinations(tripId);
  const { tripCountries, isLoading: isLoadingCountries } = useTripCountries(tripId);

  const isLoading = isLoadingAcc || isLoadingDests || isLoadingCountries;
  const isError = isErrorAcc;

  const groupedAccommodations = useMemo(() => {
    const acc: Record<number, Accommodation[]> = {};
    accommodations.forEach((accommodation) => {
      const destId = accommodation.destinationId;
      if (!acc[destId]) {
        acc[destId] = [];
      }
      acc[destId].push(accommodation);
    });
    return acc;
  }, [accommodations]);

  return (
    <Widget
      title="Stays"
      icon={<Hotel size={14} />}
      subtitle={
        accommodations.length > 0
          ? `${accommodations.length} Stay${accommodations.length === 1 ? "" : "s"}`
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
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-border/30 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-border/40 rounded" />
                      <div className="h-3 w-1/2 bg-border/30 rounded" />
                      <div className="flex gap-2">
                        <div className="h-4 w-16 bg-border/40 rounded" />
                        <div className="h-4 w-16 bg-border/30 rounded" />
                      </div>
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
              <p className="text-[10px] font-bold text-text-primary mb-3">Failed to load stays</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetchAcc()}
                className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider"
              >
                <RefreshCcw size={10} className="mr-1.5" />
                Retry
              </Button>
            </motion.div>
          ) : accommodations.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4 flex flex-col items-center text-center text-text-muted"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center mb-2 border border-border/40">
                <Hotel size={20} strokeWidth={1.5} className="text-text-muted/50" />
              </div>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                No stays planned
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 pt-1"
            >
              {Object.entries(groupedAccommodations).map(([destId, stays], idx) => {
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
                    <div className="space-y-4">
                      {stays.map((stay) => {
                        const nights = differenceInDays(
                          parseISO(stay.checkOut),
                          parseISO(stay.checkIn),
                        );

                        return (
                          <div key={stay.id} className="flex gap-4 items-center group/stay">
                            <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center shrink-0 border border-border/50 group-hover/stay:border-lavender-200 transition-colors overflow-hidden">
                              {stay.image ? (
                                <img
                                  src={stay.image}
                                  alt={stay.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Hotel
                                  size={20}
                                  className="text-text-muted/50 group-hover/stay:text-lavender-400 transition-colors"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-text-primary truncate group-hover/stay:text-lavender-600 transition-colors">
                                {stay.name}
                              </h4>
                              <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5 truncate">
                                <MapPin size={10} className="shrink-0" /> {stay.location}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {stay.isConfirmed ? (
                                  <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded uppercase tracking-wider border border-emerald-100 dark:border-emerald-800">
                                    Confirmed
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-bold rounded uppercase tracking-wider border border-amber-100 dark:border-amber-800">
                                    Pending
                                  </span>
                                )}
                                {nights > 0 && (
                                  <span className="px-1.5 py-0.5 bg-surface-3 text-text-secondary text-[9px] font-bold rounded uppercase tracking-wider border border-border/50">
                                    {nights} Night{nights !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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

export default StaysWidget;
