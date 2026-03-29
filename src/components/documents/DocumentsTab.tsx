import { Button } from "@/components/ui/Button";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Upload } from "lucide-react";
import { useState } from "react";
import { DocumentCard } from "./DocumentCard";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentForm } from "./DocumentForm";
import { DOCUMENT_TYPES } from "./document-types";
import type { Document } from "@/db/types";

export function DocumentsTab({ tripId }: { tripId: number }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | undefined>();

  const { documents, addDocument, deleteDocument, updateDocument } = useDocuments(tripId);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = documents?.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || d.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Grouping logic
  const groupedDocuments = filtered?.reduce(
    (acc, doc) => {
      const type = doc.type || "other";
      if (!acc[type]) acc[type] = [];
      acc[type].push(doc);
      return acc;
    },
    {} as Record<string, Document[]>,
  );

  // Sort categories based on DOCUMENT_TYPES order
  const sortedCategories = DOCUMENT_TYPES.filter((t) => groupedDocuments?.[t.value]).map(
    (t) => t.value,
  );

  // Add any categories not in DOCUMENT_TYPES (if any) at the end
  if (groupedDocuments) {
    Object.keys(groupedDocuments).forEach((cat) => {
      if (!sortedCategories.includes(cat)) {
        sortedCategories.push(cat);
      }
    });
  }

  const handleSave = async (data: Omit<Document, "id" | "createdAt" | "tripId">) => {
    if (editingDocument?.id) {
      await updateDocument(editingDocument.id, data);
    } else {
      await addDocument({
        ...data,
        tripId,
      });
    }
  };

  const handleEdit = (doc: Document) => {
    setEditingDocument(doc);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDocument(undefined);
    setModalOpen(true);
  };

  return (
    <div className="mt-5">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3 items-center">
            <p className="text-sm text-text-secondary mt-0.5">
              {documents?.length || 0} Document{documents?.length === 1 ? "" : "s"} total
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-4 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-lavender-400 focus:border-transparent w-full sm:w-48"
              />
            </div>
            <Button variant="secondary" size="md" onClick={handleAdd} className="w-full sm:w-auto">
              <Upload size={15} />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === "all"
                ? "bg-lavender-500 text-white shadow-md shadow-lavender-500/20"
                : "bg-surface border border-border text-text-secondary hover:border-lavender-300 hover:text-lavender-600"
            }`}
          >
            All Documents
          </button>
          {DOCUMENT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedCategory === type.value;
            const count = documents?.filter((d) => d.type === type.value).length || 0;

            if (count === 0 && !isSelected) return null;

            return (
              <button
                key={type.value}
                onClick={() => setSelectedCategory(type.value)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? "bg-lavender-500 text-white shadow-md shadow-lavender-500/20"
                    : "bg-surface border border-border text-text-secondary hover:border-lavender-300 hover:text-lavender-600"
                }`}
              >
                <Icon size={14} />
                {type.label}
                <span
                  className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center mb-4">
            <Upload size={36} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            {search || selectedCategory !== "all" ? "No matches found" : "No documents yet"}
          </h2>
          <p className="text-sm text-text-secondary max-w-xs mb-6">
            {search || selectedCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Upload your first document to keep everything organized."}
          </p>
          {search || selectedCategory !== "all" ? (
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Button variant="primary" onClick={handleAdd}>
              <Plus size={15} />
              Upload Document
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-12">
          {sortedCategories.map((category) => {
            const categoryInfo = DOCUMENT_TYPES.find((t) => t.value === category);
            const docs = groupedDocuments?.[category] || [];
            if (docs.length === 0) return null;

            return (
              <div key={category} className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-lavender-50 dark:bg-lavender-900/20 flex items-center justify-center text-lavender-500 shadow-sm border border-lavender-100/50 dark:border-lavender-900/30">
                      {categoryInfo ? <categoryInfo.icon size={20} /> : <Upload size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-lg tracking-tight">
                        {categoryInfo?.label || category}
                      </h3>
                      <p className="text-xs text-text-muted font-medium">
                        {docs.length} {docs.length === 1 ? "document" : "documents"}
                      </p>
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {docs.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onDelete={(id) => deleteDocument(id)}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <DocumentForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editingDocument}
      />
    </div>
  );
}

