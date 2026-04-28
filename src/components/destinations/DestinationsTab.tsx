import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useDestinations } from "@/hooks/useDestinations";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { DestinationCard } from "./DestinationCard";
import { DestinationForm } from "./DestinationForm";
import { DeleteDestinationModal } from "./DeleteDestinationModal";
import { DestinationSkeleton, DestinationRefetchingIndicator } from "./DestinationLoadingStates";
import { DestinationErrorState } from "./DestinationErrorState";
import { getFlagEmoji } from "@/lib/utils";
import type { Destination, TripCountry } from "@/db/types";

interface DestinationsTabProps {
  tripId: number;
  tripCountries: TripCountry[];
}

export function DestinationsTab({ tripId, tripCountries }: DestinationsTabProps) {
  const {
    destinations,
    isLoading,
    isRefetching,
    isError,
    refetch,
    addDestination,
    updateDestination,
    deleteDestination,
  } = useDestinations(tripId);

  const { accommodations } = useAccommodations(tripId);
  const { activities } = useActivities(tripId);

  const [formOpen, setDestFormOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | undefined>();
  const [destToDelete, setDestToDelete] = useState<Destination | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemove = async () => {
    if (!destToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDestination(destToDelete.id!);
      setDestToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && destinations.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-9 w-28 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <DestinationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <DestinationErrorState onRetry={refetch} />;
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="bg-sky-pastel-50 dark:bg-sky-pastel-900/10 p-4 border-b border-sky-pastel-100 dark:border-sky-pastel-900/20">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-sky-pastel-700 dark:text-sky-pastel-400">
              <MapPin size={20} className="text-sky-pastel-500" />
              Destinations{" "}
              <span className="text-sky-pastel-600/60 dark:text-sky-pastel-400/40 font-normal text-sm">
                ({destinations.length})
              </span>
            </h2>
            <AnimatePresence>{isRefetching && <DestinationRefetchingIndicator />}</AnimatePresence>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingDest(undefined);
              setDestFormOpen(true);
            }}
          >
            <Plus size={14} />
            Add Destination
          </Button>
        </div>
        <p className="text-sm text-sky-pastel-600/80 dark:text-sky-pastel-400/80">
          Manage the cities and towns you'll be visiting during this trip.
        </p>
      </div>

      <div className="p-6">
        {destinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-2/50 border border-dashed border-border rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mb-4">
              <MapPin size={32} className="text-slate-300" />
            </div>
            <p className="text-text-secondary font-medium mb-4">No destinations yet</p>
            <Button variant="primary" size="sm" onClick={() => setDestFormOpen(true)}>
              <Plus size={14} className="mr-2" />
              Add Your First Destination
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {tripCountries.map((tc) => {
              const countryDests = destinations.filter((d) => d.tripCountryId === tc.id);
              if (countryDests.length === 0) return null;

              return (
                <div key={tc.id} className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                    <span className="text-2xl" role="img" aria-label={tc.countryName}>
                      {getFlagEmoji(tc.countryCode)}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary">{tc.countryName}</h3>
                      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                        {countryDests.length}{" "}
                        {countryDests.length === 1 ? "Destination" : "Destinations"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-start gap-6">
                    <AnimatePresence mode="popLayout">
                      {countryDests.map((d) => (
                        <DestinationCard
                          key={d.id}
                          dest={d}
                          onEdit={(dest) => {
                            setEditingDest(dest);
                            setDestFormOpen(true);
                          }}
                          onDelete={() => setDestToDelete(d)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}

            {/* Fallback for items with no country or different country */}
            {(() => {
              const otherDests = destinations.filter(
                (d) => !d.tripCountryId || !tripCountries.find((tc) => tc.id === d.tripCountryId),
              );
              if (otherDests.length === 0) return null;
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                    <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center">
                      <MapPin size={16} className="text-text-muted" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary">Other Locations</h3>
                      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                        {otherDests.length}{" "}
                        {otherDests.length === 1 ? "Destination" : "Destinations"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-start gap-6">
                    <AnimatePresence mode="popLayout">
                      {otherDests.map((d) => (
                        <DestinationCard
                          key={d.id}
                          dest={d}
                          onEdit={(dest) => {
                            setEditingDest(dest);
                            setDestFormOpen(true);
                          }}
                          onDelete={() => setDestToDelete(d)}
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

      <DestinationForm
        key={editingDest?.id ?? "new"}
        open={formOpen}
        onClose={() => {
          setDestFormOpen(false);
          setEditingDest(undefined);
        }}
        onSave={
          editingDest?.id
            ? async (data) => {
                await updateDestination(editingDest.id!, data);
              }
            : addDestination
        }
        initial={editingDest}
        tripId={tripId}
        tripCountries={tripCountries}
        existingDestinations={destinations}
      />

      <DeleteDestinationModal
        isOpen={!!destToDelete}
        onClose={() => setDestToDelete(null)}
        onConfirm={handleRemove}
        destinationName={destToDelete?.name || ""}
        isDeleting={isDeleting}
        counts={{
          stays: accommodations.filter((a) => a.destinationId === destToDelete?.id).length,
          activities: activities.filter((act) => act.destinationId === destToDelete?.id).length,
        }}
      />
    </div>
  );
}
