import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { uploadFile, getFileUrl, deleteFile } from "@/lib/storage";
import type { Accommodation } from "@/db/types";

export function useAccommodations(tripId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  const {
    data: accommodations,
    isLoading,
    isRefetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["accommodations", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("trip_id", tripId)
        .order("check_in", { ascending: true });

      if (error) throw error;

      return data.map((doc) => ({
        ...doc,
        tripId: doc.trip_id,
        tripCountryId: doc.trip_country_id,
        destinationId: doc.destination_id,
        checkIn: doc.check_in,
        checkOut: doc.check_out,
        checkInAfter: doc.check_in_after,
        checkOutBefore: doc.check_out_before,
        bookingLink: doc.booking_link,
        isConfirmed: doc.is_confirmed,
        createdAt: doc.created_at,
        image: doc.image
          ? doc.image.startsWith("data:") || doc.image.startsWith("http")
            ? doc.image
            : getFileUrl("accommodation-images", doc.image)
          : undefined,
      })) as Accommodation[];
    },
    enabled: !!user && !!tripId,
    retry: 3,
  });

  const addAccommodationMutation = useMutation({
    mutationFn: async (acc: Omit<Accommodation, "id" | "createdAt">) => {
      if (!user) throw new Error("Not authenticated");

      let imagePath = acc.image;
      if (acc.image && acc.image.startsWith("data:")) {
        const fileName = `${Date.now()}_acc.jpg`;
        imagePath = await uploadFile("accommodation-images", `${user.id}/${fileName}`, acc.image);
      }

      const dbAcc = {
        user_id: user.id,
        trip_id: acc.tripId,
        trip_country_id: acc.tripCountryId,
        destination_id: acc.destinationId,
        name: acc.name,
        type: acc.type,
        platform: acc.platform,
        location: acc.location,
        check_in: acc.checkIn,
        check_out: acc.checkOut,
        check_in_after: acc.checkInAfter,
        check_out_before: acc.checkOutBefore,
        price: acc.price,
        currency: acc.currency,
        booking_link: acc.bookingLink,
        notes: acc.notes,
        image: imagePath,
        is_confirmed: acc.isConfirmed,
        created_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("accommodations")
        .insert([dbAcc])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accommodations"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to add accommodation", "error");
    },
  });

  const updateAccommodationMutation = useMutation({
    mutationFn: async ({ id, changes }: { id: number; changes: Partial<Accommodation> }) => {
      if (!user) throw new Error("Not authenticated");
      const updateData: Record<string, unknown> = {};

      if (changes.image !== undefined) {
        const { data: oldAcc } = await supabase
          .from("accommodations")
          .select("image")
          .eq("id", id)
          .single();

        if (oldAcc?.image && oldAcc.image !== changes.image && !oldAcc.image.startsWith("http")) {
          try {
            await deleteFile("accommodation-images", oldAcc.image);
          } catch (error) {
            console.error(error);
            throw new Error("Could not update accommodation - error deleting old image");
          }
        }

        if (changes.image && changes.image.startsWith("data:")) {
          const fileName = `${Date.now()}_acc.jpg`;
          const path = await uploadFile(
            "accommodation-images",
            `${user.id}/${fileName}`,
            changes.image,
          );
          updateData.image = path;
        } else {
          updateData.image = changes.image;
        }
      }

      if (changes.name !== undefined) updateData.name = changes.name;
      if (changes.tripCountryId !== undefined) updateData.trip_country_id = changes.tripCountryId;
      if (changes.destinationId !== undefined) updateData.destination_id = changes.destinationId;
      if (changes.type !== undefined) updateData.type = changes.type;
      if (changes.platform !== undefined) updateData.platform = changes.platform;
      if (changes.location !== undefined) updateData.location = changes.location;
      if (changes.checkIn !== undefined) updateData.check_in = changes.checkIn;
      if (changes.checkOut !== undefined) updateData.check_out = changes.checkOut;
      if (changes.checkInAfter !== undefined) updateData.check_in_after = changes.checkInAfter;
      if (changes.checkOutBefore !== undefined)
        updateData.check_out_before = changes.checkOutBefore;
      if (changes.price !== undefined) updateData.price = changes.price;
      if (changes.currency !== undefined) updateData.currency = changes.currency;
      if (changes.bookingLink !== undefined) updateData.booking_link = changes.bookingLink;
      if (changes.notes !== undefined) updateData.notes = changes.notes;
      if (changes.isConfirmed !== undefined) updateData.is_confirmed = changes.isConfirmed;
      if (!changes.image) updateData.image = null;

      const { data, error } = await supabase
        .from("accommodations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accommodations"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to update accommodation", "error");
    },
  });

  const deleteAccommodationMutation = useMutation({
    mutationFn: async (id: number) => {
      // 1. Get accommodation to find image path
      const { data: acc } = await supabase
        .from("accommodations")
        .select("image")
        .eq("id", id)
        .single();

      // 2. Delete image if exists
      if (acc?.image && !acc.image.startsWith("http")) {
        await deleteFile("accommodation-images", acc.image).catch(console.error);
      }

      const { error } = await supabase.from("accommodations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accommodations"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete accommodation", "error");
    },
  });

  const confirmAccommodationMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("accommodations")
        .update({ is_confirmed: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accommodations"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to confirm accommodation", "error");
    },
  });

  return {
    accommodations: accommodations ?? [],
    isLoading,
    isRefetching,
    isError,
    refetch,
    addAccommodation: async (acc: Omit<Accommodation, "id" | "createdAt">) =>
      addAccommodationMutation.mutateAsync(acc),
    updateAccommodation: async (id: number, changes: Partial<Accommodation>) =>
      updateAccommodationMutation.mutateAsync({ id, changes }),
    deleteAccommodation: async (id: number) => deleteAccommodationMutation.mutateAsync(id),
    confirmAccommodation: async (id: number) => confirmAccommodationMutation.mutateAsync(id),
  };
}
