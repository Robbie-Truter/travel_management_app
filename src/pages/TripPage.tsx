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
  Plus,
  BarChart2,
  MapPin,
  LayoutGrid,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge, statusLabels } from "@/components/ui/Badge";
import { useTrip } from "@/hooks/useTrips";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { FlightCard, FlightForm, FlightComparison } from "@/components/flights/FlightComponents";
import {
  AccommodationCard,
  AccommodationForm,
  AccommodationComparison,
} from "@/components/accommodations/AccommodationComponents";
import { ActivityCard, ActivityForm } from "@/components/activities/ActivityComponents";
import { PlannerTimeline } from "@/components/planner/PlannerTimeline";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { TripOverview } from "@/components/overview/TripOverview";
import { formatDate, tripDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Flight, Accommodation, Activity, Trip, TripStatus } from "@/db/types";
import { DocumentUpload } from "@/components/documents/DocumentsPage";

type Tab =
  | "overview"
  | "flights"
  | "accommodations"
  | "activities"
  | "planner"
  | "notes"
  | "documents";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
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
  const trip = useTrip(id);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Flights
  const { flights, addFlight, updateFlight, deleteFlight, confirmFlight } = useFlights(id);
  const [flightFormOpen, setFlightFormOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | undefined>();
  const [flightCompareOpen, setFlightCompareOpen] = useState(false);

  // Accommodations
  const {
    accommodations,
    addAccommodation,
    updateAccommodation,
    deleteAccommodation,
    confirmAccommodation,
  } = useAccommodations(id);
  const [accFormOpen, setAccFormOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Accommodation | undefined>();
  const [accCompareOpen, setAccCompareOpen] = useState(false);

  // Activities
  const { activities, addActivity, updateActivity, deleteActivity, reorderActivities } =
    useActivities(id);
  const [actFormOpen, setActFormOpen] = useState(false);
  const [editingAct, setEditingAct] = useState<Activity | undefined>();

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
          <div className="absolute inset-0 bg-linear-to-br from-sage-200 to-sky-pastel-200 dark:from-sage-900/50 dark:to-sky-pastel-900/50" />
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
                {trip.destination}
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
          className="flex overflow-x-auto px-4"
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
              <TripOverview
                trip={trip as Trip}
                flights={flights}
                accommodations={accommodations}
                activities={activities}
              />
            )}

            {/* FLIGHTS */}
            {activeTab === "flights" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-text-primary">
                    Flights{" "}
                    <span className="text-text-muted font-normal text-sm">({flights.length})</span>
                  </h2>
                  <div className="flex gap-2">
                    {flights.length >= 2 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setFlightCompareOpen(true)}
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
                        setFlightFormOpen(true);
                      }}
                    >
                      <Plus size={14} />
                      Add Flight
                    </Button>
                  </div>
                </div>
                {flights.length === 0 ? (
                  <EmptyState
                    icon={Plane}
                    label="No flights yet"
                    action={() => setFlightFormOpen(true)}
                    actionLabel="Add Flight"
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <AnimatePresence>
                      {flights.map((f) => (
                        <FlightCard
                          key={f.id}
                          flight={f}
                          onEdit={(fl: Flight) => {
                            setEditingFlight(fl);
                            setFlightFormOpen(true);
                          }}
                          onDelete={deleteFlight}
                          onConfirm={confirmFlight}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                <FlightForm
                  key={editingFlight?.id ?? "new"}
                  open={flightFormOpen}
                  onClose={() => {
                    setFlightFormOpen(false);
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
                  tripId={id}
                />
                <FlightComparison
                  open={flightCompareOpen}
                  onClose={() => setFlightCompareOpen(false)}
                  flights={flights}
                />
              </div>
            )}

            {/* ACCOMMODATIONS */}
            {activeTab === "accommodations" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-text-primary">
                    Accommodations{" "}
                    <span className="text-text-muted font-normal text-sm">
                      ({accommodations.length})
                    </span>
                  </h2>
                  <div className="flex gap-2">
                    {accommodations.length >= 2 && (
                      <Button variant="secondary" size="sm" onClick={() => setAccCompareOpen(true)}>
                        <BarChart2 size={14} />
                        Compare
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setEditingAcc(undefined);
                        setAccFormOpen(true);
                      }}
                    >
                      <Plus size={14} />
                      Add Stay
                    </Button>
                  </div>
                </div>
                {accommodations.length === 0 ? (
                  <EmptyState
                    icon={Hotel}
                    label="No accommodations yet"
                    action={() => setAccFormOpen(true)}
                    actionLabel="Add Stay"
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <AnimatePresence>
                      {accommodations.map((a) => (
                        <AccommodationCard
                          key={a.id}
                          acc={a}
                          onEdit={(ac: Accommodation) => {
                            setEditingAcc(ac);
                            setAccFormOpen(true);
                          }}
                          onDelete={deleteAccommodation}
                          onConfirm={confirmAccommodation}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                <AccommodationForm
                  key={editingAcc?.id ?? "new"}
                  open={accFormOpen}
                  onClose={() => {
                    setAccFormOpen(false);
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
                  tripId={id}
                />
                <AccommodationComparison
                  open={accCompareOpen}
                  onClose={() => setAccCompareOpen(false)}
                  accommodations={accommodations}
                />
              </div>
            )}

            {/* ACTIVITIES */}
            {activeTab === "activities" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-text-primary">
                    Activities{" "}
                    <span className="text-text-muted font-normal text-sm">
                      ({activities.length})
                    </span>
                  </h2>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingAct(undefined);
                      setActFormOpen(true);
                    }}
                  >
                    <Plus size={14} />
                    Add Activity
                  </Button>
                </div>
                {activities.length === 0 ? (
                  <EmptyState
                    icon={Compass}
                    label="No activities yet"
                    action={() => setActFormOpen(true)}
                    actionLabel="Add Activity"
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <AnimatePresence>
                      {activities.map((a) => (
                        <ActivityCard
                          key={a.id}
                          activity={a}
                          onEdit={(act: Activity) => {
                            setEditingAct(act);
                            setActFormOpen(true);
                          }}
                          onDelete={deleteActivity}
                          onConfirm={(id) => updateActivity(id, { isConfirmed: true })}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                <ActivityForm
                  key={editingAct?.id ?? "new"}
                  open={actFormOpen}
                  onClose={() => {
                    setActFormOpen(false);
                    setEditingAct(undefined);
                  }}
                  onSave={
                    editingAct?.id
                      ? async (data) => {
                          await updateActivity(editingAct.id!, data);
                        }
                      : addActivity
                  }
                  initial={editingAct}
                  tripId={id}
                />
              </div>
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
                <PlannerTimeline
                  flights={flights}
                  accommodations={accommodations}
                  activities={activities}
                  tripStartDate={trip.startDate}
                  tripEndDate={trip.endDate}
                  onReorderActivities={reorderActivities}
                />
              </div>
            )}

            {/* NOTES */}
            {activeTab === "notes" && (
              <div>
                <div className="mb-4">
                  <h2 className="font-semibold text-text-primary">Notes & Tips</h2>
                </div>
                <NoteEditor tripId={id} />
              </div>
            )}

            {/* DOCUMENTS */}
            {activeTab === "documents" && (
              <div>
                <div className="mb-4">
                  <h2 className="font-semibold text-text-primary">Documents</h2>
                </div>
                <DocumentUpload tripId={id} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  label,
  action,
  actionLabel,
}: {
  icon: React.ElementType;
  label: string;
  action: () => void;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-3 flex items-center justify-center mb-3">
        <Icon size={24} className="text-text-muted" />
      </div>
      <p className="text-sm text-text-secondary mb-4">{label}</p>
      <Button variant="primary" size="sm" onClick={action}>
        <Plus size={14} />
        {actionLabel}
      </Button>
    </div>
  );
}
