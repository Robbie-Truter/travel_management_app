import { useState } from "react";
import { Plus, BarChart2, Plane } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useFlights } from "@/hooks/useFlights";
import { FlightCard, FlightForm, FlightComparison } from "./FlightComponents";
import { FlightSkeleton, FlightRefetchingIndicator } from "./FlightLoadingStates";
import { FlightErrorState } from "./FlightErrorState";
import { getCountryFlag } from "@/lib/utils";
import type { Flight, TripCountry } from "@/db/types";

interface FlightsTabProps {
  tripId: number;
  tripCountries: TripCountry[];
}

export function FlightsTab({ tripId, tripCountries }: FlightsTabProps) {
  const {
    flights,
    loading,
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
  const [compareOpen, setCompareOpen] = useState(false);

  if (loading && flights.length === 0) {
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
    <div className="relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-xl text-text-primary tracking-tight">
            Flights{" "}
            <span className="text-text-muted font-normal text-sm ml-2">
              ({flights.length} total)
            </span>
          </h2>
          <AnimatePresence>{isRefetching && <FlightRefetchingIndicator />}</AnimatePresence>
        </div>
        <div className="flex gap-2">
          {flights.length >= 2 && (
            <Button variant="secondary" size="sm" onClick={() => setCompareOpen(true)}>
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

      {flights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mb-4">
            <Plane size={32} className="text-slate-300" />
          </div>
          <p className="text-text-secondary font-medium mb-4">No flights added yet</p>
          <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
            <Plus size={14} />
            Add Your First Flight
          </Button>
        </div>
      ) : (
        <div className="space-y-12 max-w-4xl mx-auto">
          {tripCountries.map((tc) => {
            const countryFlights = flights.filter((f) => f.tripCountryId === tc.id);
            if (countryFlights.length === 0) return null;

            return (
              <div key={tc.id} className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                  <span className="text-2xl" role="img" aria-label={tc.countryName}>
                    {getCountryFlag(tc.countryName)}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">{tc.countryName}</h3>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                      {countryFlights.length} {countryFlights.length === 1 ? "Flight" : "Flights"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {countryFlights.map((f) => (
                      <FlightCard
                        key={f.id}
                        flight={f}
                        onEdit={(fl: Flight) => {
                          setEditingFlight(fl);
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
                await updateFlight(editingFlight.id!, data);
              }
            : addFlight
        }
        initial={editingFlight}
        tripId={tripId}
        tripCountries={tripCountries}
        lastFlight={flights[flights.length - 1]}
      />

      <FlightComparison
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        flights={flights}
      />
    </div>
  );
}
