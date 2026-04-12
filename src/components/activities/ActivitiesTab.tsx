import { useState } from "react";
import { Plus, Compass, Filter, MapPin, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useActivities } from "@/hooks/useActivities";
import { ActivityCard } from "./ActivityCard";
import { ActivityForm } from "./ActivityForm";
import { ACTIVITY_TAGS } from "./activity-types";
import { ActivitySkeleton, ActivityRefetchingIndicator } from "./ActivityLoadingStates";
import { ActivityErrorState } from "./ActivityErrorState";
import { getFlagEmoji } from "@/lib/utils";
import type { Activity, TripCountry, Destination, Currency } from "@/db/types";

interface ActivitiesTabProps {
  tripId: number;
  tripCountries: TripCountry[];
  destinations: Destination[];
  tripStartDate: string;
  tripEndDate: string;
  tripCurrency: Currency;
}

export function ActivitiesTab({
  tripId,
  tripCountries,
  destinations,
  tripStartDate,
  tripEndDate,
  tripCurrency,
}: ActivitiesTabProps) {
  const {
    activities,
    loading,
    isRefetching,
    isError,
    refetch,
    addActivity,
    updateActivity,
    deleteActivity,
  } = useActivities(tripId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAct, setEditingAct] = useState<Activity | undefined>();

  // Filters
  const [filterName, setFilterName] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDate, setFilterDate] = useState("");

  const filteredActivities = activities.filter((a) => {
    const matchesName = !filterName || a.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesCity = filterCity === "all" || a.destinationId?.toString() === filterCity;
    const matchesType = filterType === "all" || a.type === filterType;
    const matchesDate = !filterDate || a.date === filterDate;
    return matchesName && matchesCity && matchesType && matchesDate;
  });

  if (loading && activities.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-9 w-28 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        {[1, 2].map((i) => (
          <ActivitySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ActivityErrorState onRetry={refetch} />;
  }

  const clearFilters = () => {
    setFilterName("");
    setFilterCity("all");
    setFilterType("all");
    setFilterDate("");
  };

  const hasFilters = filterName || filterCity !== "all" || filterType !== "all" || filterDate;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="bg-fuchsia-pastel-50 dark:bg-fuchsia-pastel-900/10 p-4 border-b border-fuchsia-pastel-100 dark:border-fuchsia-pastel-900/20">
        <div className="flex flex-col gap-6 mb-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="font-bold text-lg flex items-center gap-2 text-fuchsia-pastel-700 dark:text-fuchsia-pastel-400">
                <Compass size={20} className="text-fuchsia-pastel-500" />
                Activities{" "}
                <span className="text-fuchsia-pastel-600/60 dark:text-fuchsia-pastel-400/40 font-normal text-sm">
                  ({filteredActivities.length} of {activities.length})
                </span>
              </h2>
              <AnimatePresence>{isRefetching && <ActivityRefetchingIndicator />}</AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
              <div className="w-full sm:w-auto min-w-[160px]">
                <Input
                  id="act-name-filter"
                  placeholder="Search..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="bg-white/80 dark:bg-surface-2/80 h-9 text-sm"
                />
              </div>
              <div className="w-full sm:w-auto min-w-[160px]">
                <SearchableSelect
                  id="act-city-filter"
                  placeholder="All Cities"
                  value={filterCity}
                  options={[
                    { value: "all", label: "All Cities", icon: <MapPin size={14} /> },
                    ...destinations.map((d) => {
                      const tc = tripCountries.find((c) => c.id === d.tripCountryId);
                      return {
                        value: d.id!.toString(),
                        label: `${d.name}`,
                        icon: <span>{getFlagEmoji(tc?.countryCode || "")}</span>,
                      };
                    }),
                  ]}
                  onChange={(val: string) => setFilterCity(val)}
                  includeSearch={true}
                  className="h-9 bg-white/80 dark:bg-surface-2/80"
                />
              </div>
              <div className="w-full sm:w-auto min-w-[160px]">
                <SearchableSelect
                  id="act-type-filter"
                  placeholder="All Types"
                  value={filterType}
                  options={[
                    { value: "all", label: "All Types", icon: <Filter size={14} /> },
                    ...ACTIVITY_TAGS.map((t) => ({
                      value: t.value,
                      label: t.label,
                      icon: <span>{t.icon}</span>,
                    })),
                  ]}
                  onChange={(val: string) => setFilterType(val)}
                  includeSearch={false}
                  className="h-9 bg-white/80 dark:bg-surface-2/80"
                />
              </div>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 text-fuchsia-pastel-600/60 hover:text-fuchsia-pastel-500 px-2"
                >
                  <X size={14} />
                </Button>
              )}

              <div className="h-6 w-px bg-fuchsia-pastel-200 dark:bg-fuchsia-pastel-800 mx-1 hidden lg:block" />

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingAct(undefined);
                  setFormOpen(true);
                }}
                className="h-9"
              >
                <Plus size={14} />
                Add Activity
              </Button>
            </div>
          </div>
        </div>
        <p className="text-sm text-fuchsia-pastel-600/80 dark:text-fuchsia-pastel-400/80">
          Explore experiences, tours, and sights at your destinations.
        </p>
      </div>

      <div className="p-6">
        {filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-2/50 border border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mb-4">
            <Compass size={32} className="text-slate-300" />
          </div>
          <p className="text-text-secondary font-medium mb-4">
            {activities.length === 0
              ? "No activities added yet"
              : "No activities match your filters"}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={activities.length === 0 ? () => setFormOpen(true) : clearFilters}
          >
            <Plus size={14} className="mr-2" />
            {activities.length === 0 ? "Add Your First Activity" : "Clear All Filters"}
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {tripCountries.map((tc) => {
            const countryActivities = filteredActivities.filter((a) => a.tripCountryId === tc.id);
            if (countryActivities.length === 0) return null;

            return (
              <div key={tc.id} className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                  <span className="text-2xl" role="img" aria-label={tc.countryName}>
                    {getFlagEmoji(tc.countryCode)}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">{tc.countryName}</h3>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                      {countryActivities.length}{" "}
                      {countryActivities.length === 1 ? "Activity" : "Activities"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-start gap-6">
                  <AnimatePresence mode="popLayout">
                    {countryActivities.map((a) => (
                      <ActivityCard
                        key={a.id}
                        activity={a}
                        destinationName={destinations.find((d) => d.id === a.destinationId)?.name}
                        onEdit={(act: Activity) => {
                          setEditingAct(act);
                          setFormOpen(true);
                        }}
                        onDelete={deleteActivity}
                        onConfirm={(id) => updateActivity(id, { isConfirmed: true })}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}

          {/* Fallback for items with no country or different country */}
          {(() => {
            const otherActivities = filteredActivities.filter(
              (a) => !a.tripCountryId || !tripCountries.find((tc) => tc.id === a.tripCountryId),
            );
            if (otherActivities.length === 0) return null;
            return (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center">
                    <Compass size={16} className="text-text-muted" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">Other Locations</h3>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                      {otherActivities.length}{" "}
                      {otherActivities.length === 1 ? "Activity" : "Activities"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                  <AnimatePresence mode="popLayout">
                    {otherActivities.map((a) => (
                      <ActivityCard
                        key={a.id}
                        activity={a}
                        destinationName={destinations.find((d) => d.id === a.destinationId)?.name}
                        onEdit={(act: Activity) => {
                          setEditingAct(act);
                          setFormOpen(true);
                        }}
                        onDelete={deleteActivity}
                        onConfirm={(id) => updateActivity(id, { isConfirmed: true })}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      </div>

      <ActivityForm
        key={editingAct?.id ?? "new"}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingAct(undefined);
        }}
        onSave={
          editingAct?.id
            ? async (data) => {
                await updateActivity(editingAct.id!, data);
              }
            : addActivity
        }
        initial={editingAct}
        tripId={tripId}
        tripCountries={tripCountries}
        destinations={destinations}
        tripStartDate={tripStartDate}
        tripEndDate={tripEndDate}
        tripCurrency={tripCurrency}
      />
    </div>
  );
}
