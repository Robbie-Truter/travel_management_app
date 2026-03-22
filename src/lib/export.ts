import { supabase } from "@/lib/supabase";
import type { Trip, Flight, Accommodation, Activity, Note } from "@/db/types";

export async function exportTripAsJSON(tripId: number): Promise<void> {
  const { data: tripData, error: tripError } = await supabase.from("trips").select("*").eq("id", tripId).single();
  if (tripError || !tripData) throw new Error("Trip not found");

  const [flightsRes, accommodationsRes, activitiesRes, notesRes] = await Promise.all([
    supabase.from("flights").select("*").eq("trip_id", tripId),
    supabase.from("accommodations").select("*").eq("trip_id", tripId),
    supabase.from("activities").select("*").eq("trip_id", tripId),
    supabase.from("notes").select("*").eq("trip_id", tripId),
  ]);

  const trip: Trip = {
    ...tripData,
    startDate: tripData.start_date,
    endDate: tripData.end_date,
    createdAt: tripData.created_at,
    updatedAt: tripData.updated_at,
    coverImage: tripData.cover_image
  };

  const flights = (flightsRes.data || []).map(f => ({
    ...f, tripId: f.trip_id, isConfirmed: f.is_confirmed, bookingLink: f.booking_link, createdAt: f.created_at
  }));
  const accommodations = (accommodationsRes.data || []).map(a => ({
    ...a, tripId: a.trip_id, checkIn: a.check_in, checkOut: a.check_out, checkInAfter: a.check_in_after, checkOutBefore: a.check_out_before, bookingLink: a.booking_link, isConfirmed: a.is_confirmed, createdAt: a.created_at
  }));
  const activities = (activitiesRes.data || []).map(a => ({
    ...a, tripId: a.trip_id, destinationId: a.destination_id, isConfirmed: a.is_confirmed, createdAt: a.created_at
  }));
  const notes = (notesRes.data || []).map(n => ({
    ...n, tripId: n.trip_id, updatedAt: n.updated_at
  }));

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    trip,
    flights,
    accommodations,
    activities,
    notes,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${trip.name.replace(/\s+/g, "_")}_export.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importTripFromJSON(file: File): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const text = await file.text();
  const data = JSON.parse(text);

  if (!data.version || !data.trip) {
    throw new Error("Invalid export file format");
  }

  const { trip, flights, accommodations, activities, notes } = data as {
    trip: Trip;
    flights: Flight[];
    accommodations: Accommodation[];
    activities: Activity[];
    notes: Note[];
  };

  const now = new Date().toISOString();

  // 1. Insert Trip
  const dbTrip = {
    user_id: user.id,
    name: `${trip.name} (imported)`,
    destinations: trip.destinations,
    start_date: trip.startDate,
    end_date: trip.endDate,
    status: trip.status || "planning",
    description: trip.description,
    budget: trip.budget,
    cover_image: trip.coverImage,
    created_at: now,
    updated_at: now
  };

  const { data: newTrip, error: tripErr } = await supabase.from("trips").insert([dbTrip]).select().single();
  if (tripErr || !newTrip) throw tripErr;

  const newTripId = newTrip.id;

  // 2. Prepare relational data
  const dbFlights = flights.map(f => ({
    user_id: user.id,
    trip_id: newTripId,
    description: f.description,
    country: f.country,
    segments: f.segments,
    price: f.price,
    currency: f.currency,
    booking_link: f.bookingLink,
    notes: f.notes,
    is_confirmed: f.isConfirmed,
    created_at: now
  }));

  const dbAcc = accommodations.map(a => ({
    user_id: user.id,
    trip_id: newTripId,
    name: a.name,
    country: a.country,
    type: a.type,
    platform: a.platform,
    location: a.location,
    check_in: a.checkIn,
    check_out: a.checkOut,
    check_in_after: a.checkInAfter,
    check_out_before: a.checkOutBefore,
    price: a.price,
    currency: a.currency,
    booking_link: a.bookingLink,
    notes: a.notes,
    image: a.image,
    is_confirmed: a.isConfirmed,
    created_at: now
  }));

  const dbAct = activities.map(a => ({
    user_id: user.id,
    trip_id: newTripId,
    destination_id: a.destinationId, // Optional, might be null
    name: a.name,
    date: a.date,
    country: a.country,
    type: a.type,
    link: a.link,
    notes: a.notes,
    duration: a.duration,
    cost: a.cost,
    currency: a.currency,
    image: a.image,
    is_confirmed: a.isConfirmed,
    order: a.order || 0,
    created_at: now
  }));

  const dbNotes = notes.map(n => ({
    user_id: user.id,
    trip_id: newTripId,
    content: n.content,
    updated_at: now
  }));

  // 3. Insert all relational data
  await Promise.all([
    dbFlights.length > 0 && supabase.from("flights").insert(dbFlights),
    dbAcc.length > 0 && supabase.from("accommodations").insert(dbAcc),
    dbAct.length > 0 && supabase.from("activities").insert(dbAct),
    dbNotes.length > 0 && supabase.from("notes").insert(dbNotes)
  ]);

  return newTripId;
}
