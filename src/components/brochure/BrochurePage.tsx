import { useState, useEffect } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { BrochureDocument } from "./BrochureDocument";
import { Button } from "@/components/ui/Button";
import { Check, Download, FileText, Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Trip, Flight, Accommodation, Activity } from "@/db/types";

export function BrochurePage() {
  const trips = useLiveQuery(() => db.trips.orderBy("createdAt").reverse().toArray(), []);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [tripData, setTripData] = useState<{
    trip: Trip;
    flights: Flight[];
    accommodations: Accommodation[];
    activities: Activity[];
    note?: string;
  } | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Load associated trip data when a trip is selected
  useEffect(() => {
    async function loadData() {
      if (selectedTripId) {
        setLoadingPdf(true);
        const trip = await db.trips.get(selectedTripId);
        if (trip) {
          const flights = await db.flights.where("tripId").equals(selectedTripId).toArray();
          const accommodations = await db.accommodations
            .where("tripId")
            .equals(selectedTripId)
            .toArray();
          const activities = await db.activities.where("tripId").equals(selectedTripId).toArray();
          const note = await db.notes.where("tripId").equals(selectedTripId).first();
          setTripData({ trip, flights, accommodations, activities, note: note?.content });
        }
        setLoadingPdf(false);
      } else {
        setTripData(null);
      }
    }
    loadData();
  }, [selectedTripId]);

  if (trips === undefined) {
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
        {/* Left Side: Selecting Trips */}
        {!selectedTripId && (
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div className="bg-surface rounded-xl p-5 border border-border">
              <h2 className="text-lg font-semibold mb-4">Select a Trip</h2>
              <div className="space-y-3">
                {trips.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    No trips found. Create a trip first!
                  </div>
                ) : (
                  trips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id!)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedTripId === trip.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-surface-3"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-text-primary">{trip.name}</span>
                        {selectedTripId === trip.id && <Check size={16} className="text-primary" />}
                      </div>
                      <span className="text-xs text-text-secondary line-clamp-1">
                        {trip.destinations.join(", ")}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

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
            <div className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface-2">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSelectedTripId(null)}
                    title="Change Trip"
                  >
                    <ArrowLeft size={18} />
                  </Button>
                  <h3 className="font-semibold text-text-primary underline decoration-primary decoration-2 underline-offset-4">
                    PDF Preview: {tripData.trip.name}
                  </h3>
                </div>
                <PDFDownloadLink
                  document={<BrochureDocument {...tripData} />}
                  fileName={`Wanderplan-${tripData.trip.name.replace(/\s+/g, "-")}-Brochure.pdf`}
                >
                  {({ loading }) => (
                    <Button variant="primary" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download size={16} className="mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>
              <div className="flex-1 bg-surface-3">
                <PDFViewer width="100%" height="100%" className="border-none">
                  <BrochureDocument {...tripData} />
                </PDFViewer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
