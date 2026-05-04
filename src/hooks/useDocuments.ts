import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { uploadFile, deleteFile } from "@/lib/storage";
import type { Document } from "@/db/types";

// Helper to determine accurate file extensions from MIME types
const getExtensionFromMime = (mime?: string, defaultExt = "file") => {
  if (!mime) return defaultExt;
  if (mime === "application/pdf") return "pdf";
  if (mime === "application/json") return "json";
  if (mime.startsWith("image/")) return mime.split("/")[1];
  return defaultExt;
};

export function useDocuments(tripId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

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

      // Get unsigned paths (data from DB has snake_case keys like trip_id, created_at)
      const dbDocs = data;

      // Separate documents that need signed URLs from data URIs/external HTTP
      const pathsToSign: string[] = [];
      const docPathMap = new Map<number, string>();

      dbDocs.forEach((doc) => {
        if (doc.file && !doc.file.startsWith("data:") && !doc.file.startsWith("http")) {
          pathsToSign.push(doc.file);
          docPathMap.set(doc.id!, doc.file);
        }
      });

      // Fetch signed URLs in one batch
      const signedUrlMap: Record<string, string> = {};
      if (pathsToSign.length > 0) {
        const { data: signedUrls, error: signError } = await supabase.storage
          .from("user-documents")
          .createSignedUrls(pathsToSign, 3600); // 1 hour expiry

        if (signError) {
          console.error("Failed to generate signed URLs:", signError);
        } else if (signedUrls) {
          signedUrls.forEach((su) => {
            if (!su.error && su.signedUrl && su.path) {
              signedUrlMap[su.path] = su.signedUrl;
            }
          });
        }
      }

      return dbDocs.map((doc) => {
        let finalUrl = "";

        if (doc.file) {
          if (doc.file.startsWith("data:") || doc.file.startsWith("http")) {
            finalUrl = doc.file;
          } else {
            finalUrl = signedUrlMap[doc.file] || "";
          }
        }

        return {
          ...doc,
          tripId: doc.trip_id,
          createdAt: doc.created_at,
          file: finalUrl,
          mimeType: doc.mime_type,
          // Store the original path so we can delete/update it later if needed
          _originalPath: doc.file,
        };
      }) as Document[];
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
        const mime = document.file.split(";")[0].split(":")[1];
        const extension = getExtensionFromMime(mime);
        const fileName = `${Date.now()}_doc.${extension}`;
        filePath = await uploadFile("user-documents", `${user.id}/${fileName}`, document.file);
      }

      const dbDoc = {
        user_id: user.id,
        trip_id: document.tripId,
        name: document.name,
        description: document.description,
        type: document.type,
        mime_type: document.mimeType,
        file: filePath,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from("documents").insert([dbDoc]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to add document", "error");
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Document> }) => {
      if (!user) throw new Error("Not authenticated");
      const dbUpdates: Record<string, unknown> = {};

      if (updates.file && updates.file.startsWith("data:")) {
        // 1. Get old document to find the old file path
        const { data: oldDoc } = await supabase
          .from("documents")
          .select("file")
          .eq("id", id)
          .single();

        // 2. Upload the new file
        const mime = updates.file.split(";")[0].split(":")[1];
        const extension = getExtensionFromMime(mime);
        const fileName = `${Date.now()}_doc.${extension}`;
        const newPath = await uploadFile("user-documents", `${user.id}/${fileName}`, updates.file);
        dbUpdates.file = newPath;

        // 3. Delete the old file from storage
        if (oldDoc?.file && !oldDoc.file.startsWith("http")) {
          try {
            await deleteFile("user-documents", oldDoc.file);
          } catch (error) {
            console.error(error);
            throw new Error("Could not update document - error deleting old file");
          }
        }
      } else if (updates.file !== undefined) {
        dbUpdates.file = updates.file;
      }

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.mimeType !== undefined) dbUpdates.mime_type = updates.mimeType;
      if (!updates.file) dbUpdates.file = null;

      const { error } = await supabase.from("documents").update(dbUpdates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to update document", "error");
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      // 1. Get document to find file path
      const { data: doc } = await supabase.from("documents").select("file").eq("id", id).single();

      // 2. Delete file if exists
      if (doc?.file && !doc.file.startsWith("http")) {
        // If we attached _originalPath, we should try to use that if it was passed instead
        // (but in delete we just get ID, so doc.file is what's in DB, which is the internal path)
        await deleteFile("user-documents", doc.file).catch(console.error);
      }

      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete document", "error");
    },
  });

  return {
    documents: documents ?? [],
    isLoading,
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
