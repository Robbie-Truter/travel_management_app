import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getFlagEmoji } from "@/lib/utils";
import type { TripCountry } from "@/db/types";

interface Props {
  tripCountries?: TripCountry[];
}

export function OverviewCountriesCard({ tripCountries }: Props) {
  return (
    <Card className="flex flex-col p-0 h-110 overflow-hidden group hover:shadow-card-hover transition-shadow text-center sm:text-left">
      <div className="bg-lavender-50 dark:bg-lavender-900/10 p-5 border-b border-lavender-100 dark:border-lavender-900/20 text-left shrink-0">
        <h3 className="font-bold text-lg flex items-center gap-2 text-lavender-700 dark:text-lavender-400">
          <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
            <MapPin size={18} className="text-lavender-500" />
          </div>
          Countries
        </h3>
      </div>
      <div className="p-5 flex flex-col h-full overflow-y-auto">
        <div className="grow">
          <p className="text-3xl font-bold text-text-primary">{tripCountries?.length ?? 0}</p>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Countries Visited
          </p>

          {(tripCountries?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tripCountries?.map((tc) => (
                <span
                  key={tc.id}
                  className="px-2 py-1 bg-surface-3 rounded-md text-[11px] font-medium text-text-primary border border-border flex items-center gap-1.5"
                >
                  <span className="text-[14px]">{getFlagEmoji(tc.countryCode)}</span>
                  {tc.countryName}
                </span>
              ))}
            </div>
          )}
        </div>

        {(tripCountries?.length ?? 0) === 0 && (
          <p className="text-xs text-text-muted italic mt-2">No countries added yet.</p>
        )}
      </div>
    </Card>
  );
}
