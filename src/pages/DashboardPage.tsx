import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Map, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TripCard } from "@/components/trips/TripCard";
import { TripForm } from "@/components/trips/TripForm";
import { TripSkeleton, RefetchingIndicator } from "@/components/trips/TripLoadingStates";
import TripErrorState from "@/components/trips/TripErrorState";
import { useTrips } from "@/hooks/useTrips";
import { importTripFromJSON } from "@/lib/export";
import { useNotification } from "@/hooks/useNotification";
import type { Trip } from "@/db/types";

export function DashboardPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>();
  const [search, setSearch] = useState("");

  const { trips, addTrip, updateTrip, deleteTrip, loading, isRefetching, isError, error, refetch } =
    useTrips();
  const { showToast } = useNotification();

  const importRef = useRef<HTMLInputElement>(null);

  const filtered = trips.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tripCountries.some((tc) => tc.countryName.toLowerCase().includes(search.toLowerCase())),
  );

  const handleSave = async (data: Omit<Trip, "id" | "createdAt" | "updatedAt">) => {
    if (editingTrip?.id) {
      await updateTrip(editingTrip.id, data);
    } else {
      await addTrip(data);
    }
    setEditingTrip(undefined);
    setFormOpen(false);
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormOpen(true);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importTripFromJSON(file);
      showToast("Trip imported successfully", "success");
      refetch(); // Ensure new trip shows up
    } catch (err) {
      console.error("Import failed", err);
      showToast(err instanceof Error ? err.message : "Failed to import trip", "error");
    }
    e.target.value = "";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-12">
        <div className="space-y-1 relative">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight md:text-4xl">
              My Trips
            </h1>
            <AnimatePresence>
              {isRefetching && (
                <div className="absolute -right-8 top-1">
                  <RefetchingIndicator />
                </div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-base text-text-secondary font-medium">
            Discover and manage your{" "}
            <span className="text-lavender-500 font-bold">{trips.length}</span> active journey
            {trips.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
          {/* Search Bar - More prominent */}
          <div className="relative flex-1 md:w-80 group">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-lavender-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search your adventures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full pl-11 pr-4 rounded-xl border border-border bg-surface/50 backdrop-blur-sm text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-lavender-400 focus:border-transparent transition-all shadow-sm hover:border-border/80"
            />
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="flex-1 md:flex-none h-11 px-6 rounded-xl border-border bg-surface/50 backdrop-blur-sm"
              onClick={() => importRef.current?.click()}
            >
              <Upload size={16} className="text-text-secondary" />
              <span>Import</span>
            </Button>
            <Button
              variant="primary"
              className="flex-1 md:flex-none h-11 px-8 rounded-xl"
              onClick={() => {
                setEditingTrip(undefined);
                setFormOpen(true);
              }}
            >
              <Plus size={18} />
              <span className="font-bold">New Trip</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Trip grid */}
      <AnimatePresence mode="wait">
        {isError ? (
          <TripErrorState
            key="error"
            message={error instanceof Error ? error.message : "Something went wrong"}
            onRetry={refetch}
          />
        ) : loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {[...Array(4)].map((_, i) => (
              <TripSkeleton key={i} />
            ))}
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center mb-4">
              <Map size={36} className="text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              {search ? "No trips found" : "No trips yet"}
            </h2>
            <p className="text-sm text-text-secondary max-w-xs mb-6">
              {search
                ? "Try a different search term"
                : "Start planning your next adventure by creating your first trip."}
            </p>
            {!search && (
              <Button variant="primary" onClick={() => setFormOpen(true)}>
                <Plus size={15} />
                Create Your First Trip
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-2 flex-wrap"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteTrip(id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <TripForm
        key={editingTrip?.id ?? "new"}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTrip(undefined);
        }}
        onSave={handleSave}
        initial={editingTrip}
      />

      <input
        ref={importRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
