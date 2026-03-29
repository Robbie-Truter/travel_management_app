import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useDestinations } from "@/hooks/useDestinations";
import { DestinationCard, DestinationForm } from "./DestinationComponents";
import { DestSkeleton, DestRefetchingIndicator } from "./DestLoadingStates";
import { DestErrorState } from "./DestErrorState";
import type { Destination, TripCountry } from "@/db/types";

interface DestinationsTabProps {
  tripId: number;
  tripCountries: TripCountry[];
}

export function DestinationsTab({ tripId, tripCountries }: DestinationsTabProps) {
  const {
    destinations,
    loading,
    isRefetching,
    isError,
    refetch,
    addDestination,
    updateDestination,
    deleteDestination,
  } = useDestinations(tripId);

  const [formOpen, setDestFormOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | undefined>();

  if (loading && destinations.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-9 w-28 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <DestSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <DestErrorState onRetry={refetch} />;
  }

  return (
    <div className="p-4 bg-surface border border-border rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MapPin size={20} className="text-lavender-500" />
            Destinations{" "}
            <span className="text-text-muted font-normal text-sm">({destinations.length})</span>
          </h2>
          <AnimatePresence>{isRefetching && <DestRefetchingIndicator />}</AnimatePresence>
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
      <p className="text-sm text-text-secondary mb-6">
        Manage the cities and towns you'll be visiting during this trip.
      </p>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {destinations.map((d) => (
              <DestinationCard
                key={d.id}
                destination={d}
                onEdit={(dest) => {
                  setEditingDest(dest);
                  setDestFormOpen(true);
                }}
                onDelete={deleteDestination}
                tripCountries={tripCountries}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

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
      />
    </div>
  );
}
