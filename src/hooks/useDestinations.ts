import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { uploadFile, getFileUrl, deleteFile } from "@/lib/storage";
import type { Destination } from "@/db/types";

export function useDestinations(tripId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: destinations, isLoading } = useQuery({
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
        createdAt: doc.created_at,
        image: doc.image
          ? doc.image.startsWith("data:") || doc.image.startsWith("http")
            ? doc.image
            : getFileUrl("destination-images", doc.image)
          : undefined,
      })) as Destination[];
    },
    enabled: !!user && !!tripId,
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
  });

  const updateDestinationMutation = useMutation({
    mutationFn: async ({ id, changes }: { id: number; changes: Partial<Destination> }) => {
      if (!user) throw new Error("Not authenticated");
      const dbUpdates: Record<string, unknown> = {};

      if (changes.image && changes.image.startsWith("data:")) {
        const fileName = `${Date.now()}_dest.jpg`;
        const path = await uploadFile(
          "destination-images",
          `${user.id}/${fileName}`,
          changes.image,
        );
        dbUpdates.image = path;
      } else if (changes.image !== undefined) {
        dbUpdates.image = changes.image;
      }

      if (changes.name !== undefined) dbUpdates.name = changes.name;
      if (changes.tripCountryId !== undefined) dbUpdates.trip_country_id = changes.tripCountryId;
      if (changes.notes !== undefined) dbUpdates.notes = changes.notes;
      if (changes.order !== undefined) dbUpdates.order = changes.order;

      const { error } = await supabase.from("destinations").update(dbUpdates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinations"] }),
  });

  const deleteDestinationMutation = useMutation({
    mutationFn: async (id: number) => {
      // 1. Get destination to find image path
      const { data: dest } = await supabase
        .from("destinations")
        .select("image")
        .eq("id", id)
        .single();

      // 2. Delete image if exists
      if (dest?.image && !dest.image.startsWith("http")) {
        await deleteFile("destination-images", dest.image).catch(console.error);
      }

      const { error } = await supabase.from("destinations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinations"] }),
  });

  return {
    destinations: destinations ?? [],
    loading: isLoading,
    addDestination: async (destination: Omit<Destination, "id" | "createdAt">) =>
      addDestinationMutation.mutateAsync(destination),
    updateDestination: async (id: number, changes: Partial<Destination>) =>
      updateDestinationMutation.mutateAsync({ id, changes }),
    deleteDestination: async (id: number) => deleteDestinationMutation.mutateAsync(id),
  };
}
