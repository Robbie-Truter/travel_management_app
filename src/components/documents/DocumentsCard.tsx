import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Trash2, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
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
}

export function DocumentsCard({ document, onDelete }: DocumentsCardProps) {
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
      >
        <Card
          hover
          className="overflow-hidden group"
          onClick={async () => {
            if (document.file) {
              try {
                // To display a data URL correctly in a new tab without being blocked or blank
                const res = await fetch(document.file);
                const blob = await res.blob();
                const objectUrl = URL.createObjectURL(blob);
                window.open(objectUrl, "_blank");
                // Note: Object URL memory won't be explicitly revoked here since it is in a new tab,
                // but the browser manages the lifecycle when that tab closes.
              } catch (e) {
                console.error("Failed to open document", e);
                window.open(document.file, "_blank"); // Fallback
              }
            }
          }}
        >
          {/* File/Image Preview */}
          <div className="relative h-64 sm:h-72 bg-linear-to-br from-sage-100 to-sky-pastel-100 dark:from-sage-900/30 dark:to-sky-pastel-900/30 overflow-hidden flex items-center justify-center">
            {document.type?.startsWith("image/") ? (
              <img
                src={document.file}
                alt={document.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : document.type?.startsWith("application/pdf") ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <Document
                  file={document.file}
                  className="flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                >
                  <Page
                    pageNumber={1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    height={240}
                    className="shadow-lg bg-white rounded-sm overflow-hidden"
                  />
                </Document>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-sage-400 gap-2 transition-transform duration-500 group-hover:scale-110">
                <FileText size={48} className="text-sage-300" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  {document.type?.split("/")[1] || "FILE"}
                </span>
              </div>
            )}

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 pointer-events-none" />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <Button
                variant="secondary"
                size="icon-sm"
                className="bg-white/90 border-0 shadow-sm text-rose-pastel-500 hover:text-rose-pastel-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
                title="Delete document"
              >
                <Trash2 size={12} />
              </Button>
            </div>

            {/* Type badge */}
            <div className="absolute bottom-2 left-2">
              <Badge className="bg-white/90 text-black shadow-sm capitalize mb-1">
                {document.type?.split("/")[1] || document.type || "File"}
              </Badge>
            </div>
          </div>

          <CardContent className="pt-4">
            <h3 className="font-semibold text-text-primary truncate">{document.name}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
              <Calendar size={12} />
              <span>{formatDate(document.createdAt)}</span>
            </div>
            {document.description && (
              <p className="mt-2 text-xs text-text-muted line-clamp-2">{document.description}</p>
            )}
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
