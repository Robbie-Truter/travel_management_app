import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { uploadFile, getFileUrl, deleteFile } from "@/lib/storage";
import type { Trip, TripRow, TripCountryRow } from "@/db/types";

export function useTrips() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  const {
    data: trips,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["trips", user?.id],
    queryFn: async (): Promise<Trip[]> => {
      const { data, error } = await supabase
        .from("trips")
        .select("*, trip_countries(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      // Map snake_case from DB to camelCase for the frontend
      return (data as TripRow[]).map(
        (d) =>
          ({
            ...d,
            startDate: d.start_date,
            endDate: d.end_date,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            tripCountries: (d.trip_countries || []).map((tc: TripCountryRow) => ({
              ...tc,
              tripId: tc.trip_id,
              countryId: tc.country_id,
              countryName: tc.country_name,
              countryCode: tc.country_code,
              budgetLimit: tc.budget_limit,
              createdAt: tc.created_at,
            })),
            coverImage: d.cover_image
              ? d.cover_image.startsWith("data:") || d.cover_image.startsWith("http")
                ? d.cover_image
                : getFileUrl("trip-covers", d.cover_image)
              : undefined,
            baseCurrency: d.base_currency || "USD",
          }) as Trip,
      );
    },
    enabled: !!user,
  });

  const {
    mutateAsync: addTripMutation,
    isPending: isAdding,
    isError: isAddError,
    error: addError,
  } = useMutation({
    mutationFn: async (trip: Omit<Trip, "id" | "createdAt" | "updatedAt">) => {
      if (!user) throw new Error("Not authenticated");

      let coverImagePath = trip.coverImage;
      if (trip.coverImage && trip.coverImage.startsWith("data:")) {
        const fileName = `${Date.now()}_cover.jpg`;
        coverImagePath = await uploadFile("trip-covers", `${user.id}/${fileName}`, trip.coverImage);
      }

      const now = new Date().toISOString();
      // Map to snake_case for Supabase
      const dbTrip = {
        user_id: user.id,
        name: trip.name,
        start_date: trip.startDate,
        end_date: trip.endDate,
        status: trip.status,
        description: trip.description,
        budget: trip.budget,
        cover_image: coverImagePath,
        base_currency: trip.baseCurrency || "USD",
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase.from("trips").insert([dbTrip]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to add trip", "error");
    },
  });

  const {
    mutateAsync: updateTripMutation,
    isPending: isUpdating,
    isError: isUpdateError,
    error: updateError,
  } = useMutation({
    mutationFn: async ({ id, changes }: { id: number; changes: Partial<Trip> }) => {
      if (!user) throw new Error("Not authenticated");
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

      // Handle image upload if it's a new base64 image
      if (changes.coverImage !== undefined) {
        // We are updating the image (either to a new base64, a new URL, or clearing it)
        // First, check if there's an existing image to delete
        const { data: oldTrip } = await supabase
          .from("trips")
          .select("cover_image")
          .eq("id", id)
          .single();

        if (
          oldTrip?.cover_image &&
          oldTrip.cover_image !== changes.coverImage &&
          !oldTrip.cover_image.startsWith("http")
        ) {
          try {
            await deleteFile("trip-covers", oldTrip.cover_image);
          } catch (error) {
            console.error(error);
            throw new Error("Could not update trip - error deleting old image");
          }
        }

        if (changes.coverImage && changes.coverImage.startsWith("data:")) {
          const fileName = `${Date.now()}_cover.jpg`;
          const path = await uploadFile(
            "trip-covers",
            `${user.id}/${fileName}`,
            changes.coverImage,
          );
          updateData.cover_image = path;
        } else {
          updateData.cover_image = changes.coverImage;
        }
      }

      // Map camelCase keys back to snake_case
      if (changes.name !== undefined) updateData.name = changes.name;
      if (changes.startDate !== undefined) updateData.start_date = changes.startDate;
      if (changes.endDate !== undefined) updateData.end_date = changes.endDate;
      if (changes.status !== undefined) updateData.status = changes.status;
      if (changes.description !== undefined) updateData.description = changes.description;
      if (changes.budget !== undefined) updateData.budget = changes.budget;
      if (changes.baseCurrency !== undefined) updateData.base_currency = changes.baseCurrency;
      if (!changes.coverImage) updateData.cover_image = null;

      const { data, error } = await supabase
        .from("trips")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update trip", "error");
    },
  });

  const {
    mutateAsync: deleteTripMutation,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
  } = useMutation({
    mutationFn: async (id: number) => {
      // 1. Get trip to find cover image path
      const { data: trip } = await supabase
        .from("trips")
        .select("cover_image")
        .eq("id", id)
        .single();

      // 2. Delete cover image if exists
      if (trip?.cover_image && !trip.cover_image.startsWith("http")) {
        await deleteFile("trip-covers", trip.cover_image).catch(console.error);
      }

      // 3. Delete trip (will cascade to other tables in DB)
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete trip", "error");
    },
  });

  const getTrip = async (id: number): Promise<Trip | undefined> => {
    const { data, error } = await supabase
      .from("trips")
      .select("*, trip_countries(*)")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    const tripRow = data as TripRow;
    return {
      ...tripRow,
      startDate: tripRow.start_date,
      endDate: tripRow.end_date,
      createdAt: tripRow.created_at,
      updatedAt: tripRow.updated_at,
      tripCountries: (tripRow.trip_countries || []).map((tc: TripCountryRow) => ({
        ...tc,
        tripId: tc.trip_id,
        countryId: tc.country_id,
        countryName: tc.country_name,
        countryCode: tc.country_code,
        budgetLimit: tc.budget_limit,
        createdAt: tc.created_at,
      })),
      coverImage: tripRow.cover_image
        ? tripRow.cover_image.startsWith("data:") || tripRow.cover_image.startsWith("http")
          ? tripRow.cover_image
          : getFileUrl("trip-covers", tripRow.cover_image)
        : undefined,
      baseCurrency: tripRow.base_currency || "USD",
    } as Trip;
  };

  return {
    trips: trips ?? [],
    loading: isLoading,
    isError,
    error,
    isRefetching,
    addTrip: async (trip: Omit<Trip, "id" | "createdAt" | "updatedAt">) => addTripMutation(trip),
    isAdding,
    isAddError,
    addError,
    updateTrip: async (id: number, changes: Partial<Trip>) => updateTripMutation({ id, changes }),
    isUpdating,
    isUpdateError,
    updateError,
    deleteTrip: async (id: number) => deleteTripMutation(id),
    isDeleting,
    isDeleteError,
    deleteError,
    getTrip,
    refetch,
  };
}

export function useTrip(id: number | undefined) {
  const { user } = useAuth();

  const {
    data: trip,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["trip", id],
    queryFn: async (): Promise<Trip | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("trips")
        .select("*, trip_countries(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      if (!data) return null;

      const tripRow = data as unknown as TripRow;
      return {
        ...tripRow,
        startDate: tripRow.start_date,
        endDate: tripRow.end_date,
        createdAt: tripRow.created_at,
        updatedAt: tripRow.updated_at,
        tripCountries: (tripRow.trip_countries || []).map((tc: TripCountryRow) => ({
          ...tc,
          tripId: tc.trip_id,
          countryId: tc.country_id,
          countryName: tc.country_name,
          countryCode: tc.country_code,
          budgetLimit: tc.budget_limit,
          createdAt: tc.created_at,
        })),
        coverImage: tripRow.cover_image
          ? tripRow.cover_image.startsWith("data:") || tripRow.cover_image.startsWith("http")
            ? tripRow.cover_image
            : getFileUrl("trip-covers", tripRow.cover_image)
          : undefined,
        baseCurrency: tripRow.base_currency || "USD",
      } as Trip;
    },
    enabled: !!id && !!user,
  });

  return { trip, isLoading, isError, error, isRefetching, refetch };
}

export function useSettings() {
  const [homeCountry, setHomeCountry] = useState<string | null>(() => {
    return localStorage.getItem("homeCountry");
  });

  useEffect(() => {
    if (homeCountry) {
      localStorage.setItem("homeCountry", homeCountry);
    } else {
      localStorage.removeItem("homeCountry");
    }
  }, [homeCountry]);

  return { homeCountry, setHomeCountry };
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") ?? "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return { theme, toggleTheme };
}
