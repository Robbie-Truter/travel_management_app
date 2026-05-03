import { useMemo } from "react";
import { useFlights } from "./useFlights";
import { useActivities } from "./useActivities";
import { useAccommodations } from "./useAccommodations";
import { startOfDay, endOfDay } from "date-fns";

export type OccupiedRange = {
  type: "flight" | "accommodation" | "activity";
  start: Date;
  end: Date;
};

export const useTripAvailability = (tripId: number) => {
  const { flights } = useFlights(tripId);
  const { accommodations } = useAccommodations(tripId);
  const { activities } = useActivities(tripId);

  const occupiedRanges = useMemo(() => {
    if (!tripId) return [];
    const ranges: OccupiedRange[] = [];

    flights.forEach((flight) => {
      flight?.segments.forEach((segment) => {
        ranges.push({
          type: "flight",
          start: new Date(segment.departureTime),
          end: new Date(segment.arrivalTime),
        });
      });
    });

    accommodations.forEach((accommodation) => {
      ranges.push({
        type: "accommodation",
        start: new Date(accommodation.checkIn),
        end: new Date(accommodation.checkOut),
      });
    });

    activities.forEach((activity) => {
      ranges.push({
        type: "activity",
        start: new Date(activity.date),
        end: new Date(activity.date),
      });
    });

    return ranges;
  }, [tripId, flights, accommodations, activities]);

  const isDateInOccupiedRange = (date: Date, type: "flight" | "accommodation" | "activity") => {
    const dStart = startOfDay(date);
    const dEnd = endOfDay(date);

    return occupiedRanges.some((range) => {
      if (range.type !== type) return false;
      return range.start <= dEnd && range.end >= dStart;
    });
  };

  return {
    isDateInOccupiedRange,
  };
};
