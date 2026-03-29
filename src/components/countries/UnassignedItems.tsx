import { Plus, Plane, Hotel, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import type { Flight, Accommodation, Activity } from "@/db/types";

interface UnassignedItemsProps {
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
}

export function UnassignedItems({ flights, accommodations, activities }: UnassignedItemsProps) {
  const unassignedFlights = flights.filter((f) => !f.tripCountryId);
  const unassignedStays = accommodations.filter((a) => !a.tripCountryId);
  const unassignedActivities = activities.filter((a) => !a.tripCountryId);

  const hasUnassigned =
    unassignedFlights.length > 0 || unassignedStays.length > 0 || unassignedActivities.length > 0;

  if (!hasUnassigned) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center border border-border">
          <Plus size={14} className="text-text-muted" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Unassigned Items
          </h3>
          <p className="text-[10px] text-text-muted italic">
            These items haven't been connected to a destination country yet.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unassignedFlights.length > 0 && (
          <Card className="bg-surface-2 border-dashed">
            <CardContent className="p-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-sky-pastel-600 mb-3 flex items-center gap-1.5">
                <Plane size={12} />
                Unassigned Flights ({unassignedFlights.length})
              </h5>
              <ul className="space-y-2">
                {unassignedFlights.map((f) => (
                  <li
                    key={f.id}
                    className="text-xs text-text-secondary py-1 border-b border-border/30 last:border-0 truncate font-medium"
                  >
                    {f.description || `${f.segments[0].airline} ${f.segments[0].flightNumber}`}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {unassignedStays.length > 0 && (
          <Card className="bg-surface-2 border-dashed">
            <CardContent className="p-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-lavender-600 mb-3 flex items-center gap-1.5">
                <Hotel size={12} />
                Unassigned Stays ({unassignedStays.length})
              </h5>
              <ul className="space-y-2">
                {unassignedStays.map((s) => (
                  <li
                    key={s.id}
                    className="text-xs text-text-secondary py-1 border-b border-border/30 last:border-0 truncate font-medium"
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {unassignedActivities.length > 0 && (
          <Card className="bg-surface-2 border-dashed">
            <CardContent className="p-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-teal-pastel-600 mb-3 flex items-center gap-1.5">
                <Compass size={12} />
                Unassigned Activities ({unassignedActivities.length})
              </h5>
              <ul className="space-y-2">
                {unassignedActivities.map((a) => (
                  <li
                    key={a.id}
                    className="text-xs text-text-secondary py-1 border-b border-border/30 last:border-0 truncate font-medium"
                  >
                    {a.name}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
