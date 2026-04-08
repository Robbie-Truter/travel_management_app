import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { uploadFile, getFileUrl, deleteFile } from "@/lib/storage";
import type { Document } from "@/db/types";

export function useDocuments(tripId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: documents,
    isLoading,
    isRefetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["documents", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((doc) => ({
        ...doc,
        tripId: doc.trip_id,
        createdAt: doc.created_at,
        file: doc.file
          ? doc.file.startsWith("data:") || doc.file.startsWith("http")
            ? doc.file
            : getFileUrl("user-documents", doc.file)
          : "",
      })) as Document[];
    },
    enabled: !!user && !!tripId,
    refetchOnMount: "always",
    retry: 3,
  });

  const addDocumentMutation = useMutation({
    mutationFn: async (document: Omit<Document, "id" | "createdAt">) => {
      if (!user) throw new Error("Not authenticated");

      let filePath = document.file;
      if (document.file && document.file.startsWith("data:")) {
        const extension = document.type === "application/pdf" ? "pdf" : "file";
        const fileName = `${Date.now()}_doc.${extension}`;
        filePath = await uploadFile("user-documents", `${user.id}/${fileName}`, document.file);
      }

      const dbDoc = {
        user_id: user.id,
        trip_id: document.tripId,
        name: document.name,
        description: document.description,
        type: document.type,
        file: filePath,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from("documents").insert([dbDoc]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Document> }) => {
      if (!user) throw new Error("Not authenticated");
      const dbUpdates: Record<string, unknown> = {};

      if (updates.file && updates.file.startsWith("data:")) {
        const extension = updates.type === "application/pdf" ? "pdf" : "file";
        const fileName = `${Date.now()}_doc.${extension}`;
        const path = await uploadFile("user-documents", `${user.id}/${fileName}`, updates.file);
        dbUpdates.file = path;
      } else if (updates.file !== undefined) {
        dbUpdates.file = updates.file;
      }

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.type !== undefined) dbUpdates.type = updates.type;

      const { error } = await supabase.from("documents").update(dbUpdates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      // 1. Get document to find file path
      const { data: doc } = await supabase.from("documents").select("file").eq("id", id).single();

      // 2. Delete file if exists
      if (doc?.file && !doc.file.startsWith("http")) {
        await deleteFile("user-documents", doc.file).catch(console.error);
      }

      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  return {
    documents: documents ?? [],
    loading: isLoading,
    isRefetching,
    isError,
    refetch,
    addDocument: async (document: Omit<Document, "id" | "createdAt">) =>
      addDocumentMutation.mutateAsync(document),
    updateDocument: async (id: number, updates: Partial<Document>) =>
      updateDocumentMutation.mutateAsync({ id, updates }),
    deleteDocument: async (id: number) => deleteDocumentMutation.mutateAsync(id),
  };
}
