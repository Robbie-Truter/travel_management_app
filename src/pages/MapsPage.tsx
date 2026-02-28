import { motion } from "framer-motion";
import { Map as MapIcon, Plane } from "lucide-react";
import { useTrips } from "@/hooks/useTrips";
import { ItineraryMap } from "@/components/maps/ItineraryMap";

export function MapsPage() {
  const { trips, loading } = useTrips();

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
            <div className="p-2 bg-lavender-100 dark:bg-lavender-900/30 rounded-xl text-lavender-600">
              <MapIcon size={28} />
            </div>
            My Maps
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            Visualizing your world-wide travel story
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] bg-surface border border-border rounded-2xl shadow-sm overflow-hidden relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-lavender-200 border-t-lavender-500 rounded-full animate-spin" />
              <p className="text-sm font-bold text-lavender-600 animate-pulse">
                Mapping your trips...
              </p>
            </div>
          </div>
        ) : trips.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center mb-4">
              <Plane size={36} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">No trips to map yet</h2>
            <p className="text-sm text-text-secondary max-w-xs">
              Once you add trips with destinations, they'll appear here on your personal travel map.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <ItineraryMap trips={trips} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
