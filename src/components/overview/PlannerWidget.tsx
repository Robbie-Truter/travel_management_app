import React, { useMemo } from "react";
import Widget from "../ui/Widget";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { Plane, Hotel, Compass, Calendar, AlertCircle, RefreshCcw } from "lucide-react";
import { parseISO, format, isValid } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";

interface PlannerWidgetProps {
  tripId: number;
}

type PlannerItem = {
  id: string;
  date: Date;
  type: "flight" | "stay" | "activity";
  title: string;
  sub: string;
  icon: React.ReactNode;
  image?: string | null;
};

export default function PlannerWidget({ tripId }: PlannerWidgetProps) {
  const {
    flights,
    isLoading: isLoadingFlights,
    isError: isErrorFlights,
    refetch: refetchFlights,
  } = useFlights(tripId);
  const {
    accommodations,
    isLoading: isLoadingAcc,
    isError: isErrorAcc,
    refetch: refetchAcc,
  } = useAccommodations(tripId);
  const {
    activities,
    isLoading: isLoadingAct,
    isError: isErrorAct,
    refetch: refetchActs,
  } = useActivities(tripId);

  const isLoading = isLoadingFlights || isLoadingAcc || isLoadingAct;
  const isError = isErrorFlights || isErrorAcc || isErrorAct;

  const refetchAll = () => {
    refetchFlights();
    refetchAcc();
    refetchActs();
  };

  const plannerItems = useMemo(() => {
    const items: PlannerItem[] = [];

    // Add Flights
    flights.forEach((flight) => {
      if (flight.segments && flight.segments.length > 0) {
        const firstSegment = flight.segments[0];
        const lastSegment = flight.segments[flight.segments.length - 1];

        const depDate = parseISO(firstSegment.departureTime);
        if (isValid(depDate)) {
          items.push({
            id: `flight-dep-${flight.id}`,
            date: depDate,
            type: "flight",
            title: `${firstSegment.departureAirport} ➔ ${lastSegment.arrivalAirport}`,
            sub: `${firstSegment.airline} ${firstSegment.flightNumber || ""} • ${format(depDate, "MMM d, h:mm a")}`,
            icon: <Plane size={12} className="text-sky-500" />,
          });
        }
      }
    });

    // Add Accommodations (Check-in & Check-out)
    accommodations.forEach((acc) => {
      const checkInDate = parseISO(acc.checkIn);
      const checkOutDate = parseISO(acc.checkOut);

      if (isValid(checkInDate)) {
        items.push({
          id: `acc-in-${acc.id}`,
          date: checkInDate,
          type: "stay",
          title: `Check-in: ${acc.name}`,
          sub: acc.location || "Accommodation",
          icon: <Hotel size={12} className="text-rose-500" />,
          image: acc.image,
        });
      }

      if (isValid(checkOutDate)) {
        items.push({
          id: `acc-out-${acc.id}`,
          date: checkOutDate,
          type: "stay",
          title: `Check-out: ${acc.name}`,
          sub: acc.location || "Accommodation",
          icon: <Hotel size={12} className="text-rose-500 opacity-60" />,
          image: acc.image,
        });
      }
    });

    // Add Activities
    activities.forEach((act) => {
      const actDate = parseISO(act.date);
      if (isValid(actDate)) {
        items.push({
          id: `act-${act.id}`,
          date: actDate,
          type: "activity",
          title: act.name,
          sub: `Scheduled • ${format(actDate, "MMM d, h:mm a")}`,
          icon: <Compass size={12} className="text-emerald-500" />,
          image: act.image,
        });
      }
    });

    // Sort chronologically
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [flights, accommodations, activities]);

  return (
    <Widget title="Mini Planner" icon={<Calendar size={14} />}>
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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 items-start animate-pulse opacity-70">
                  <div className="w-6 h-6 rounded-lg bg-border/30 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-2.5 w-3/4 bg-border/40 rounded" />
                    <div className="h-2 w-1/2 bg-border/30 rounded" />
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
              className="py-6 flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-pastel-50 flex items-center justify-center text-rose-pastel-500 mb-2 border border-rose-pastel-100">
                <AlertCircle size={20} />
              </div>
              <p className="text-[10px] font-bold text-text-primary mb-3">
                Failed to load itinerary
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={refetchAll}
                className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider"
              >
                <RefreshCcw size={10} className="mr-1.5" />
                Retry
              </Button>
            </motion.div>
          ) : plannerItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 flex flex-col items-center text-center text-text-muted"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center mb-2 border border-border/40">
                <Calendar size={20} strokeWidth={1.5} className="text-text-muted/50" />
              </div>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                Itinerary is empty
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 pt-1"
            >
              {plannerItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-3 items-start group/item relative"
                >
                  {/* Timeline connecting line */}
                  {idx < plannerItems.length - 1 && (
                    <div className="absolute left-[11px] top-[26px] bottom-[-14px] w-[2px] bg-border/30 group-hover/item:bg-border/60 transition-colors" />
                  )}

                  <div className="w-6 h-6 rounded-lg bg-surface-3 flex items-center justify-center shrink-0 border border-border/50 group-hover/item:border-lavender-200 transition-colors z-10 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      item.icon
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="text-[11px] font-bold text-text-primary leading-none mb-1 group-hover/item:text-lavender-600 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-text-muted truncate">{item.sub}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Widget>
  );
}
