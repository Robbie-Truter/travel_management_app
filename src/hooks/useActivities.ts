import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { uploadFile, getFileUrl, deleteFile } from "@/lib/storage";
import type { Activity } from "@/db/types";

export function useActivities(tripId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  const {
    data: activities,
    isLoading,
    isRefetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["activities", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("trip_id", tripId)
        .order("date", { ascending: true })
        .order("order", { ascending: true });

      if (error) throw error;

      return data.map((doc) => ({
        ...doc,
        tripId: doc.trip_id,
        tripCountryId: doc.trip_country_id,
        destinationId: doc.destination_id,
        isConfirmed: doc.is_confirmed,
        createdAt: doc.created_at,
        image: doc.image
          ? doc.image.startsWith("data:") || doc.image.startsWith("http")
            ? doc.image
            : getFileUrl("activity-images", doc.image)
          : undefined,
      })) as Activity[];
    },
    enabled: !!user && !!tripId,
    retry: 3,
  });

  const addActivityMutation = useMutation({
    mutationFn: async (activity: Omit<Activity, "id" | "createdAt">) => {
      if (!user) throw new Error("Not authenticated");

      let imagePath = activity.image;
      if (activity.image && activity.image.startsWith("data:")) {
        const fileName = `${Date.now()}_act.jpg`;
        imagePath = await uploadFile("activity-images", `${user.id}/${fileName}`, activity.image);
      }

      const dbActivity = {
        user_id: user.id,
        trip_id: activity.tripId,
        trip_country_id: activity.tripCountryId,
        destination_id: activity.destinationId,
        name: activity.name,
        date: activity.date,
        type: activity.type,
        link: activity.link,
        notes: activity.notes,
        duration: activity.duration,
        cost: activity.cost,
        currency: activity.currency,
        image: imagePath,
        is_confirmed: activity.isConfirmed,
        order: activity.order,
        created_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("activities")
        .insert([dbActivity])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to add activity", "error");
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, changes }: { id: number; changes: Partial<Activity> }) => {
      if (!user) throw new Error("Not authenticated");
      const updateData: Record<string, unknown> = {};

      if (changes.image !== undefined) {
        const { data: oldAct } = await supabase
          .from("activities")
          .select("image")
          .eq("id", id)
          .single();

        if (oldAct?.image && oldAct.image !== changes.image && !oldAct.image.startsWith("http")) {
          try {
            await deleteFile("activity-images", oldAct.image);
          } catch (error) {
            console.error(error);
            throw new Error("Could not update activity - error deleting old image");
          }
        }

        if (changes.image && changes.image.startsWith("data:")) {
          const fileName = `${Date.now()}_act.jpg`;
          const path = await uploadFile("activity-images", `${user.id}/${fileName}`, changes.image);
          updateData.image = path;
        } else {
          updateData.image = changes.image;
        }
      }

      if (changes.tripId !== undefined) updateData.trip_id = changes.tripId;
      if (changes.tripCountryId !== undefined) updateData.trip_country_id = changes.tripCountryId;
      if (changes.destinationId !== undefined) updateData.destination_id = changes.destinationId;
      if (changes.name !== undefined) updateData.name = changes.name;
      if (changes.date !== undefined) updateData.date = changes.date;
      if (changes.type !== undefined) updateData.type = changes.type;
      if (changes.link !== undefined) updateData.link = changes.link;
      if (changes.notes !== undefined) updateData.notes = changes.notes;
      if (changes.duration !== undefined) updateData.duration = changes.duration;
      if (changes.cost !== undefined) updateData.cost = changes.cost;
      if (changes.currency !== undefined) updateData.currency = changes.currency;
      if (changes.isConfirmed !== undefined) updateData.is_confirmed = changes.isConfirmed;
      if (changes.order !== undefined) updateData.order = changes.order;
      if (!changes.image) updateData.image = null;

      const { data, error } = await supabase
        .from("activities")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to update activity", "error");
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: number) => {
      // 1. Get activity to find image path
      const { data: act } = await supabase.from("activities").select("image").eq("id", id).single();

      // 2. Delete image if exists
      if (act?.image && !act.image.startsWith("http")) {
        await deleteFile("activity-images", act.image).catch(console.error);
      }

      const { error } = await supabase.from("activities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete activity", "error");
    },
  });

  const reorderActivitiesMutation = useMutation({
    mutationFn: async (updates: { id: number; order: number }[]) => {
      // Supabase lacks a clean bulk update, so we'll run them sequentially
      for (const { id, order } of updates) {
        const { error } = await supabase.from("activities").update({ order }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to reorder activities", "error");
    },
  });

  return {
    activities: activities ?? [],
    isLoading,
    isRefetching,
    isError,
    refetch,
    addActivity: async (activity: Omit<Activity, "id" | "createdAt">) =>
      addActivityMutation.mutateAsync(activity),
    updateActivity: async (id: number, changes: Partial<Activity>) =>
      updateActivityMutation.mutateAsync({ id, changes }),
    deleteActivity: async (id: number) => deleteActivityMutation.mutateAsync(id),
    reorderActivities: async (updates: { id: number; order: number }[]) =>
      reorderActivitiesMutation.mutateAsync(updates),
  };
}
