import { useMemo, useEffect, useState } from "react";
import Widget from "../ui/Widget";
import { useTrip } from "@/hooks/useTrips";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { Clock, AlertCircle, RefreshCcw, Plane, Hotel, Compass, CalendarCheck } from "lucide-react";
import { Button } from "../ui/Button";
import { parseISO, isFuture, isPast, differenceInDays, isValid, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownWidgetProps {
  tripId: number;
}

export default function CountdownWidget({ tripId }: CountdownWidgetProps) {
  const {
    trip,
    isLoading: isLoadingTrip,
    isError: isErrorTrip,
    refetch: refetchTrip,
  } = useTrip(tripId);
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

  // Force re-render every minute to keep countdowns accurate
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const isLoading = isLoadingTrip || isLoadingFlights || isLoadingAcc || isLoadingAct;
  const isError = isErrorTrip || isErrorFlights || isErrorAcc || isErrorAct;

  const refetchAll = () => {
    refetchTrip();
    refetchFlights();
    refetchAcc();
    refetchActs();
  };

  const nextEvent = useMemo(() => {
    const items: Array<{
      id: string;
      date: Date;
      title: string;
      sub: string;
      icon: React.ReactNode;
      type: string;
    }> = [];

    flights.forEach((flight) => {
      if (flight.segments && flight.segments.length > 0) {
        const firstSegment = flight.segments[0];
        const lastSegment = flight.segments[flight.segments.length - 1];
        const depDate = parseISO(firstSegment.departureTime);
        if (isValid(depDate) && isFuture(depDate)) {
          items.push({
            id: `flight-${flight.id}`,
            date: depDate,
            type: "flight",
            title: `Flight to ${lastSegment.arrivalAirport}`,
            sub: `Departs at ${format(depDate, "h:mm a")}`,
            icon: <Plane size={14} className="text-sky-500" />,
          });
        }
      }
    });

    accommodations.forEach((acc) => {
      const checkInDate = parseISO(acc.checkIn);
      const checkOutDate = parseISO(acc.checkOut);

      if (isValid(checkInDate) && isFuture(checkInDate)) {
        items.push({
          id: `acc-in-${acc.id}`,
          date: checkInDate,
          type: "stay",
          title: `Check-in: ${acc.name}`,
          sub: acc.location || "Accommodation",
          icon: <Hotel size={14} className="text-rose-500" />,
        });
      }
      if (isValid(checkOutDate) && isFuture(checkOutDate)) {
        items.push({
          id: `acc-out-${acc.id}`,
          date: checkOutDate,
          type: "stay",
          title: `Check-out: ${acc.name}`,
          sub: acc.location || "Accommodation",
          icon: <Hotel size={14} className="text-rose-500 opacity-60" />,
        });
      }
    });

    activities.forEach((act) => {
      const actDate = parseISO(act.date);
      if (isValid(actDate) && isFuture(actDate)) {
        items.push({
          id: `act-${act.id}`,
          date: actDate,
          type: "activity",
          title: act.name,
          sub: format(actDate, "MMM d, h:mm a"),
          icon: <Compass size={14} className="text-emerald-500" />,
        });
      }
    });

    items.sort((a, b) => a.date.getTime() - b.date.getTime());
    return items.length > 0 ? items[0] : null;
  }, [flights, accommodations, activities]);

  // Trip Status Logic
  const getTripStatus = () => {
    if (!trip) return { label: "Loading...", days: 0, state: "loading" };

    const start = parseISO(trip.startDate);
    const end = parseISO(trip.endDate);

    if (isValid(start) && isFuture(start)) {
      return {
        label: "Days until trip",
        days: differenceInDays(start, new Date()),
        state: "upcoming",
      };
    } else if (isValid(end) && isPast(end)) {
      return {
        label: "Trip completed",
        days: differenceInDays(new Date(), end),
        state: "past",
      };
    } else {
      return {
        label: "Trip in progress",
        days: differenceInDays(new Date(), start) + 1,
        state: "active",
      };
    }
  };

  const status = getTripStatus();

  return (
    <Widget title="At A Glance" icon={<Clock size={14} />}>
      <div className="flex flex-col h-full pt-1 relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 animate-pulse space-y-4"
            >
              <div className="h-16 w-full bg-border/20 rounded-xl" />
              <div className="h-12 w-full bg-border/20 rounded-xl" />
            </motion.div>
          ) : isError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-6 flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-pastel-50 flex items-center justify-center text-rose-pastel-500 mb-2 border border-rose-pastel-100">
                <AlertCircle size={20} />
              </div>
              <p className="text-[10px] font-bold text-text-primary mb-3">
                Failed to load trip data
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
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col gap-3 relative"
            >
              {/* Background Cover Image */}
              {trip?.coverImage && (
                <div className="absolute -inset-4 opacity-10 z-0 pointer-events-none overflow-hidden rounded-xl">
                  <img
                    src={trip.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover blur-sm"
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-transparent to-surface" />
                </div>
              )}

              {/* Countdown Block */}
              <div className="relative z-10 flex flex-col items-center justify-center bg-surface-3/60 backdrop-blur-md rounded-2xl p-4 border border-border/40 shadow-sm flex-1">
                {status.state === "upcoming" ? (
                  <>
                    <span className="text-4xl font-black text-lavender-600 tracking-tighter leading-none mb-1">
                      {status.days}
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      Days Until Departure
                    </span>
                  </>
                ) : status.state === "active" ? (
                  <>
                    <span className="text-2xl font-black text-emerald-500 tracking-tighter leading-none mb-1 flex items-center gap-2">
                      <CalendarCheck size={20} />
                      Day {status.days}
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      Trip in Progress
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xl font-black text-text-secondary tracking-tighter leading-none mb-1">
                      Completed
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      {status.days} days ago
                    </span>
                  </>
                )}
              </div>

              {/* Next Up Block */}
              <div className="relative z-10 bg-surface-3/30 rounded-xl p-3 border border-border/30">
                <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-2">
                  Next Up
                </div>
                {nextEvent ? (
                  <div className="flex gap-3 items-center group/next">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-border/50 shadow-sm transition-transform group-hover/next:scale-105">
                      {nextEvent.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-text-primary leading-tight truncate">
                        {nextEvent.title}
                      </div>
                      <div className="text-[10px] text-lavender-600 font-medium truncate">
                        {nextEvent.sub}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 opacity-60">
                    <CalendarCheck size={14} className="text-text-muted" />
                    <span className="text-[11px] text-text-muted font-medium">
                      No upcoming events planned
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Widget>
  );
}
