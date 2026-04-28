import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { uploadFile, getFileUrl, deleteFile } from "@/lib/storage";
import type { Destination } from "@/db/types";

export function useDestinations(tripId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  const {
    data: destinations,
    isLoading,
    isRefetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["destinations", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("trip_id", tripId)
        .order("order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data.map((doc) => ({
        ...doc,
        tripId: doc.trip_id,
        tripCountryId: doc.trip_country_id,
        countryId: doc.country_id,
        cityLookupId: doc.city_lookup_id ?? undefined,
        createdAt: doc.created_at,
        image: doc.image
          ? doc.image.startsWith("data:") || doc.image.startsWith("http")
            ? doc.image
            : getFileUrl("destination-images", doc.image)
          : undefined,
      })) as Destination[];
    },
    enabled: !!user && !!tripId,
    retry: 3,
  });

  const addDestinationMutation = useMutation({
    mutationFn: async (destination: Omit<Destination, "id" | "createdAt">) => {
      if (!user) throw new Error("Not authenticated");

      let imagePath = destination.image;
      if (destination.image && destination.image.startsWith("data:")) {
        const fileName = `${Date.now()}_dest.jpg`;
        imagePath = await uploadFile(
          "destination-images",
          `${user.id}/${fileName}`,
          destination.image,
        );
      }

      const dbDest = {
        user_id: user.id,
        trip_id: destination.tripId,
        trip_country_id: destination.tripCountryId,
        country_id: destination.countryId,
        city_lookup_id: destination.cityLookupId ?? null,
        name: destination.name,
        image: imagePath,
        notes: destination.notes,
        order: destination.order,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("destinations")
        .insert([dbDest])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinations"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to add destination", "error");
    },
  });

  const updateDestinationMutation = useMutation({
    mutationFn: async ({ id, changes }: { id: number; changes: Partial<Destination> }) => {
      if (!user) throw new Error("Not authenticated");
      const dbUpdates: Record<string, unknown> = {};

      if (changes.image !== undefined) {
        const { data: oldDest } = await supabase
          .from("destinations")
          .select("image")
          .eq("id", id)
          .single();

        if (
          oldDest?.image &&
          oldDest.image !== changes.image &&
          !oldDest.image.startsWith("http")
        ) {
          try {
            await deleteFile("destination-images", oldDest.image);
          } catch (error) {
            console.error(error);
            throw new Error("Could not update destination - error deleting old image");
          }
        }

        if (changes.image && changes.image.startsWith("data:")) {
          const fileName = `${Date.now()}_dest.jpg`;
          const path = await uploadFile(
            "destination-images",
            `${user.id}/${fileName}`,
            changes.image,
          );
          dbUpdates.image = path;
        } else {
          dbUpdates.image = changes.image;
        }
      }

      if (changes.name !== undefined) dbUpdates.name = changes.name;
      if (changes.tripCountryId !== undefined) dbUpdates.trip_country_id = changes.tripCountryId;
      if (changes.countryId !== undefined) dbUpdates.country_id = changes.countryId;
      if (changes.cityLookupId !== undefined)
        dbUpdates.city_lookup_id = changes.cityLookupId ?? null;
      if (changes.notes !== undefined) dbUpdates.notes = changes.notes;
      if (changes.order !== undefined) dbUpdates.order = changes.order;
      if (!changes.image) dbUpdates.image = null;

      const { error } = await supabase.from("destinations").update(dbUpdates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinations"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to update destination", "error");
    },
  });

  const deleteDestinationMutation = useMutation({
    mutationFn: async (id: number) => {
      // 1. Get destination and all related items to clean up storage
      const [destRes, accsRes, actsRes] = await Promise.all([
        supabase.from("destinations").select("image").eq("id", id).single(),
        supabase.from("accommodations").select("image").eq("destination_id", id),
        supabase.from("activities").select("image").eq("destination_id", id),
      ]);

      if (destRes.error || accsRes.error || actsRes.error) {
        throw new Error("Failed to fetch destination items for storage cleanup");
      }

      const dest = destRes.data;
      const accs = accsRes.data;
      const acts = actsRes.data;

      // 2. Collect all image paths to delete
      const imageDeletions: Promise<unknown>[] = [];

      // Destination image
      if (dest?.image && !dest.image.startsWith("http")) {
        imageDeletions.push(supabase.storage.from("destination-images").remove([dest.image]));
      }
      // Accommodations
      if (accs) {
        accs.forEach((a) => {
          if (a.image && !a.image.startsWith("http")) {
            imageDeletions.push(supabase.storage.from("accommodation-images").remove([a.image]));
          }
        });
      }
      // Activities
      if (acts) {
        acts.forEach((a) => {
          if (a.image && !a.image.startsWith("http")) {
            imageDeletions.push(supabase.storage.from("activity-images").remove([a.image]));
          }
        });
      }

      // 3. Run storage deletions
      if (imageDeletions.length > 0) {
        await Promise.all(imageDeletions).catch((err) => {
          console.error("Storage cleanup failed during destination deletion", err);
          showToast("Some images could not be deleted from storage", "warning");
        });
      }

      // 4. Finally delete the destination (DB cascade handles the rest)
      const { error } = await supabase.from("destinations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations", tripId] });
      queryClient.invalidateQueries({ queryKey: ["accommodations", tripId] });
      queryClient.invalidateQueries({ queryKey: ["activities", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete destination", "error");
    },
  });

  return {
    destinations: destinations ?? [],
    isLoading,
    isRefetching,
    isError,
    refetch,
    addDestination: async (destination: Omit<Destination, "id" | "createdAt">) =>
      addDestinationMutation.mutateAsync(destination),
    updateDestination: async (id: number, changes: Partial<Destination>) =>
      updateDestinationMutation.mutateAsync({ id, changes }),
    deleteDestination: async (id: number) => deleteDestinationMutation.mutateAsync(id),
  };
}
