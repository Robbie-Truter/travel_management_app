import { useState } from "react";
import { MapPin, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { COUNTRIES } from "@/lib/countries";
import { useTrips } from "@/hooks/useTrips";
import type { Trip, Flight, Accommodation, Activity, Destination } from "@/db/types";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Hotel, Compass, ChevronRight } from "lucide-react";

interface TripDestinationsProps {
  trip: Trip;
  destinations: Destination[];
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
}

export function TripDestinations({
  trip,
  destinations,
  flights,
  accommodations,
  activities,
}: TripDestinationsProps) {
  const { updateTrip } = useTrips();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");

  const handleAdd = async () => {
    if (!selectedCountry) return;
    if (trip.destinations?.includes(selectedCountry)) {
      setIsAdding(false);
      setSelectedCountry("");
      return;
    }

    const newDestinations = [...(trip.destinations ?? []), selectedCountry];
    await updateTrip(trip.id!, { destinations: newDestinations });
    setIsAdding(false);
    setSelectedCountry("");
  };

  const handleRemove = async (country: string) => {
    const newDestinations = (trip.destinations ?? []).filter((d) => d !== country);
    await updateTrip(trip.id!, { destinations: newDestinations });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          Visited Countries ({trip.destinations?.length ?? 0})
        </h3>
        {!isAdding && (
          <Button variant="secondary" size="sm" onClick={() => setIsAdding(true)}>
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
              options={COUNTRIES.map((c) => c.name)}
              value={selectedCountry}
              onChange={(val) => setSelectedCountry(val)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none"
              onClick={() => {
                setIsAdding(false);
                setSelectedCountry("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1 sm:flex-none"
              onClick={handleAdd}
              disabled={!selectedCountry}
            >
              Add
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {trip.destinations?.map((countryName) => {
            const country = COUNTRIES.find((c) => c.name === countryName);
            const flagCode = country?.code.toLowerCase();

            const countryDestinations =
              destinations?.filter((d) => d.country?.trim() === countryName) || [];
            const countryFlights = flights.filter((f) => f.country?.trim() === countryName);
            const countryStays = accommodations.filter((a) => a.country?.trim() === countryName);
            const countryActivities = activities.filter((a) => a.country?.trim() === countryName);

            return (
              <motion.div
                key={countryName}
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
                            title={countryName}
                          />
                        ) : (
                          <MapPin size={20} className="text-lavender-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-text-primary truncate">
                          {countryName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Destination
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(countryName)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-rose-pastel-500 transition-all shrink-0"
                        title={`Remove ${countryName}`}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-6">
                      {/* Destinations (Cities/Towns) */}
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-lavender-600 mb-3 flex items-center gap-1.5">
                          <MapPin size={12} />
                          Destinations ({countryDestinations.length})
                        </h5>
                        {countryDestinations.length > 0 ? (
                          <ul className="space-y-2">
                            {countryDestinations.map((d) => (
                              <li
                                key={d.id}
                                className="text-xs flex items-center justify-between text-text-secondary py-1 border-b border-border/30 last:border-0"
                              >
                                <span className="truncate font-medium flex-1">{d.name}</span>
                                <ChevronRight size={10} className="text-text-muted shrink-0" />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[10px] text-text-muted italic">No destinations yet</p>
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

        {(!trip.destinations || trip.destinations.length === 0) && !isAdding && (
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

      {/* Unassigned Items Section */}
      {(flights.some((f) => !f.country) ||
        accommodations.some((a) => !a.country) ||
        activities.some((a) => !a.country)) && (
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center border border-border">
              <Plus size={14} className="text-text-muted" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Unassigned Items
              </h3>
              <p className="text-[10px] text-text-muted italic">
                These items haven't been connected to a destination country yet.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flights.filter((f) => !f.country).length > 0 && (
              <Card className="bg-surface-2 border-dashed">
                <CardContent className="p-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-sky-pastel-600 mb-3 flex items-center gap-1.5">
                    <Plane size={12} />
                    Unassigned Flights ({flights.filter((f) => !f.country).length})
                  </h5>
                  <ul className="space-y-2">
                    {flights
                      .filter((f) => !f.country)
                      .map((f) => (
                        <li
                          key={f.id}
                          className="text-xs text-text-secondary py-1 border-b border-border/30 last:border-0 truncate font-medium"
                        >
                          {f.description ||
                            `${f.segments[0].airline} ${f.segments[0].flightNumber}`}
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {accommodations.filter((a) => !a.country).length > 0 && (
              <Card className="bg-surface-2 border-dashed">
                <CardContent className="p-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-lavender-600 mb-3 flex items-center gap-1.5">
                    <Hotel size={12} />
                    Unassigned Stays ({accommodations.filter((a) => !a.country).length})
                  </h5>
                  <ul className="space-y-2">
                    {accommodations
                      .filter((a) => !a.country)
                      .map((s) => (
                        <li
                          key={s.id}
                          className="text-xs text-text-secondary py-1 border-b border-border/30 last:border-0 truncate font-medium"
                        >
                          {s.name}
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {activities.filter((a) => !a.country).length > 0 && (
              <Card className="bg-surface-2 border-dashed">
                <CardContent className="p-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-teal-pastel-600 mb-3 flex items-center gap-1.5">
                    <Compass size={12} />
                    Unassigned Activities ({activities.filter((a) => !a.country).length})
                  </h5>
                  <ul className="space-y-2">
                    {activities
                      .filter((a) => !a.country)
                      .map((a) => (
                        <li
                          key={a.id}
                          className="text-xs text-text-secondary py-1 border-b border-border/30 last:border-0 truncate font-medium"
                        >
                          {a.name}
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
