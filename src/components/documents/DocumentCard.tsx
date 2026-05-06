import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Trash2, FileText, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { DOCUMENT_TYPES } from "./document-types";
import { formatDate } from "@/lib/utils";
import type { Document as Documents } from "@/db/types";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface DocumentsCardProps {
  document: Documents;
  onDelete: (id: number) => void;
  onEdit?: (document: Documents) => void;
}

export function DocumentCard({ document, onDelete, onEdit }: DocumentsCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(document.id!);
    setDeleting(false);
    setDeleteOpen(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-full lg:w-full"
      >
        <Card
          hover
          className="w-full overflow-hidden group flex flex-col border-border/60 transition-all duration-300 min-h-[500px]"
          onClick={async () => {
            if (document.file) {
              try {
                const res = await fetch(document.file);
                const blob = await res.blob();
                const objectUrl = URL.createObjectURL(blob);
                window.open(objectUrl, "_blank");
              } catch (e) {
                console.error("Failed to open document", e);
                window.open(document.file, "_blank"); // Fallback
              }
            }
          }}
        >
          {/* Header Area - Consistent with other cards */}
          <div className="p-4 flex items-center gap-3 border-b border-border rounded-t-md bg-surface-2/80 backdrop-blur-xs">
            <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center shrink-0 border border-border shadow-sm">
              <FileText size={18} className="text-lavender-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-text-primary truncate">{document.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar size={10} className="text-text-muted" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-tight">
                  {formatDate(document.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(document);
                }}
              >
                <Pencil size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-rose-pastel-400 hover:text-rose-pastel-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          <CardContent className="p-0 flex flex-col h-full bg-surface overflow-hidden">
            {/* Visual Section - Fixed Height Preview */}
            <div className="relative aspect-video w-full overflow-hidden border-b border-border/40 bg-linear-to-br from-slate-50 to-sky-pastel-50 dark:from-slate-900/20 dark:to-sky-pastel-900/20 flex items-center justify-center">
              {(() => {
                if (document.mimeType?.startsWith("image/")) {
                  return (
                    <img
                      src={document.file ?? undefined}
                      alt={document.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  );
                }

                if (document.mimeType === "application/pdf") {
                  return (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <Document
                        file={document.file}
                        className="flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                      >
                        <Page
                          pageNumber={1}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          height={200}
                          className="shadow-xl bg-white rounded-sm overflow-hidden"
                        />
                      </Document>
                    </div>
                  );
                }

                // Default state for non-previewable files (or missing mimeType)
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 transition-transform duration-500 group-hover:scale-110">
                    <FileText size={48} className="text-slate-300" strokeWidth={1} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                      {document.mimeType?.split("/")[1] || "FILE"}
                    </span>
                  </div>
                );
              })()}
              {/* Optional Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col min-h-[120px]">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-lavender-50 text-lavender-700 dark:bg-lavender-900/40 dark:text-lavender-300 border-lavender-100/50 shadow-none text-[10px] py-0.5 px-2 font-black uppercase flex items-center gap-1.5">
                  {(() => {
                    const type = DOCUMENT_TYPES.find((t) => t.value === document.type);
                    if (type) {
                      return (
                        <>
                          <type.icon size={10} />
                          {type.label}
                        </>
                      );
                    }
                    return document.mimeType?.split("/")[1] || "File";
                  })()}
                </Badge>
              </div>

              {document.description ? (
                <div className="relative">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2 block">
                    Description
                  </span>
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-4 italic">
                    "{document.description}"
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-2 opacity-40 italic">
                  <p className="text-xs text-text-muted">No description provided</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Document"
        description={`Are you sure you want to delete "${document.name}"? This will permanently remove the document.`}
        loading={deleting}
      />
    </>
  );
}
