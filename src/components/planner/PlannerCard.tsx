import { motion } from "framer-motion";
import { Plane, Hotel, Compass, Clock, MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Flight, Accommodation, Activity } from "@/db/types";

export interface PlannerItem {
  id: string;
  type: "flight" | "accommodation" | "activity";
  time?: string;
  data: Flight | Accommodation | Activity;
  subType?: string;
}

interface PlannerCardProps {
  item: PlannerItem;
}

export function PlannerCard({ item }: PlannerCardProps) {
  const getStyles = () => {
    switch (item.type) {
      case "flight":
        return {
          icon: Plane,
          color: "text-sky-pastel-600",
          bg: "bg-sky-pastel-50 dark:bg-sky-pastel-900/10",
          border: "border-sky-pastel-100 dark:border-sky-pastel-900/20",
          label:
            item.subType === "departure"
              ? "Departure"
              : item.subType === "arrival"
                ? "Arrival"
                : "In Transit",
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

  const getTime = (date: Date) => {
    return (
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0") +
      ":" +
      String(date.getSeconds()).padStart(2, "0")
    );
  };

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

  const { isConfirmed } = getPriceData();

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
          "rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-300 bg-surface",
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
                {(item.data as Flight).segments.map((seg) => {
                  const depDate = new Date(seg.departureTime);
                  const arrDate = new Date(seg.arrivalTime);

                  const depTime = getTime(depDate);
                  const arrTime = getTime(arrDate);

                  if (item.subType === "in-transit") {
                    return `${seg.departureAirport} - ${seg.arrivalAirport}`;
                  }

                  if (depTime === item.time || arrTime === item.time) {
                    return `${seg.departureAirport} - ${seg.arrivalAirport}`;
                  }

                  return null;
                })}
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

        {!isConfirmed && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase inline-block">
              Unconfirmed
            </span>
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
