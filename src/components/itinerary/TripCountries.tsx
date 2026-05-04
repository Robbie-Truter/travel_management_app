import { useState } from "react";
import { MapPin, Plus, X, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useCountrySearch } from "@/hooks/useCountrySearch";
import { useDebounce } from "@/hooks/useDebounce";
import { useTripCountries } from "@/hooks/useTripCountries";
import type { Trip, Flight, Accommodation, Activity, Destination, TripCountry } from "@/db/types";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Hotel, Compass, ChevronRight } from "lucide-react";
import { getFlagEmoji } from "@/lib/utils";
import { DeleteCountryModal } from "./DeleteCountryModal";

interface TripCountriesProps {
  trip: Trip;
  tripCountries: TripCountry[];
  destinations: Destination[];
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
  onAddDestination: (countryId: number) => void;
  onEditDestination: (dest: Destination) => void;
  onDeleteDestination: (dest: Destination) => void;
}

export function TripCountries({
  trip,
  tripCountries,
  destinations,
  flights,
  accommodations,
  activities,
  onAddDestination,
  onEditDestination,
  onDeleteDestination,
}: TripCountriesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<TripCountry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { countries, isLoading } = useCountrySearch(debouncedSearch);

  const { addTripCountry, deleteTripCountry } = useTripCountries(trip.id!);

  const handleAdd = async () => {
    if (!selectedCountryId) return;
    const countryData = countries.find((c) => c.id.toString() === selectedCountryId);
    if (!countryData) return;

    if (tripCountries.some((tc) => tc.countryId === countryData.id)) {
      setIsAdding(false);
      setSelectedCountryId("");
      setSearchQuery("");
      return;
    }

    await addTripCountry({
      tripId: trip.id!,
      countryId: countryData.id,
      countryName: countryData.name,
      countryCode: countryData.iso2,
      order: tripCountries.length,
    });

    setIsAdding(false);
    setSelectedCountryId("");
    setSearchQuery("");
  };

  const handleRemove = async () => {
    if (!countryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTripCountry(countryToDelete.id!);
      setCountryToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          Visited Countries ({tripCountries.length})
        </h3>
        {!isAdding && (
          <Button variant="primary" size="sm" onClick={() => setIsAdding(true)}>
            <Plus size={14} />
            Add Country
          </Button>
        )}
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-lavender-50 dark:bg-lavender-900/20 border border-lavender-200 dark:border-lavender-800 rounded-xl flex flex-col sm:flex-row gap-3 items-end"
        >
          <div className="flex-1 w-full">
            <SearchableSelect
              id="country-select"
              label="Select Country"
              placeholder="e.g. Japan"
              options={countries
                .filter((c) => !tripCountries.some((tc) => tc.countryId === c.id))
                .map((c) => ({
                  value: c.id.toString(),
                  label: c.name,
                  icon: <span>{getFlagEmoji(c.iso2)}</span>,
                }))}
              value={selectedCountryId}
              onChange={(val) => setSelectedCountryId(val)}
              onSearchChange={setSearchQuery}
              isSearchLoading={isLoading}
              searchHint="Type at least 3 characters to search countries..."
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none"
              onClick={() => {
                setIsAdding(false);
                setSelectedCountryId("");
                setSearchQuery("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1 sm:flex-none"
              onClick={handleAdd}
              disabled={!selectedCountryId}
            >
              Add
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {tripCountries.map((tc) => {
            const flagCode = tc.countryCode.toLowerCase();

            const countryDestinations =
              destinations?.filter((d) => d.tripCountryId === tc.id) || [];
            const countryFlights = flights.filter((f) => f.tripCountryId === tc.id);
            const countryStays = accommodations.filter((a) => a.tripCountryId === tc.id);
            const countryActivities = activities.filter((a) => a.tripCountryId === tc.id);

            return (
              <motion.div
                key={tc.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="group relative overflow-hidden h-full">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="p-4 flex items-center gap-4 border-b border-border bg-surface-2">
                      <div className="w-12 h-12 rounded-lg bg-surface-3 flex items-center justify-center shrink-0 border border-border">
                        {flagCode ? (
                          <span
                            className={`fi fi-${flagCode} text-2xl rounded-sm shadow-sm`}
                            title={tc.countryName}
                          />
                        ) : (
                          <MapPin size={20} className="text-lavender-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-text-primary truncate">
                          {tc.countryName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            {tc.budgetLimit ? `Budget: ${tc.budgetLimit}` : "Destination"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setCountryToDelete(tc)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-rose-pastel-500 transition-all shrink-0"
                        title={`Remove ${tc.countryName}`}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-6">
                      {/* Destinations (Cities/Towns) */}
                      <div>
                        <div className="flex items-center justify-between mb-3 pb-1 border-b border-lavender-100 dark:border-lavender-900/30">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-lavender-600 flex items-center gap-1.5">
                            <MapPin size={12} />
                            Destinations ({countryDestinations.length})
                          </h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] font-bold text-lavender-500 hover:text-lavender-600 hover:bg-lavender-50 flex items-center gap-1"
                            onClick={() => onAddDestination(tc.id!)}
                          >
                            <Plus size={10} />
                            Add
                          </Button>
                        </div>
                        {countryDestinations.length > 0 ? (
                          <ul className="space-y-2.5">
                            {countryDestinations.map((d) => (
                              <li
                                key={d.id}
                                className="group/item flex items-center gap-3 p-1.5 rounded-xl border border-transparent hover:border-border hover:bg-surface-2 transition-all"
                              >
                                <div className="w-10 h-10 rounded-lg bg-surface-3 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                                  {d.image ? (
                                    <img
                                      src={d.image}
                                      alt={d.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <MapPin size={14} className="text-text-muted/40" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-bold text-text-primary block truncate">
                                    {d.name}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <button
                                      onClick={() => onEditDestination(d)}
                                      className="text-[10px] font-medium text-text-muted hover:text-lavender-500 transition-colors flex items-center gap-0.5"
                                    >
                                      <Edit size={10} />
                                      Edit
                                    </button>
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    <button
                                      onClick={() => onDeleteDestination(d)}
                                      className="text-[10px] font-medium text-text-muted hover:text-rose-pastel-500 transition-colors flex items-center gap-0.5"
                                    >
                                      <Trash2 size={10} />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                <ChevronRight
                                  size={12}
                                  className="text-text-muted opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-xl bg-surface-2/30">
                            <p className="text-[10px] text-text-muted italic mb-2">
                              No destinations added yet
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-3 text-[10px] font-bold text-lavender-500 hover:bg-lavender-50"
                              onClick={() => onAddDestination(tc.id!)}
                            >
                              <Plus size={12} className="mr-1" />
                              Add your first city
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Flights */}
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-sky-pastel-600 mb-3 flex items-center gap-1.5">
                          <Plane size={12} />
                          Flights ({countryFlights.length})
                        </h5>
                        {countryFlights.length > 0 ? (
                          <ul className="space-y-2">
                            {countryFlights.map((f) => (
                              <li
                                key={f.id}
                                className="text-xs flex items-center justify-between text-text-secondary py-1 border-b border-border/30 last:border-0"
                              >
                                <span className="truncate font-medium flex-1">
                                  {f.description ||
                                    `${f.segments[0].airline} ${f.segments[0].flightNumber}`}
                                </span>
                                <ChevronRight size={10} className="text-text-muted shrink-0" />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[10px] text-text-muted italic">No flights yet</p>
                        )}
                      </div>

                      {/* Stays */}
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-lavender-600 mb-3 flex items-center gap-1.5">
                          <Hotel size={12} />
                          Stays ({countryStays.length})
                        </h5>
                        {countryStays.length > 0 ? (
                          <ul className="space-y-2">
                            {countryStays.map((s) => (
                              <li
                                key={s.id}
                                className="text-xs flex items-center justify-between text-text-secondary py-1 border-b border-border/30 last:border-0"
                              >
                                <span className="truncate font-medium flex-1">{s.name}</span>
                                <ChevronRight size={10} className="text-text-muted shrink-0" />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[10px] text-text-muted italic">No stays yet</p>
                        )}
                      </div>

                      {/* Activities */}
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-teal-pastel-600 mb-3 flex items-center gap-1.5">
                          <Compass size={12} />
                          Activities ({countryActivities.length})
                        </h5>
                        {countryActivities.length > 0 ? (
                          <ul className="space-y-2">
                            {countryActivities.map((a) => (
                              <li
                                key={a.id}
                                className="text-xs flex items-center justify-between text-text-secondary py-1 border-b border-border/30 last:border-0"
                              >
                                <span className="truncate font-medium flex-1">{a.name}</span>
                                <ChevronRight size={10} className="text-text-muted shrink-0" />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[10px] text-text-muted italic">No activities yet</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {tripCountries.length === 0 && !isAdding && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-surface-2 rounded-2xl border-2 border-dashed border-border">
            <div className="w-12 h-12 rounded-full bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center mb-3">
              <MapPin size={20} className="text-lavender-500" />
            </div>
            <p className="text-sm text-text-secondary">No destinations added to this trip yet.</p>
            <Button
              variant="ghost"
              className="text-lavender-600 mt-1 hover:bg-lavender-50 dark:hover:bg-lavender-900/20"
              onClick={() => setIsAdding(true)}
            >
              Add your first country
            </Button>
          </div>
        )}
      </div>

      <DeleteCountryModal
        isOpen={!!countryToDelete}
        onClose={() => setCountryToDelete(null)}
        onConfirm={handleRemove}
        countryName={countryToDelete?.countryName || ""}
        isDeleting={isDeleting}
        counts={{
          cities: destinations.filter((d) => d.tripCountryId === countryToDelete?.id).length,
          flights: flights.filter((f) => f.tripCountryId === countryToDelete?.id).length,
          stays: accommodations.filter((a) => a.tripCountryId === countryToDelete?.id).length,
          activities: activities.filter((act) => act.tripCountryId === countryToDelete?.id).length,
        }}
      />
    </div>
  );
}
