import { useState, useEffect } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { supabase } from "@/lib/supabase";
import { BrochureDocument } from "./BrochureDocument";
import { Button } from "@/components/ui/Button";
import { Check, Download, FileText, Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Trip,
  TripCountryRow,
  Flight,
  FlightRow,
  Accommodation,
  AccommodationRow,
  Activity,
  ActivityRow,
} from "@/db/types";

export function BrochurePage() {
  const [trips, setTrips] = useState<Trip[] | undefined>(undefined);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [tripData, setTripData] = useState<{
    trip: Trip;
    flights: Flight[];
    accommodations: Accommodation[];
    activities: Activity[];
    note?: string;
  } | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Load all trips for the sidebar
  useEffect(() => {
    async function fetchTrips() {
      const { data } = await supabase
        .from("trips")
        .select("*, trip_countries(*)")
        .order("created_at", { ascending: false });
      if (data) {
        setTrips(
          data.map((d) => ({
            ...d,
            startDate: d.start_date,
            endDate: d.end_date,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            tripCountries: (d.trip_countries || []).map((tc: TripCountryRow) => ({
              ...tc,
              tripId: tc.trip_id,
              countryName: tc.country_name,
              countryCode: tc.country_code,
              budgetLimit: tc.budget_limit,
              createdAt: tc.created_at,
            })),
            coverImage: d.cover_image,
          })) as Trip[],
        );
      } else {
        setTrips([]);
      }
    }
    fetchTrips();
  }, []);

  // Load associated trip data when a trip is selected
  useEffect(() => {
    async function loadData() {
      if (!selectedTripId) {
        setTripData(null);
        return;
      }

      setLoadingPdf(true);

      try {
        const [tripRes, flightsRes, accRes, actRes, notesRes] = await Promise.all([
          supabase.from("trips").select("*, trip_countries(*)").eq("id", selectedTripId).single(),
          supabase
            .from("flights")
            .select("*")
            .eq("trip_id", selectedTripId)
            .order("departure_time", { ascending: true }),
          supabase
            .from("accommodations")
            .select("*")
            .eq("trip_id", selectedTripId)
            .order("check_in", { ascending: true }),
          supabase
            .from("activities")
            .select("*")
            .eq("trip_id", selectedTripId)
            .order("date", { ascending: true }),
          supabase.from("notes").select("*").eq("trip_id", selectedTripId).maybeSingle(),
        ]);

        if (tripRes.data) {
          const trip = {
            ...tripRes.data,
            startDate: tripRes.data.start_date,
            endDate: tripRes.data.end_date,
            createdAt: tripRes.data.created_at,
            updatedAt: tripRes.data.updated_at,
            tripCountries: (tripRes.data.trip_countries || []).map((tc: TripCountryRow) => ({
              ...tc,
              tripId: tc.trip_id,
              countryName: tc.country_name,
              countryCode: tc.country_code,
              budgetLimit: tc.budget_limit,
              createdAt: tc.created_at,
            })),
            coverImage: tripRes.data.cover_image,
          } as Trip;

          const flights = (flightsRes.data as FlightRow[] || []).map((f) => ({
            ...f,
            tripId: f.trip_id,
            tripCountryId: f.trip_country_id,
            isConfirmed: f.is_confirmed,
            bookingLink: f.booking_link,
            createdAt: f.created_at,
          })) as Flight[];

          const accommodations = (accRes.data as AccommodationRow[] || []).map((a) => ({
            ...a,
            tripId: a.trip_id,
            tripCountryId: a.trip_country_id,
            checkIn: a.check_in,
            checkOut: a.check_out,
            checkInAfter: a.check_in_after,
            checkOutBefore: a.check_out_before,
            bookingLink: a.booking_link,
            isConfirmed: a.is_confirmed,
            createdAt: a.created_at,
          })) as Accommodation[];

          const activities = (actRes.data as ActivityRow[] || []).map((a) => ({
            ...a,
            tripId: a.trip_id,
            tripCountryId: a.trip_country_id,
            destinationId: a.destination_id,
            isConfirmed: a.is_confirmed,
            createdAt: a.created_at,
          })) as Activity[];

          setTripData({
            trip,
            flights,
            accommodations,
            activities,
            note: notesRes.data?.content,
          });
        }
      } catch (err) {
        console.error("Failed to load PDF data", err);
      } finally {
        setLoadingPdf(false);
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
                        {trip.tripCountries?.map((tc) => tc.countryName).join(", ") ||
                          "No countries"}
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
