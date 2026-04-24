import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import type { TripCountry, TripCountryRow } from "@/db/types";

export function useTripCountries(tripId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  const {
    data: tripCountries,
    isLoading,
    isRefetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tripCountries", tripId],
    queryFn: async (): Promise<TripCountry[]> => {
      const { data, error } = await supabase
        .from("trip_countries")
        .select("*")
        .eq("trip_id", tripId)
        .order("order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!data) return [];

      return (data as TripCountryRow[]).map((doc) => ({
        ...doc,
        tripId: doc.trip_id,
        countryId: doc.country_id,
        countryName: doc.country_name,
        countryCode: doc.country_code,
        budgetLimit: doc.budget_limit,
        createdAt: doc.created_at,
      })) as TripCountry[];
    },
    enabled: !!user && !!tripId,
    retry: 3,
  });

  const addTripCountryMutation = useMutation({
    mutationFn: async (country: Omit<TripCountry, "id" | "createdAt">) => {
      if (!user) throw new Error("Not authenticated");
      const dbCountry = {
        user_id: user.id,
        trip_id: country.tripId,
        country_id: country.countryId,
        country_name: country.countryName,
        country_code: country.countryCode,
        budget_limit: country.budgetLimit || 0,
        notes: country.notes,
        order: country.order,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("trip_countries")
        .insert([dbCountry])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripCountries", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to add country", "error");
    },
  });

  const updateTripCountryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<TripCountry> }) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.countryId !== undefined) dbUpdates.country_id = updates.countryId;
      if (updates.countryName !== undefined) dbUpdates.country_name = updates.countryName;
      if (updates.countryCode !== undefined) dbUpdates.country_code = updates.countryCode;
      if (updates.budgetLimit !== undefined) dbUpdates.budget_limit = updates.budgetLimit;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.order !== undefined) dbUpdates.order = updates.order;

      const { error } = await supabase.from("trip_countries").update(dbUpdates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripCountries", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update country", "error");
    },
  });

  const deleteTripCountryMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("trip_countries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripCountries", tripId] });
      queryClient.invalidateQueries({ queryKey: ["destinations", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete country", "error");
    },
  });

  return {
    tripCountries: tripCountries ?? [],
    isLoading,
    isRefetching,
    isError,
    refetch,
    addTripCountry: async (country: Omit<TripCountry, "id" | "createdAt">) =>
      addTripCountryMutation.mutateAsync(country),
    updateTripCountry: async (id: number, updates: Partial<TripCountry>) =>
      updateTripCountryMutation.mutateAsync({ id, updates }),
    deleteTripCountry: async (id: number) => deleteTripCountryMutation.mutateAsync(id),
  };
}
