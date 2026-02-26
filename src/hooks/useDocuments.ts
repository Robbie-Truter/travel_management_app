import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import type { Document } from "@/db/types";

export function useDocuments(tripId: number) {
  const documents = useLiveQuery(async () => {
    const docs = await db.documents.where("tripId").equals(tripId).toArray();
    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tripId]);

  const addDocument = async (document: Omit<Document, "id" | "createdAt">) => {
    const now = new Date().toISOString();
    return db.documents.add({ ...document, createdAt: now });
  };

  const deleteDocument = async (id: number) => db.documents.delete(id);

  return { documents: documents ?? [], addDocument, deleteDocument };
}
