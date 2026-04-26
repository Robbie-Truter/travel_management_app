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
      const checkInDate = a.checkIn.split("T")[0];
      const checkOutDate = a.checkOut.split("T")[0];
      const checkInTime = a.checkIn.includes("T")
        ? a.checkIn.split("T")[1].substring(0, 8)
        : "15:00:00";
      const checkOutTime = a.checkOut.includes("T")
        ? a.checkOut.split("T")[1].substring(0, 8)
        : "11:00:00";

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
