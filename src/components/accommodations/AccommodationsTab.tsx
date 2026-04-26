import { useState } from "react";
import { Plus, BarChart2, Hotel } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAccommodations } from "@/hooks/useAccommodations";
import { AccommodationCard } from "./AccommodationCard";
import { AccommodationForm } from "./AccommodationForm";
import { AccommodationComparison } from "./AccommodationComparison";
import {
  AccommodationSkeleton,
  AccommodationRefetchingIndicator,
} from "./AccommodationLoadingStates";
import { AccommodationErrorState } from "./AccommodationErrorState";
import { getFlagEmoji } from "@/lib/utils";
import type { Accommodation, Currency, TripCountry } from "@/db/types";

interface AccommodationsTabProps {
  tripId: number;
  tripCountries: TripCountry[];
  tripStartDate: string;
  tripEndDate: string;
  tripCurrency: Currency;
}

export function AccommodationsTab({
  tripId,
  tripCountries,
  tripStartDate,
  tripEndDate,
  tripCurrency,
}: AccommodationsTabProps) {
  const {
    accommodations,
    isLoading,
    isRefetching,
    isError,
    refetch,
    addAccommodation,
    updateAccommodation,
    deleteAccommodation,
    confirmAccommodation,
  } = useAccommodations(tripId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Accommodation | undefined>();
  const [compareOpen, setCompareOpen] = useState(false);

  if (isLoading && accommodations.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-9 w-28 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        {[1, 2].map((i) => (
          <AccommodationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <AccommodationErrorState onRetry={refetch} />;
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="bg-lavender-50 dark:bg-lavender-900/10 p-4 border-b border-lavender-100 dark:border-lavender-900/20">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-lavender-700 dark:text-lavender-400">
              <Hotel size={20} className="text-lavender-500" />
              Accommodations{" "}
              <span className="text-lavender-600/60 dark:text-lavender-400/40 font-normal text-sm">
                ({accommodations.length})
              </span>
            </h2>
            <AnimatePresence>
              {isRefetching && <AccommodationRefetchingIndicator />}
            </AnimatePresence>
          </div>
          <div className="flex gap-2">
            {accommodations.length >= 2 && (
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
                setEditingAcc(undefined);
                setFormOpen(true);
              }}
            >
              <Plus size={14} />
              Add Stay
            </Button>
          </div>
        </div>
        <p className="text-sm text-lavender-600/80 dark:text-lavender-400/80">
          Manage your hotels, hostels, and other stays.
        </p>
      </div>

      <div className="p-6">
        {accommodations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-2/50 border border-dashed border-border rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mb-4">
              <Hotel size={32} className="text-slate-300" />
            </div>
            <p className="text-text-secondary font-medium mb-4">No accommodations added yet</p>
            <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
              <Plus size={14} className="mr-2" />
              Add Your First Stay
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {tripCountries.map((tc) => {
              const countryAccs = accommodations.filter((a) => a.tripCountryId === tc.id);
              if (countryAccs.length === 0) return null;

              return (
                <div key={tc.id} className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                    <span className="text-2xl" role="img" aria-label={tc.countryName}>
                      {getFlagEmoji(tc.countryCode)}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary">{tc.countryName}</h3>
                      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                        {countryAccs.length} {countryAccs.length === 1 ? "Stay" : "Stays"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-start gap-6">
                    <AnimatePresence mode="popLayout">
                      {countryAccs.map((a) => (
                        <AccommodationCard
                          key={a.id}
                          acc={a}
                          onEdit={(ac: Accommodation) => {
                            setEditingAcc(ac);
                            setFormOpen(true);
                          }}
                          onDelete={deleteAccommodation}
                          onConfirm={confirmAccommodation}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}

            {/* Fallback for items with no country or different country */}
            {(() => {
              const otherAccs = accommodations.filter(
                (a) => !a.tripCountryId || !tripCountries.find((tc) => tc.id === a.tripCountryId),
              );
              if (otherAccs.length === 0) return null;
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                    <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center">
                      <Hotel size={16} className="text-text-muted" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary">Other Locations</h3>
                      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                        {otherAccs.length} {otherAccs.length === 1 ? "Stay" : "Stays"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-start gap-6">
                    <AnimatePresence mode="popLayout">
                      {otherAccs.map((a) => (
                        <AccommodationCard
                          key={a.id}
                          acc={a}
                          onEdit={(ac: Accommodation) => {
                            setEditingAcc(ac);
                            setFormOpen(true);
                          }}
                          onDelete={deleteAccommodation}
                          onConfirm={confirmAccommodation}
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

      <AccommodationForm
        key={editingAcc?.id ?? "new"}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingAcc(undefined);
        }}
        onSave={
          editingAcc?.id
            ? async (data) => {
                await updateAccommodation(editingAcc.id!, data);
              }
            : addAccommodation
        }
        initial={editingAcc}
        tripId={tripId}
        tripCountries={tripCountries}
        tripStartDate={tripStartDate}
        tripEndDate={tripEndDate}
        tripCurrency={tripCurrency}
      />

      <AccommodationComparison
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        accommodations={accommodations}
        tripCountries={tripCountries}
      />
    </div>
  );
}
