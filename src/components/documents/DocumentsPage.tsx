import { Button } from "@/components/ui/Button";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { DocumentsCard } from "./DocumentsCard";
import { useDocuments } from "@/hooks/useDocuments";
import { fileToBase64 } from "@/lib/utils";

export function DocumentUpload({ tripId }: { tripId: number }) {
  const [search, setSearch] = useState("");

  const { documents, addDocument, deleteDocument } = useDocuments(tripId);

  const importRef = useRef<HTMLInputElement>(null);

  const filtered = documents?.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase()),
  );

  console.log(filtered);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploadedFile = await fileToBase64(file);
      await addDocument({
        tripId,
        name: file.name,
        description: "",
        file: uploadedFile.base64,
        type: uploadedFile.type,
      });
    } catch (err) {
      console.error("Import failed", err);
    }
    e.target.value = "";
  };

  return (
    <div className="mt-5">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex gap-3 items-center">
          <p className="text-sm text-text-secondary mt-0.5">
            {documents?.length || 0} Document{documents?.length === 1 ? "" : "s"} added
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-4 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent w-48"
            />
          </div>
          <Button variant="secondary" size="md" onClick={() => importRef.current?.click()}>
            <Upload size={15} />
            Upload Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* TODO: Add document upload drop area here */}
      </div>

      {/* Document grid */}
      {filtered?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mb-4">
            <Upload size={36} className="text-sage-400" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            {search ? "No documents found" : "No documents yet"}
          </h2>
          <p className="text-sm text-text-secondary max-w-xs mb-6">
            {search
              ? "Try a different search term"
              : "Upload your first document to keep everything organized."}
          </p>
          {!search && (
            <Button variant="primary" onClick={() => importRef.current?.click()}>
              <Plus size={15} />
              Upload Document
            </Button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered?.map((document) => (
              <DocumentsCard
                key={document.id}
                document={document}
                onDelete={(id) => deleteDocument(id)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      <input
        ref={importRef}
        type="file"
        accept=".json, jpeg, jpg, png, application/pdf"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
