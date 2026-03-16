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
  Filter,
  X,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge, statusLabels } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useTrip } from "@/hooks/useTrips";
import { useDestinations } from "@/hooks/useDestinations";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { FlightCard, FlightForm, FlightComparison } from "@/components/flights/FlightComponents";
import {
  AccommodationCard,
  AccommodationForm,
  AccommodationComparison,
} from "@/components/accommodations/AccommodationComponents";
import { DestinationCard, DestinationForm } from "@/components/destinations/DestinationComponents";
import { ActivityCard, ActivityForm } from "@/components/activities/ActivityComponents";
import { ACTIVITY_TAGS } from "@/components/activities/activity-types";
import { PlannerTimeline } from "@/components/planner/PlannerTimeline";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { TripOverview } from "@/components/overview/TripOverview";
import { TripDestinations } from "@/components/trips/TripDestinations";
import { formatDate, tripDuration, getCountryFlag } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Flight, Accommodation, Activity, Trip, TripStatus, Destination } from "@/db/types";
import { DocumentUpload } from "@/components/documents/DocumentsPage";

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
  const trip = useTrip(id);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Destinations
  const { destinations, addDestination, updateDestination, deleteDestination } =
    useDestinations(id);
  const [destFormOpen, setDestFormOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | undefined>();

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
  const { activities, addActivity, updateActivity, deleteActivity } = useActivities(id);
  const [actFormOpen, setActFormOpen] = useState(false);
  const [editingAct, setEditingAct] = useState<Activity | undefined>();

  // Activity Filters
  const [actFilterName, setActFilterName] = useState("");
  const [actFilterCity, setActFilterCity] = useState("all");
  const [actFilterType, setActFilterType] = useState<string>("all");
  const [actFilterDate, setActFilterDate] = useState("");

  const filteredActivities = activities.filter((a) => {
    const matchesName =
      !actFilterName || a.name.toLowerCase().includes(actFilterName.toLowerCase());

    const matchesCity = actFilterCity === "all" || a.destinationId?.toString() === actFilterCity;
    const matchesType = actFilterType === "all" || a.type === actFilterType;
    const matchesDate = !actFilterDate || a.date === actFilterDate;

    return matchesName && matchesCity && matchesType && matchesDate;
  });

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
                {trip.destinations?.length > 0 ? trip.destinations.join(", ") : "No destinations"}
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

            {/* DESTINATIONS (managed in Overview/Separate) */}
            {activeTab === "countries" && (
              <div className="p-4 bg-surface border border-border rounded-xl">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-lavender-500" />
                  Trip Countries
                </h2>
                <p className="text-sm text-text-secondary mb-6">
                  Manage the countries you'll be visiting during this trip.
                </p>
                {/* We will pass a specific prop to TripOverview or handle it here */}
                {/* For now, let's keep it in Overview as requested, but maybe a dedicated component is better */}
                <TripDestinations
                  trip={trip as Trip}
                  destinations={destinations}
                  flights={flights}
                  accommodations={accommodations}
                  activities={activities}
                />
              </div>
            )}

            {/* DESTINATIONS (CITIES/TOWNS) */}
            {activeTab === "destinations" && (
              <div className="p-4 bg-surface border border-border rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <MapPin size={20} className="text-lavender-500" />
                    Destinations{" "}
                    <span className="text-text-muted font-normal text-sm">
                      ({destinations.length})
                    </span>
                  </h2>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingDest(undefined);
                      setDestFormOpen(true);
                    }}
                  >
                    <Plus size={14} />
                    Add Destination
                  </Button>
                </div>
                <p className="text-sm text-text-secondary mb-6">
                  Manage the cities and towns you'll be visiting during this trip.
                </p>
                {destinations.length === 0 ? (
                  <EmptyState
                    icon={MapPin}
                    label="No destinations yet"
                    action={() => setDestFormOpen(true)}
                    actionLabel="Add Destination"
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <AnimatePresence>
                      {destinations.map((d) => (
                        <DestinationCard
                          key={d.id}
                          destination={d}
                          onEdit={(dest) => {
                            setEditingDest(dest);
                            setDestFormOpen(true);
                          }}
                          onDelete={deleteDestination}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                <DestinationForm
                  key={editingDest?.id ?? "new"}
                  open={destFormOpen}
                  onClose={() => {
                    setDestFormOpen(false);
                    setEditingDest(undefined);
                  }}
                  onSave={
                    editingDest?.id
                      ? async (data) => {
                          await updateDestination(editingDest.id!, data);
                        }
                      : addDestination
                  }
                  initial={editingDest}
                  tripId={id}
                  availableCountries={trip.destinations}
                />
              </div>
            )}

            {/* FLIGHTS */}
            {activeTab === "flights" && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-bold text-xl text-text-primary tracking-tight">
                    Flights{" "}
                    <span className="text-text-muted font-normal text-sm ml-2">
                      ({flights.length} total)
                    </span>
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
                  <div className="space-y-12 max-w-4xl mx-auto">
                    {(trip.destinations || []).map((country) => {
                      const countryFlights = flights.filter((f) => f.country === country);
                      if (countryFlights.length === 0) return null;

                      return (
                        <div key={country} className="space-y-6">
                          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                            <span className="text-2xl" role="img" aria-label={country}>
                              {getCountryFlag(country as string)}
                            </span>
                            <div>
                              <h3 className="font-bold text-lg text-text-primary">{country}</h3>
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
                                    setFlightFormOpen(true);
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
                        (f) => f.country && !trip.destinations?.includes(f.country),
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
                                    setFlightFormOpen(true);
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
                  destinations={trip.destinations}
                  lastFlight={flights[flights.length - 1]}
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
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-bold text-xl text-text-primary tracking-tight">
                    Accommodations{" "}
                    <span className="text-text-muted font-normal text-sm ml-2">
                      ({accommodations.length} total)
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
                  <div className="space-y-12 max-w-4xl mx-auto">
                    {(trip.destinations || []).map((country) => {
                      const countryAccs = accommodations.filter((a) => a.country === country);
                      if (countryAccs.length === 0) return null;

                      return (
                        <div key={country} className="space-y-6">
                          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                            <span className="text-2xl" role="img" aria-label={country}>
                              {getCountryFlag(country as string)}
                            </span>
                            <div>
                              <h3 className="font-bold text-lg text-text-primary">{country}</h3>
                              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                                {countryAccs.length} {countryAccs.length === 1 ? "Stay" : "Stays"}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-6">
                            <AnimatePresence mode="popLayout">
                              {countryAccs.map((a) => (
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
                        </div>
                      );
                    })}
                    {/* Fallback for items with no country or different country */}
                    {(() => {
                      const otherAccs = accommodations.filter(
                        (a) => a.country && !trip.destinations?.includes(a.country),
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
                          <div className="flex flex-col gap-6">
                            <AnimatePresence mode="popLayout">
                              {otherAccs.map((a) => (
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
                        </div>
                      );
                    })()}
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
                  destinations={trip.destinations}
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
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h2 className="font-bold text-xl text-text-primary whitespace-nowrap">
                      Activities{" "}
                      <span className="text-text-muted font-normal text-sm ml-2">
                        ({filteredActivities.length} of {activities.length})
                      </span>
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
                      <div className="w-full sm:w-auto min-w-[160px]">
                        <Input
                          id="act-name-filter"
                          placeholder="Search..."
                          value={actFilterName}
                          onChange={(e) => setActFilterName(e.target.value)}
                          className="bg-surface h-9 text-sm"
                        />
                      </div>
                      <div className="w-full sm:w-auto min-w-[160px]">
                        <SearchableSelect
                          id="act-city-filter"
                          placeholder="All Cities"
                          value={actFilterCity}
                          options={[
                            { value: "all", label: "All Cities", icon: <MapPin size={14} /> },
                            ...destinations.map((d) => ({
                              value: d.id!.toString(),
                              label: `${d.name}`,
                              icon: <span>{getCountryFlag(d.country)}</span>,
                            })),
                          ]}
                          onChange={(val: string) => setActFilterCity(val)}
                          includeSearch={true}
                          className="h-9"
                        />
                      </div>
                      <div className="w-full sm:w-auto min-w-[160px]">
                        <SearchableSelect
                          id="act-type-filter"
                          placeholder="All Types"
                          value={actFilterType}
                          options={[
                            { value: "all", label: "All Types", icon: <Filter size={14} /> },
                            ...ACTIVITY_TAGS.map((t) => ({
                              value: t.value,
                              label: t.label,
                              icon: <span>{t.icon}</span>,
                            })),
                          ]}
                          onChange={(val: string) => setActFilterType(val)}
                          includeSearch={false}
                          className="h-9"
                        />
                      </div>

                      {(actFilterName ||
                        actFilterCity !== "all" ||
                        actFilterType !== "all" ||
                        actFilterDate) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActFilterName("");
                            setActFilterCity("all");
                            setActFilterType("all");
                            setActFilterDate("");
                          }}
                          className="h-9 text-text-muted hover:text-rose-pastel-500 px-2"
                        >
                          <X size={14} />
                        </Button>
                      )}

                      <div className="h-6 w-px bg-border mx-1 hidden lg:block" />

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setEditingAct(undefined);
                          setActFormOpen(true);
                        }}
                        className="h-9"
                      >
                        <Plus size={14} />
                        Add Activity
                      </Button>
                    </div>
                  </div>
                </div>

                {filteredActivities.length === 0 ? (
                  <EmptyState
                    icon={Compass}
                    label={
                      activities.length === 0
                        ? "No activities yet"
                        : "No activities match your filters"
                    }
                    action={
                      activities.length === 0
                        ? () => setActFormOpen(true)
                        : () => {
                            setActFilterName("");
                            setActFilterCity("all");
                            setActFilterType("all");
                            setActFilterDate("");
                          }
                    }
                    actionLabel={activities.length === 0 ? "Add Activity" : "Clear Filters"}
                  />
                ) : (
                  <div className="space-y-12 max-w-4xl mx-auto">
                    {(trip.destinations || []).map((country) => {
                      const countryActivities = filteredActivities.filter((a) => a.country === country);
                      if (countryActivities.length === 0) return null;

                      return (
                        <div key={country} className="space-y-6">
                          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                            <span className="text-2xl" role="img" aria-label={country}>
                              {getCountryFlag(country as string)}
                            </span>
                            <div>
                              <h3 className="font-bold text-lg text-text-primary">{country}</h3>
                              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                                {countryActivities.length} {countryActivities.length === 1 ? "Activity" : "Activities"}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-6">
                            <AnimatePresence mode="popLayout">
                              {countryActivities.map((a) => (
                                <ActivityCard
                                  key={a.id}
                                  activity={a}
                                  destinationName={destinations.find((d) => d.id === a.destinationId)?.name}
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
                        </div>
                      );
                    })}
                    {/* Fallback for items with no country or different country */}
                    {(() => {
                      const otherActivities = filteredActivities.filter(
                        (a) => a.country && !trip.destinations?.includes(a.country),
                      );
                      if (otherActivities.length === 0) return null;
                      return (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                            <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center">
                              <Compass size={16} className="text-text-muted" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-text-primary">Other Locations</h3>
                              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                                {otherActivities.length} {otherActivities.length === 1 ? "Activity" : "Activities"}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-6">
                            <AnimatePresence mode="popLayout">
                              {otherActivities.map((a) => (
                                <ActivityCard
                                  key={a.id}
                                  activity={a}
                                  destinationName={destinations.find((d) => d.id === a.destinationId)?.name}
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
                        </div>
                      );
                    })()}
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
                  destinations={trip.destinations}
                  allDestinations={destinations}
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
