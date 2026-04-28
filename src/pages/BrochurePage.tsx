import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { BrochureDocument } from "@/components/brochure/BrochureDocument";
import { Button } from "@/components/ui/Button";
import { Check, Download, FileText, Loader2, RefreshCw, ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";

import { useTrips, useTrip } from "@/hooks/useTrips";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { useDestinations } from "@/hooks/useDestinations";
import { useDocuments } from "@/hooks/useDocuments";
import { useNotes } from "@/hooks/useNotes";
import { VisaDocument } from "@/components/brochure/VisaDocument";
import { FileCheck, Image as ImageIcon, User, Map as MapIcon, Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";

export function BrochurePage() {
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);

  const { trips, loading: tripsLoading } = useTrips();
  const { trip, isLoading: tripLoading } = useTrip(selectedTripId || undefined);

  const tripIdNum = selectedTripId || 0;
  const { flights, isLoading: flightsLoading } = useFlights(tripIdNum);
  const { accommodations, isLoading: accommodationsLoading } = useAccommodations(tripIdNum);
  const { activities, isLoading: activitiesLoading } = useActivities(tripIdNum);
  const { destinations, isLoading: destinationsLoading } = useDestinations(tripIdNum);
  const { documents, isLoading: documentsLoading } = useDocuments(tripIdNum);
  const { note: tripNote, isLoading: notesLoading } = useNotes(tripIdNum);

  const [mode, setMode] = useState<"brochure" | "visa">("brochure");
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    passportNumber: "",
    nationality: "",
    address: "",
    purpose: "Tourism / Vacation",
  });
  const [savedPersonalInfo, setSavedPersonalInfo] = useState({
    fullName: "",
    passportNumber: "",
    nationality: "",
    address: "",
    purpose: "Tourism / Vacation",
  });

  const loadingPdf =
    selectedTripId !== null &&
    (tripLoading ||
      flightsLoading ||
      accommodationsLoading ||
      activitiesLoading ||
      destinationsLoading ||
      documentsLoading ||
      notesLoading);

  const tripData = useMemo(() => {
    if (!trip) return null;
    return {
      trip,
      flights,
      accommodations,
      activities,
      destinations,
      documents,
      notes: tripNote ? [tripNote] : [],
    };
  }, [trip, flights, accommodations, activities, destinations, documents, tripNote]);

  if (tripsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-2 p-4 sm:p-6 h-full overflow-hidden">
      <div
        className={cn("flex items-center gap-3 mb-4 sm:mb-8", selectedTripId && "hidden sm:flex")}
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Create Brochure</h1>
          <p className="text-sm text-text-secondary hidden sm:block">
            Generate a PDF travel brochure from your trips
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-4 sm:gap-6 min-h-0">
        {/* Left Side: Selecting Trips & Configuration */}
        <div
          className={cn("w-full lg:w-1/3 flex flex-col gap-4", selectedTripId && "hidden lg:flex")}
        >
          <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-black text-text-primary mb-4 flex items-center gap-2">
              <MapIcon size={18} className="text-lavender-500" />
              Select Trip
            </h2>
            <div className="space-y-2">
              {trips.length === 0 ? (
                <div className="text-center py-8 text-text-secondary bg-surface-2 rounded-xl border border-dashed border-border">
                  No trips found.
                </div>
              ) : (
                trips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => setSelectedTripId(trip.id!)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      selectedTripId === trip.id
                        ? "border-lavender-500 bg-lavender-50/50 dark:bg-lavender-900/10 ring-1 ring-lavender-500 shadow-sm"
                        : "border-border hover:border-lavender-300 hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-text-primary">{trip.name}</span>
                      {selectedTripId === trip.id && (
                        <div className="w-5 h-5 rounded-full bg-lavender-500 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      <span>{new Date(trip.startDate).getFullYear()}</span>
                      <span>•</span>
                      <span className="truncate">
                        {trip.tripCountries?.map((tc) => tc.countryName).join(", ") ||
                          "No countries"}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedTripId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-6"
            >
              <div>
                <h2 className="text-lg font-black text-text-primary mb-4 flex items-center gap-2">
                  <RefreshCw size={18} className="text-sky-pastel-500" />
                  Document Type
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode("brochure")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                      mode === "brochure"
                        ? "border-lavender-500 bg-lavender-50 dark:bg-lavender-900/10 text-lavender-600"
                        : "border-border hover:bg-surface-2 text-text-muted",
                    )}
                  >
                    <ImageIcon size={24} />
                    <span className="text-xs font-bold uppercase tracking-tight">Brochure</span>
                  </button>
                  <button
                    onClick={() => setMode("visa")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                      mode === "visa"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600"
                        : "border-border hover:bg-surface-2 text-text-muted",
                    )}
                  >
                    <FileCheck size={24} />
                    <span className="text-xs font-bold uppercase tracking-tight">Visa Export</span>
                  </button>
                </div>
              </div>

              {mode === "visa" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-4 border-t border-border"
                >
                  <h3 className="text-sm font-black text-text-primary flex items-center gap-2">
                    <User size={14} className="text-emerald-500" />
                    Applicant Details
                  </h3>
                  <div className="space-y-3">
                    <Input
                      label="Full Name" //
                      value={personalInfo.fullName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, fullName: e.target.value })
                      }
                      placeholder="As per passport"
                      className="text-xs"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Passport #"
                        value={personalInfo.passportNumber}
                        onChange={(e) =>
                          setPersonalInfo({ ...personalInfo, passportNumber: e.target.value })
                        }
                        className="text-xs"
                      />
                      <Input
                        label="Nationality"
                        value={personalInfo.nationality}
                        onChange={(e) =>
                          setPersonalInfo({ ...personalInfo, nationality: e.target.value })
                        }
                        className="text-xs"
                      />
                    </div>
                    <Input
                      label="Purpose"
                      value={personalInfo.purpose}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, purpose: e.target.value })
                      }
                      className="text-xs"
                    />
                    <Textarea
                      label="Home Address"
                      value={personalInfo.address}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, address: e.target.value })
                      }
                      className="text-xs h-20"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSavedPersonalInfo(personalInfo);
                    }}
                  >
                    <Save size={14} />
                    Save Details
                  </Button>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800 flex gap-2">
                    <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-tight">
                      These details are required for a valid visa itinerary. They are not saved and
                      only exist for this session.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Side: Preview & Download */}
        <div
          className={`w-full h-full flex flex-col gap-4 ${!selectedTripId ? "lg:w-2/3" : "w-full"}`}
        >
          {!selectedTripId ? (
            <div className="bg-surface rounded-xl p-12 border border-border flex flex-col items-center justify-center text-center h-[500px]">
              <div className="w-16 h-16 rounded-full bg-surface-3 flex items-center justify-center mb-4">
                <FileText className="text-text-muted" size={32} />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">No Trip Selected</h3>
              <p className="text-text-secondary max-w-sm">
                Select a trip from the list to preview and generate a beautiful travel brochure PDF.
              </p>
            </div>
          ) : loadingPdf || !tripData ? (
            <div className="bg-surface rounded-xl p-12 border border-border flex flex-col items-center justify-center h-[500px]">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-text-secondary">Preparing document...</p>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm">
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSelectedTripId(null)}
                    title="Change Trip"
                    className="lg:hidden"
                  >
                    <ArrowLeft size={18} />
                  </Button>
                  <div className="flex flex-col">
                    <h3 className="font-black text-text-primary leading-tight">
                      {mode === "brochure" ? "Travel Brochure" : "Visa Itinerary"}
                    </h3>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      Previewing: {tripData.trip.name}
                    </p>
                  </div>
                </div>
                <PDFDownloadLink
                  document={
                    mode === "brochure" ? (
                      <BrochureDocument {...tripData} />
                    ) : (
                      <VisaDocument {...tripData} personalInfo={savedPersonalInfo} />
                    )
                  }
                  fileName={
                    mode === "brochure"
                      ? `Wanderplan-${tripData.trip.name.replace(/\s+/g, "-")}-Brochure.pdf`
                      : `Visa-Itinerary-${savedPersonalInfo.fullName.replace(/\s+/g, "-") || "Wanderplan"}.pdf`
                  }
                >
                  {({ loading }) => (
                    <Button
                      variant={mode === "brochure" ? "primary" : "success"}
                      disabled={loading}
                      className="rounded-xl shadow-lg shadow-lavender-500/10"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download size={16} className="mr-2" />
                          Export PDF
                        </>
                      )}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>
              <div className="flex-1 bg-surface-3 relative">
                <PDFViewer width="100%" height="100%" className="border-none">
                  {mode === "brochure" ? (
                    <BrochureDocument {...tripData} />
                  ) : (
                    <VisaDocument {...tripData} personalInfo={savedPersonalInfo} />
                  )}
                </PDFViewer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
