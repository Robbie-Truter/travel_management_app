import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useNotes(tripId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: note, isLoading } = useQuery({
    queryKey: ["notes", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("trip_id", tripId)
        .maybeSingle(); // Returns null if not found instead of throwing an error

      if (error) throw error;
      
      return data ? {
        ...data,
        tripId: data.trip_id,
        updatedAt: data.updated_at,
      } : undefined;
    },
    enabled: !!user && !!tripId,
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not authenticated");
      const now = new Date().toISOString();
      
      if (note?.id) {
        // Update
        const { error } = await supabase.from("notes").update({ content, updated_at: now }).eq("id", note.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from("notes").insert([{
          user_id: user.id,
          trip_id: tripId,
          content,
          updated_at: now
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  return {
    note: note || undefined,
    loading: isLoading,
    saveNote: async (content: string) => saveNoteMutation.mutateAsync(content),
  };
}
