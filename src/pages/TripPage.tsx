import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plane,
  Hotel,
  Compass,
  Calendar,
  StickyNote,
  File,
  MapPin,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge, statusLabels } from "@/components/ui/Badge";
import { useTrip } from "@/hooks/useTrips";
import { useTripCountries } from "@/hooks/useTripCountries";
import { useDestinations } from "@/hooks/useDestinations";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { FlightsTab } from "@/components/flights/FlightsTab";
import { AccommodationsTab } from "@/components/accommodations/AccommodationsTab";
import { DestinationsTab } from "@/components/destinations/DestinationsTab";
import { ActivitiesTab } from "@/components/activities/ActivitiesTab";
import { PlannerTab } from "@/components/planner/PlannerTab";
import { NotesTab } from "@/components/notes/NotesTab";
import { OverviewTab } from "@/components/overview/OverviewTab";
import { CountriesTab } from "@/components/countries/CountriesTab";
import { DocumentsTab } from "@/components/documents/DocumentsTab";
import { formatDate, tripDuration, cn } from "@/lib/utils";
import type { Trip, TripStatus } from "@/db/types";

type Tab =
  | "overview"
  | "countries"
  | "destinations"
  | "flights"
  | "accommodations"
  | "activities"
  | "planner"
  | "notes"
  | "documents";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "countries", label: "Countries", icon: MapPin },
  { id: "destinations", label: "Destinations", icon: MapPin },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "accommodations", label: "Stays", icon: Hotel },
  { id: "activities", label: "Activities", icon: Compass },
  { id: "planner", label: "Planner", icon: Calendar },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "documents", label: "Documents", icon: File },
];

export function TripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const id = Number(tripId);
  const { trip, loading } = useTrip(id);

  // Still needed for Hero Header and some tab passing
  const { tripCountries } = useTripCountries(id);
  const { destinations } = useDestinations(id);

  // These are still needed for Planner & TripCountries (until refactored)
  const { flights } = useFlights(id);
  const { accommodations } = useAccommodations(id);
  const { activities } = useActivities(id);

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-lavender-500 mb-4"
        >
          <Loader2 size={40} />
        </motion.div>
        <p className="text-text-secondary font-medium animate-pulse">Loading your trip...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Trip not found</p>
      </div>
    );
  }

  const duration = tripDuration(trip.startDate, trip.endDate);

  return (
    <div className="flex flex-col h-full">
      {/* Hero header */}
      <div
        className="relative h-48 sm:h-56 shrink-0 overflow-hidden"
        style={
          trip.coverImage
            ? {
                backgroundImage: `url(${trip.coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {!trip.coverImage && (
          <div className="absolute inset-0 bg-linear-to-br from-lavender-200 to-sky-pastel-200 dark:from-lavender-900/50 dark:to-sky-pastel-900/50" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-between p-5">
          <Button
            variant="secondary"
            size="sm"
            className="self-start bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={14} />
            All Trips
          </Button>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={trip.status as TripStatus}>{statusLabels[trip.status]}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-white">{trip.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {(trip?.tripCountries || []).length > 0
                  ? (trip?.tripCountries ?? []).map((tc) => tc.countryName).join(", ")
                  : "No countries"}
              </span>
              <span>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
              {duration && <span>· {duration}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface border-b border-border shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex overflow-x-auto px-4 scrollbar-thin"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
                  isActive
                    ? "text-lavender-600 dark:text-lavender-400"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <Icon size={15} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-lavender-500 dark:bg-lavender-400"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <OverviewTab trip={trip as Trip} tripCountries={tripCountries} />
            )}

            {/* COUNTRIES */}
            {activeTab === "countries" && <CountriesTab trip={trip as Trip} />}

            {/* DESTINATIONS (CITIES/TOWNS) */}
            {activeTab === "destinations" && (
              <DestinationsTab tripId={id} tripCountries={tripCountries} />
            )}

            {/* FLIGHTS */}
            {activeTab === "flights" && (
              <FlightsTab
                tripId={id}
                tripCountries={tripCountries}
                tripStartDate={trip.startDate}
                tripEndDate={trip.endDate}
              />
            )}

            {/* ACCOMMODATIONS */}
            {activeTab === "accommodations" && (
              <AccommodationsTab
                tripId={id}
                tripCountries={tripCountries}
                tripStartDate={trip.startDate}
                tripEndDate={trip.endDate}
              />
            )}

            {/* ACTIVITIES */}
            {activeTab === "activities" && (
              <ActivitiesTab
                tripId={id}
                tripCountries={tripCountries}
                destinations={destinations}
                tripStartDate={trip.startDate}
                tripEndDate={trip.endDate}
              />
            )}

            {/* PLANNER */}
            {activeTab === "planner" && (
              <div>
                <div className="mb-4">
                  <h2 className="font-semibold text-text-primary">Trip Planner</h2>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Drag activities between days to reorganize your itinerary.
                  </p>
                </div>
                <PlannerTab
                  flights={flights}
                  accommodations={accommodations}
                  activities={activities}
                  tripStartDate={trip.startDate}
                  tripEndDate={trip.endDate}
                />
              </div>
            )}

            {/* NOTES */}
            {activeTab === "notes" && (
              <div>
                <div className="mb-4">
                  <h2 className="font-semibold text-text-primary">Notes & Tips</h2>
                </div>
                <NotesTab tripId={id} />
              </div>
            )}

            {/* DOCUMENTS */}
            {activeTab === "documents" && (
              <div>
                <div className="mb-4">
                  <h2 className="font-semibold text-text-primary">Documents</h2>
                </div>
                <DocumentsTab tripId={id} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
