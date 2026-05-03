import { useMemo } from "react";
import type { Flight, Accommodation, Activity } from "@/db/types";
import { DayColumn } from "./DayColumn";
import type { PlannerItem } from "./PlannerCard";

interface PlannerTabProps {
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
  tripStartDate: string;
  tripEndDate: string;
}

function toLocalDateString(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalTimeString(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);

  // Normalize dates to midnight local to avoid hour-based shifts
  current.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    dates.push(toLocalDateString(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function PlannerTab({
  flights,
  accommodations,
  activities,
  tripStartDate,
  tripEndDate,
}: PlannerTabProps) {
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
        const depDate = toLocalDateString(seg.departureTime);
        const arrDate = toLocalDateString(seg.arrivalTime);

        // Add departure
        if (map[depDate]) {
          map[depDate].push({
            id: `flight-${f.id}-dep-${idx}`,
            type: "flight",
            subType: "departure",
            time: toLocalTimeString(seg.departureTime),
            data: f,
          });
        }

        // Add arrival
        if (map[arrDate]) {
          map[arrDate].push({
            id: `flight-${f.id}-arr-${idx}`,
            type: "flight",
            subType: "arrival",
            time: toLocalTimeString(seg.arrivalTime),
            data: f,
          });
        }

        // Add "In Transit" for days strictly between dep and arr
        dates.forEach((date) => {
          if (date > depDate && date < arrDate) {
            map[date].push({
              id: `flight-${f.id}-transit-${idx}-${date}`,
              type: "flight",
              subType: "in-transit",
              data: f,
            });
          }
        });
      });
    });

    // Process Accommodations
    accommodations.forEach((a) => {
      const checkInDate = toLocalDateString(a.checkIn);
      const checkOutDate = toLocalDateString(a.checkOut);
      const checkInTime = a.checkIn.includes("T") ? toLocalTimeString(a.checkIn) : "15:00:00";
      const checkOutTime = a.checkOut.includes("T") ? toLocalTimeString(a.checkOut) : "11:00:00";

      dates.forEach((date) => {
        if (date === checkInDate) {
          map[date].push({
            id: `acc-${a.id}-in`,
            type: "accommodation",
            subType: "check-in",
            time: checkInTime,
            data: a,
          });
        } else if (date === checkOutDate) {
          map[date].push({
            id: `acc-${a.id}-out`,
            type: "accommodation",
            subType: "check-out",
            time: checkOutTime,
            data: a,
          });
        } else if (date > checkInDate && date < checkOutDate) {
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
      const date = toLocalDateString(a.date);
      if (map[date]) {
        map[date].push({
          id: `activity-${a.id}`,
          type: "activity",
          time: a.date.includes("T") ? toLocalTimeString(a.date) : undefined,
          data: a,
        });
      }
    });

    // Sort items for each day
    Object.keys(map).forEach((date) => {
      map[date].sort((a, b) => {
        // Items without time (stays, transit days) go below timed items
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
