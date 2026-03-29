import { MapPin } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useTripCountries } from "@/hooks/useTripCountries";
import { useDestinations } from "@/hooks/useDestinations";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { TripDestinations } from "./TripDestinations";
import { UnassignedItems } from "./UnassignedItems";
import { CountrySkeleton, CountryRefetchingIndicator } from "./CountryLoadingStates";
import { CountryErrorState } from "./CountryErrorState";
import type { Trip } from "@/db/types";

interface TripCountriesProps {
  trip: Trip;
}

export function TripCountries({ trip }: TripCountriesProps) {
  const {
    tripCountries,
    loading: countriesLoading,
    isRefetching: countriesRefetching,
    isError: countriesError,
    refetch: refetchCountries,
  } = useTripCountries(trip.id!);

  const {
    destinations,
    loading: destLoading,
    isRefetching: destRefetching,
    isError: destError,
    refetch: refetchDest,
  } = useDestinations(trip.id!);

  const {
    flights,
    loading: flightsLoading,
    isRefetching: flightsRefetching,
    isError: flightsError,
    refetch: refetchFlights,
  } = useFlights(trip.id!);

  const {
    accommodations,
    loading: accLoading,
    isRefetching: accRefetching,
    isError: accError,
    refetch: refetchAcc,
  } = useAccommodations(trip.id!);

  const {
    activities,
    loading: actLoading,
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
            <CountrySkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isAnyError) {
    return <CountryErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="p-4 bg-surface border border-border rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MapPin size={20} className="text-lavender-500" />
            Trip Countries
          </h2>
          <AnimatePresence>{isAnyRefetching && <CountryRefetchingIndicator />}</AnimatePresence>
        </div>
      </div>
      <p className="text-sm text-text-secondary mb-6">
        Manage the countries you'll be visiting during this trip.
      </p>

      <TripDestinations
        trip={trip}
        tripCountries={tripCountries}
        destinations={destinations}
        flights={flights}
        accommodations={accommodations}
        activities={activities}
      />

      <UnassignedItems flights={flights} accommodations={accommodations} activities={activities} />
    </div>
  );
}
