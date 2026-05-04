import { useState } from "react";
import { MapPin } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useTripCountries } from "@/hooks/useTripCountries";
import { useDestinations } from "@/hooks/useDestinations";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { TripCountries } from "./TripCountries";
import { CountriesSkeleton, CountriesRefetchingIndicator } from "./CountriesLoadingStates";
import { CountriesErrorState } from "./CountriesErrorState";
import { DestinationForm } from "./DestinationForm";
import { DeleteDestinationModal } from "./DeleteDestinationModal";
import type { Trip, Destination } from "@/db/types";

interface ItineraryTabProps {
  trip: Trip;
}

export function ItineraryTab({ trip }: ItineraryTabProps) {
  const {
    tripCountries,
    isLoading: countriesLoading,
    isRefetching: countriesRefetching,
    isError: countriesError,
    refetch: refetchCountries,
  } = useTripCountries(trip.id!);

  const {
    destinations,
    isLoading: destLoading,
    isRefetching: destRefetching,
    isError: destError,
    refetch: refetchDest,
    addDestination,
    updateDestination,
    deleteDestination,
  } = useDestinations(trip.id!);

  const {
    flights,
    isLoading: flightsLoading,
    isRefetching: flightsRefetching,
    isError: flightsError,
    refetch: refetchFlights,
  } = useFlights(trip.id!);

  const {
    accommodations,
    isLoading: accLoading,
    isRefetching: accRefetching,
    isError: accError,
    refetch: refetchAcc,
  } = useAccommodations(trip.id!);

  const {
    activities,
    isLoading: actLoading,
    isRefetching: actRefetching,
    isError: actError,
    refetch: refetchActs,
  } = useActivities(trip.id!);

  const [formOpen, setDestFormOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | undefined>();
  const [destToDelete, setDestToDelete] = useState<Destination | null>(null);
  const [initialCountryId, setInitialCountryId] = useState<number | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoading = countriesLoading || destLoading || flightsLoading || accLoading || actLoading;
  const isAnyError = countriesError || destError || flightsError || accError || actError;
  const isAnyRefetching =
    countriesRefetching || destRefetching || flightsRefetching || accRefetching || actRefetching;

  const handleRetry = () => {
    refetchCountries();
    refetchDest();
    refetchFlights();
    refetchAcc();
    refetchActs();
  };

  const handleAddDestination = (countryId?: number) => {
    setInitialCountryId(countryId);
    setEditingDest(undefined);
    setDestFormOpen(true);
  };

  const handleEditDestination = (dest: Destination) => {
    setEditingDest(dest);
    setInitialCountryId(dest.tripCountryId);
    setDestFormOpen(true);
  };

  const handleDeleteDestination = async () => {
    if (!destToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDestination(destToDelete.id!);
      setDestToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && tripCountries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <CountriesSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isAnyError) {
    return <CountriesErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="bg-teal-pastel-50 dark:bg-teal-pastel-900/10 p-4 border-b border-teal-pastel-100 dark:border-teal-pastel-900/20">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-teal-pastel-700 dark:text-teal-pastel-400">
              <MapPin size={20} className="text-teal-pastel-500" />
              Trip Itinerary
            </h2>
            <AnimatePresence>{isAnyRefetching && <CountriesRefetchingIndicator />}</AnimatePresence>
          </div>
        </div>
        <p className="text-sm text-teal-pastel-600/80 dark:text-teal-pastel-400/80">
          Manage the countries and destinations you'll be visiting during this trip.
        </p>
      </div>

      <div className="p-6">
        <TripCountries
          trip={trip}
          tripCountries={tripCountries}
          destinations={destinations}
          flights={flights}
          accommodations={accommodations}
          activities={activities}
          onAddDestination={handleAddDestination}
          onEditDestination={handleEditDestination}
          onDeleteDestination={setDestToDelete}
        />
      </div>

      <DestinationForm
        key={editingDest?.id ?? `new-${initialCountryId}`}
        open={formOpen}
        onClose={() => {
          setDestFormOpen(false);
          setEditingDest(undefined);
          setInitialCountryId(undefined);
        }}
        onSave={
          editingDest?.id
            ? async (data) => {
                await updateDestination(editingDest.id!, data);
              }
            : addDestination
        }
        initial={
          editingDest ||
          (initialCountryId ? ({ tripCountryId: initialCountryId } as Destination) : undefined)
        }
        tripId={trip.id!}
        tripCountries={tripCountries}
        existingDestinations={destinations}
      />

      <DeleteDestinationModal
        isOpen={!!destToDelete}
        onClose={() => setDestToDelete(null)}
        onConfirm={handleDeleteDestination}
        destinationName={destToDelete?.name || ""}
        isDeleting={isDeleting}
        counts={{
          flights: flights.filter((f) => f.destinationId === destToDelete?.id).length,
          stays: accommodations.filter((a) => a.destinationId === destToDelete?.id).length,
          activities: activities.filter((act) => act.destinationId === destToDelete?.id).length,
        }}
      />
    </div>
  );
}
