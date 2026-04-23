import Widget from "../ui/Widget";
import { useFlights } from "@/hooks/useFlights";
import { Button } from "../ui/Button";
import { AlertCircle, Plane, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, parseISO, format } from "date-fns";

interface FlightsWidgetProps {
  tripId: number;
}

const FlightsWidget = ({ tripId }: FlightsWidgetProps) => {
  const { flights, isLoading, isError, refetch } = useFlights(tripId);

  // Get all flights, sorted by departure time of their first segment
  const sortedFlights = flights.sort(
    (a, b) =>
      parseISO(a.segments[0].departureTime).getTime() -
      parseISO(b.segments[0].departureTime).getTime(),
  );

  return (
    <Widget
      title="Flights"
      icon={<Plane size={14} />}
      subtitle={
        sortedFlights.length > 0
          ? `${sortedFlights.length} Flight${sortedFlights.length === 1 ? "" : "s"}`
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
              className="py-1 space-y-3 animate-pulse opacity-70"
            >
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-3 bg-surface-3/50 rounded-xl border border-border/40 space-y-4"
                >
                  <div className="flex justify-between">
                    <div className="h-2.5 w-16 bg-border/40 rounded" />
                    <div className="h-2.5 w-12 bg-border/40 rounded" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="h-4 w-8 bg-border/40 rounded" />
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-px bg-border/20" />
                    </div>
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="h-4 w-8 bg-border/40 rounded" />
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
              <p className="text-[10px] font-bold text-text-primary mb-3">Failed to load flights</p>
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
          ) : sortedFlights.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4 flex flex-col items-center text-center text-text-muted"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center mb-2 border border-border/40">
                <Plane size={20} strokeWidth={1.5} className="text-text-muted/50" />
              </div>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                No flights found
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 pt-1"
            >
              {sortedFlights.map((flight, idx) => {
                const firstSegment = flight.segments[0];
                const lastSegment = flight.segments[flight.segments.length - 1];

                return (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 bg-surface-3/50 hover:bg-surface-3 transition-all duration-300 rounded-xl border border-border/40 group/flight cursor-default"
                  >
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="flex items-center gap-2">
                        {firstSegment.flightNumber && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-surface-2 text-text-secondary rounded font-bold border border-border/40">
                            {firstSegment.flightNumber}
                          </span>
                        )}
                      </div>
                      <span className="text-[8px] text-text-muted font-bold italic opacity-70">
                        {formatDistanceToNow(parseISO(firstSegment.departureTime), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="text-center min-w-[45px]">
                        <div className="text-base font-black text-text-primary tracking-tight group-hover/flight:text-sky-600 transition-colors">
                          {firstSegment.departureAirport}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-[8px] font-black text-sky-500/80 uppercase tracking-widest">
                          {format(parseISO(firstSegment.departureTime), "HH:mm")}
                        </div>
                        <div className="relative w-full flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full h-px bg-linear-to-r from-transparent via-border to-transparent group-hover/flight:via-sky-200 dark:group-hover/flight:via-sky-900 transition-colors" />
                          </div>
                          <div className="relative bg-surface-3 group-hover/flight:bg-surface-2 px-2 transition-all duration-500 group-hover/flight:translate-x-1">
                            <Plane
                              size={12}
                              className="text-sky-400/70 group-hover/flight:text-sky-500 rotate-90"
                            />
                          </div>
                        </div>
                        {flight.segments.length > 1 && (
                          <div className="text-[8px] font-mono text-text-muted/60 tracking-widest uppercase">
                            {flight.segments.length - 1} Stop{flight.segments.length > 2 ? "s" : ""}
                          </div>
                        )}
                      </div>

                      <div className="text-center min-w-[45px]">
                        <div className="text-base font-black text-text-primary tracking-tight group-hover/flight:text-sky-600 transition-colors">
                          {lastSegment.arrivalAirport}
                        </div>
                      </div>
                    </div>

                    {firstSegment.airline && (
                      <div className="mt-3 pt-2.5 border-t border-border/20 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest">
                          {firstSegment.airline}
                        </span>
                      </div>
                    )}
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

export default FlightsWidget;
