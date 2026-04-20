import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useNotes(tripId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: note,
    isLoading,
    isError,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notes", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("trip_id", tripId)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      const latestNote = data?.[0];

      return latestNote
        ? {
            ...latestNote,
            tripId: latestNote.trip_id,
            updatedAt: latestNote.updated_at,
          }
        : null;
    },
    enabled: !!user && !!tripId,
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not authenticated");
      const now = new Date().toISOString();

      const { error } = await supabase.from("notes").upsert(
        {
          user_id: user.id,
          trip_id: tripId,
          content,
          updated_at: now,
        },
        { onConflict: "user_id,trip_id" },
      );

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  return {
    note: note || undefined,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
    saving: saveNoteMutation.isPending,
    saveNote: async (content: string) => saveNoteMutation.mutateAsync(content),
  };
}
