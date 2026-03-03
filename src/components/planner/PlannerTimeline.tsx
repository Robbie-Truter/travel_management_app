import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plane, Hotel, Compass, Clock, MapPin, ExternalLink } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Flight, Accommodation, Activity } from "@/db/types";
import { cn } from "@/lib/utils";

interface PlannerItem {
  id: string;
  type: "flight" | "accommodation" | "activity";
  time?: string;
  data: Flight | Accommodation | Activity;
  subType?: string;
}

interface PlannerTimelineProps {
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
  tripStartDate: string;
  tripEndDate: string;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function PlannerTimeline({
  flights,
  accommodations,
  activities,
  tripStartDate,
  tripEndDate,
}: PlannerTimelineProps) {
  const dates = useMemo(
    () => getDatesInRange(tripStartDate, tripEndDate),
    [tripStartDate, tripEndDate],
  );

  const itemsByDate = useMemo(() => {
    const map: Record<string, PlannerItem[]> = {};
    dates.forEach((date) => (map[date] = []));

    // Process Flights
    flights.forEach((f) => {
      f.segments.forEach((seg, idx) => {
        const depDate = seg.departureTime.split("T")[0];
        const arrDate = seg.arrivalTime.split("T")[0];

        if (map[depDate]) {
          map[depDate].push({
            id: `flight-${f.id}-dep-${idx}`,
            type: "flight",
            subType: "departure",
            time: seg.departureTime.split("T")[1],
            data: f,
          });
        }

        if (arrDate !== depDate && map[arrDate]) {
          map[arrDate].push({
            id: `flight-${f.id}-arr-${idx}`,
            type: "flight",
            subType: "arrival",
            time: seg.arrivalTime.split("T")[1],
            data: f,
          });
        }
      });
    });

    // Process Accommodations
    accommodations.forEach((a) => {
      dates.forEach((date) => {
        if (date === a.checkIn) {
          map[date].push({
            id: `acc-${a.id}-in`,
            type: "accommodation",
            subType: "check-in",
            time: "15:00:00", // Default check-in time
            data: a,
          });
        } else if (date === a.checkOut) {
          map[date].push({
            id: `acc-${a.id}-out`,
            type: "accommodation",
            subType: "check-out",
            time: "11:00:00", // Default check-out time
            data: a,
          });
        } else if (date > a.checkIn && date < a.checkOut) {
          map[date].push({
            id: `acc-${a.id}-stay`,
            type: "accommodation",
            subType: "stay",
            data: a,
          });
        }
      });
    });

    // Process Activities
    activities.forEach((a) => {
      const date = a.date.split("T")[0];
      if (map[date]) {
        map[date].push({
          id: `activity-${a.id}`,
          type: "activity",
          time: a.date.includes("T") ? a.date.split("T")[1] : undefined,
          data: a,
        });
      }
    });

    // Sort items for each day
    Object.keys(map).forEach((date) => {
      map[date].sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
    });

    return map;
  }, [flights, accommodations, activities, dates]);

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 pt-2 scroll-smooth">
      {dates.map((date) => (
        <DayColumn key={date} date={date} items={itemsByDate[date]} />
      ))}
    </div>
  );
}

function DayColumn({ date, items }: { date: string; items: PlannerItem[] }) {
  return (
    <div className="shrink-0 w-80 group">
      <div className="mb-4 sticky top-0 bg-surface/80 backdrop-blur-sm z-10 py-2 flex items-baseline gap-2">
        <h3 className="text-xl font-bold text-text-primary">{formatDate(date, "d")}</h3>
        <span className="text-sm font-medium text-text-secondary">
          {formatDate(date, "EEEE, MMM")}
        </span>
      </div>

      <div className="relative space-y-4 min-h-[400px]">
        {/* Timeline line */}
        <div className="absolute left-5.5 top-2 bottom-0 w-0.5 bg-border group-hover:bg-lavender-200 transition-colors" />

        {items.length === 0 ? (
          <div className="pl-12 py-8">
            <p className="text-sm text-text-muted italic">No plans for today</p>
          </div>
        ) : (
          items.map((item) => <PlannerCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

function PlannerCard({ item }: { item: PlannerItem }) {
  const getStyles = () => {
    switch (item.type) {
      case "flight":
        return {
          icon: Plane,
          color: "text-sky-pastel-600",
          bg: "bg-sky-pastel-50 dark:bg-sky-pastel-900/10",
          border: "border-sky-pastel-100 dark:border-sky-pastel-900/20",
          label: item.subType === "departure" ? "Departure" : "Arrival",
        };
      case "accommodation":
        return {
          icon: Hotel,
          color: "text-rose-pastel-600",
          bg: "bg-rose-pastel-50 dark:bg-rose-pastel-900/10",
          border: "border-rose-pastel-100 dark:border-rose-pastel-900/20",
          label:
            item.subType === "check-in"
              ? "Check-in"
              : item.subType === "check-out"
                ? "Check-out"
                : "Stay",
        };
      case "activity":
      default:
        return {
          icon: Compass,
          color: "text-lavender-600",
          bg: "bg-lavender-50 dark:bg-lavender-900/10",
          border: "border-lavender-100 dark:border-lavender-900/20",
          label: (item.data as Activity).type || "Activity",
        };
    }
  };

  const { icon: Icon, color, bg, border, label } = getStyles();

  const getTitle = () => {
    if (item.type === "flight") {
      const f = item.data as Flight;
      return `${f.segments[0].airline} ${f.segments[0].flightNumber}`;
    }
    return (item.data as Accommodation | Activity).name;
  };

  const getPriceData = () => {
    if (item.type === "flight") {
      const f = item.data as Flight;
      return { price: f.price, currency: f.currency, isConfirmed: f.isConfirmed };
    }
    if (item.type === "accommodation") {
      const a = item.data as Accommodation;
      return { price: a.price, currency: a.currency, isConfirmed: a.isConfirmed };
    }
    const act = item.data as Activity;
    return { price: act.cost || 0, currency: act.currency, isConfirmed: act.isConfirmed };
  };

  const { price, currency, isConfirmed } = getPriceData();

  const getBookingLink = () => {
    if (item.type === "flight") return (item.data as Flight).bookingLink;
    if (item.type === "accommodation") return (item.data as Accommodation).bookingLink;
    return (item.data as Activity).link;
  };

  const bookingLink = getBookingLink();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative pl-12"
    >
      {/* Timeline dot */}
      <div
        className={cn(
          "absolute left-5.5 top-4 w-3 h-3 -translate-x-1.5 rounded-full border-2 border-surface bg-white shadow-sm z-10 transition-transform group-hover:scale-125",
          item.type === "flight"
            ? "bg-sky-pastel-500"
            : item.type === "accommodation"
              ? "bg-rose-pastel-500"
              : "bg-lavender-500",
        )}
      />

      <div
        className={cn(
          "rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-300 bg-surface",
          border,
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div
            className={cn(
              "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
              bg,
              color,
            )}
          >
            <Icon size={10} />
            {label}
          </div>
          {item.time && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-text-secondary">
              <Clock size={12} />
              {item.time.substring(0, 5)}
            </div>
          )}
        </div>

        <h4 className="text-sm font-bold text-text-primary leading-tight mb-1">{getTitle()}</h4>

        {item.type === "flight" && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">
                {(item.data as Flight).segments[0].departureAirport} →{" "}
                {(item.data as Flight).segments[0].arrivalAirport}
              </span>
            </div>
          </div>
        )}

        {item.type === "accommodation" && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{(item.data as Accommodation).location}</span>
          </div>
        )}

        {item.type === "activity" && (item.data as Activity).notes && (
          <p className="text-[11px] text-text-muted mt-2 line-clamp-2">
            {(item.data as Activity).notes}
          </p>
        )}

        {price > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-primary">
              {formatCurrency(price, currency)}
            </span>
            {!isConfirmed && (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase">
                Unconfirmed
              </span>
            )}
          </div>
        )}

        {bookingLink && (
          <a
            href={bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-surface-2 text-[10px] font-bold text-text-secondary hover:text-lavender-600 hover:bg-lavender-50 transition-colors border border-border"
          >
            <ExternalLink size={12} />
            View Booking
          </a>
        )}
      </div>
    </motion.div>
  );
}
