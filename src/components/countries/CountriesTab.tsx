import { MapPin } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useTripCountries } from "@/hooks/useTripCountries";
import { useDestinations } from "@/hooks/useDestinations";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { TripCountries } from "./TripCountries";
import { UnassignedItems } from "./UnassignedItems";
import { CountriesSkeleton, CountriesRefetchingIndicator } from "./CountriesLoadingStates";
import { CountriesErrorState } from "./CountriesErrorState";
import type { Trip } from "@/db/types";

interface CountriesTabProps {
  trip: Trip;
}

export function CountriesTab({ trip }: CountriesTabProps) {
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
              Trip Countries
            </h2>
            <AnimatePresence>{isAnyRefetching && <CountriesRefetchingIndicator />}</AnimatePresence>
          </div>
        </div>
        <p className="text-sm text-teal-pastel-600/80 dark:text-teal-pastel-400/80">
          Manage the countries you'll be visiting during this trip.
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
        />

        <UnassignedItems
          flights={flights}
          accommodations={accommodations}
          activities={activities}
        />
      </div>
    </div>
  );
}
