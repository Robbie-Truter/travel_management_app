import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Flight } from "@/db/types";

export function useFlights(tripId?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: flights, isLoading } = useQuery({
    queryKey: ["flights", tripId],
    queryFn: async () => {
      let query = supabase.from("flights").select("*").order("created_at", { ascending: true });
      if (tripId) {
        query = query.eq("trip_id", tripId);
      }
      const { data, error } = await query;
      if (error) throw error;

      return data
        .map((doc) => ({
          ...doc,
          tripId: doc.trip_id,
          isConfirmed: doc.is_confirmed,
          bookingLink: doc.booking_link,
          createdAt: doc.created_at,
        }))
        .sort((a, b) => {
          const timeA = (a.segments?.[0]?.departureTime) || "";
          const timeB = (b.segments?.[0]?.departureTime) || "";
          return timeA.localeCompare(timeB);
        }) as Flight[];
    },
    enabled: !!user && (tripId === undefined || !!tripId),
  });

  const addFlightMutation = useMutation({
    mutationFn: async (flight: Omit<Flight, "id" | "createdAt">) => {
      if (!user) throw new Error("Not authenticated");
      const dbFlight = {
        user_id: user.id,
        trip_id: flight.tripId,
        description: flight.description,
        country: flight.country,
        segments: flight.segments,
        price: flight.price,
        currency: flight.currency,
        booking_link: flight.bookingLink,
        notes: flight.notes,
        is_confirmed: flight.isConfirmed,
        created_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from("flights").insert([dbFlight]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flights"] }),
  });

  const updateFlightMutation = useMutation({
    mutationFn: async ({ id, changes }: { id: number; changes: Partial<Flight> }) => {
      const updateData: Record<string, unknown> = {};
      if (changes.tripId !== undefined) updateData.trip_id = changes.tripId;
      if (changes.description !== undefined) updateData.description = changes.description;
      if (changes.country !== undefined) updateData.country = changes.country;
      if (changes.segments !== undefined) updateData.segments = changes.segments;
      if (changes.price !== undefined) updateData.price = changes.price;
      if (changes.currency !== undefined) updateData.currency = changes.currency;
      if (changes.bookingLink !== undefined) updateData.booking_link = changes.bookingLink;
      if (changes.notes !== undefined) updateData.notes = changes.notes;
      if (changes.isConfirmed !== undefined) updateData.is_confirmed = changes.isConfirmed;

      const { data, error } = await supabase
        .from("flights")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flights"] }),
  });

  const deleteFlightMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("flights").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flights"] }),
  });

  const confirmFlightMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("flights").update({ is_confirmed: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flights"] }),
  });

  return {
    flights: flights ?? [],
    loading: isLoading,
    addFlight: async (flight: Omit<Flight, "id" | "createdAt">) =>
      addFlightMutation.mutateAsync(flight),
    updateFlight: async (id: number, changes: Partial<Flight>) =>
      updateFlightMutation.mutateAsync({ id, changes }),
    deleteFlight: async (id: number) => deleteFlightMutation.mutateAsync(id),
    confirmFlight: async (id: number) => confirmFlightMutation.mutateAsync(id),
  };
}
