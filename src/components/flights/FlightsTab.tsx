import { useState } from "react";
import { Plus, BarChart2, Plane } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useFlights } from "@/hooks/useFlights";
import { FlightCard } from "./FlightCard";
import { FlightForm } from "./FlightForm";
import { FlightComparison } from "./FlightComparison";
import { FlightSkeleton, FlightRefetchingIndicator } from "./FlightLoadingStates";
import { FlightErrorState } from "./FlightErrorState";
import { getFlagEmoji } from "@/lib/utils";
import type { Flight, Currency, TripCountry } from "@/db/types";

interface FlightsTabProps {
  tripId: number;
  tripCountries: TripCountry[];
  tripStartDate: string;
  tripEndDate: string;
  tripCurrency: Currency;
}

export function FlightsTab({
  tripId,
  tripCountries,
  tripStartDate,
  tripEndDate,
  tripCurrency,
}: FlightsTabProps) {
  const {
    flights,
    isLoading,
    isRefetching,
    isError,
    refetch,
    addFlight,
    updateFlight,
    deleteFlight,
    confirmFlight,
  } = useFlights(tripId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | undefined>();
  const [lastInteractedFlight, setLastInteractedFlight] = useState<Flight | undefined>(
    flights[flights.length - 1],
  );
  const [compareOpen, setCompareOpen] = useState(false);

  if (isLoading && flights.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-9 w-28 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        {[1, 2].map((i) => (
          <FlightSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <FlightErrorState onRetry={refetch} />;
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="bg-indigo-pastel-50 dark:bg-indigo-pastel-900/10 p-4 border-b border-indigo-pastel-100 dark:border-indigo-pastel-900/20">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-indigo-pastel-700 dark:text-indigo-pastel-400">
              <Plane size={20} className="text-indigo-pastel-500" />
              Flights{" "}
              <span className="text-indigo-pastel-600/60 dark:text-indigo-pastel-400/40 font-normal text-sm">
                ({flights.length})
              </span>
            </h2>
            <AnimatePresence>{isRefetching && <FlightRefetchingIndicator />}</AnimatePresence>
          </div>
          <div className="flex gap-2">
            {flights.length >= 2 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCompareOpen(true)}
                className="bg-white/80 hover:bg-white dark:bg-surface-2/80 dark:hover:bg-surface-2"
              >
                <BarChart2 size={14} />
                Compare
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingFlight(undefined);
                setFormOpen(true);
              }}
            >
              <Plus size={14} />
              Add Flight
            </Button>
          </div>
        </div>
        <p className="text-sm text-indigo-pastel-600/80 dark:text-indigo-pastel-400/80">
          Keep track of your journeys, tickets, and connections.
        </p>
      </div>

      <div className="p-6">
        {flights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-2/50 border border-dashed border-border rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mb-4">
              <Plane size={32} className="text-slate-300" />
            </div>
            <p className="text-text-secondary font-medium mb-4">No flights added yet</p>
            <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
              <Plus size={14} className="mr-2" />
              Add Your First Flight
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {tripCountries.map((tc) => {
              const countryFlights = flights.filter((f) => f.tripCountryId === tc.id);
              if (countryFlights.length === 0) return null;

              return (
                <div key={tc.id} className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                    <span className="text-2xl" role="img" aria-label={tc.countryName}>
                      {getFlagEmoji(tc.countryCode)}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary">{tc.countryName}</h3>
                      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                        {countryFlights.length} {countryFlights.length === 1 ? "Flight" : "Flights"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-start gap-6">
                    <AnimatePresence mode="popLayout">
                      {countryFlights.map((f) => (
                        <FlightCard
                          key={f.id}
                          flight={f}
                          onEdit={(fl: Flight) => {
                            setEditingFlight(fl);
                            setLastInteractedFlight(fl);
                            setFormOpen(true);
                          }}
                          onDelete={deleteFlight}
                          onConfirm={confirmFlight}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}

            {/* Fallback for items with no country or different country */}
            {(() => {
              const otherFlights = flights.filter(
                (f) => !f.tripCountryId || !tripCountries.find((tc) => tc.id === f.tripCountryId),
              );
              if (otherFlights.length === 0) return null;
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                    <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center">
                      <Plane size={16} className="text-text-muted" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary">Other Locations</h3>
                      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                        {otherFlights.length} {otherFlights.length === 1 ? "Flight" : "Flights"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                      {otherFlights.map((f) => (
                        <FlightCard
                          key={f.id}
                          flight={f}
                          onEdit={(fl: Flight) => {
                            setEditingFlight(fl);
                            setLastInteractedFlight(fl);
                            setFormOpen(true);
                          }}
                          onDelete={deleteFlight}
                          onConfirm={confirmFlight}
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

      <FlightForm
        key={editingFlight?.id ?? "new"}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingFlight(undefined);
        }}
        onSave={
          editingFlight?.id
            ? async (data) => {
                const updated = await updateFlight(editingFlight.id!, data);
                setLastInteractedFlight(updated as Flight);
              }
            : async (data) => {
                const added = await addFlight(data);
                setLastInteractedFlight(added as Flight);
              }
        }
        initial={editingFlight}
        tripId={tripId}
        tripCountries={tripCountries}
        lastFlight={lastInteractedFlight}
        tripStartDate={tripStartDate}
        tripEndDate={tripEndDate}
        tripCurrency={tripCurrency}
      />

      <FlightComparison
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        flights={flights}
      />
    </div>
  );
}
