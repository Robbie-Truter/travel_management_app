import { supabase } from "@/lib/supabase";
import { format, parseISO, isWithinInterval } from "date-fns";

export type ConflictItem = {
  type: "flight" | "accommodation" | "activity";
  name: string;
  date: string;
};

/**
 * Checks whether any flights, accommodations, or activities for a trip
 * fall outside a proposed new date range.
 * Returns a list of items that would be out of range.
 */
export async function getOutOfRangeItems(
  tripId: number,
  newStartDate: string,
  newEndDate: string,
): Promise<ConflictItem[]> {
  const start = parseISO(newStartDate);
  const end = parseISO(newEndDate);
  const conflicts: ConflictItem[] = [];

  const inRange = (date: Date) => isWithinInterval(date, { start, end });

  // --- Flights ---
  const { data: flights } = await supabase
    .from("flights")
    .select("id, segments, description")
    .eq("trip_id", tripId);

  for (const flight of flights ?? []) {
    const segments: { departureTime: string; arrivalTime: string }[] = flight.segments ?? [];
    for (const seg of segments) {
      const dep = parseISO(seg.departureTime);
      const arr = parseISO(seg.arrivalTime);
      if (!inRange(dep) || !inRange(arr)) {
        const label = flight.description || `Flight on ${format(dep, "MMM d")}`;
        if (!conflicts.find((c) => c.type === "flight" && c.name === label)) {
          conflicts.push({
            type: "flight",
            name: label,
            date: format(dep, "MMM d, yyyy"),
          });
        }
        break; // Only report each flight once
      }
    }
  }

  // --- Accommodations ---
  const { data: accommodations } = await supabase
    .from("accommodations")
    .select("id, name, check_in, check_out")
    .eq("trip_id", tripId);

  for (const acc of accommodations ?? []) {
    const checkIn = parseISO(acc.check_in);
    const checkOut = parseISO(acc.check_out);
    if (!inRange(checkIn) || !inRange(checkOut)) {
      conflicts.push({
        type: "accommodation",
        name: acc.name,
        date: `${format(checkIn, "MMM d")} – ${format(checkOut, "MMM d, yyyy")}`,
      });
    }
  }

  // --- Activities ---
  const { data: activities } = await supabase
    .from("activities")
    .select("id, name, date")
    .eq("trip_id", tripId);

  for (const act of activities ?? []) {
    const actDate = parseISO(act.date);
    if (!inRange(actDate)) {
      conflicts.push({
        type: "activity",
        name: act.name,
        date: format(actDate, "MMM d, yyyy"),
      });
    }
  }

  return conflicts;
}
