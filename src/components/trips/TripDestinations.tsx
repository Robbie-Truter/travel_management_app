import { useState } from "react";
import { MapPin, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { COUNTRIES } from "@/lib/countries";
import { useTrips } from "@/hooks/useTrips";
import type { Trip } from "@/db/types";
import { motion, AnimatePresence } from "framer-motion";

interface TripDestinationsProps {
  trip: Trip;
}

export function TripDestinations({ trip }: TripDestinationsProps) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {trip.destinations?.map((countryName) => {
            const country = COUNTRIES.find((c) => c.name === countryName);
            const flagCode = country?.code.toLowerCase();

            return (
              <motion.div
                key={countryName}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="group relative overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
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
                      <h4 className="font-semibold text-text-primary truncate">{countryName}</h4>
                      <p className="text-xs text-text-muted">Destination</p>
                    </div>
                    <button
                      onClick={() => handleRemove(countryName)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-rose-pastel-500 transition-all"
                      title={`Remove ${countryName}`}
                    >
                      <X size={16} />
                    </button>
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
    </div>
  );
}
