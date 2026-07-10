import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Trash2,
  FileText,
  Pencil,
  FileSpreadsheet,
  FileCode,
  FolderArchive,
  Eye,
  FileDown,
} from "lucide-react";
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

export function DocumentCard({
  document,
  onDelete,
  onEdit,
}: DocumentsCardProps) {
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
              <h2 className="font-bold text-lg text-text-primary truncate">
                {document.name}
              </h2>
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
                const mime = document.mimeType;

                if (mime?.startsWith("image/")) {
                  return (
                    <img
                      src={document.file ?? undefined}
                      alt={document.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  );
                }

                if (mime === "application/pdf") {
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

                // Spreadsheets (XLSX, XLS, CSV)
                if (
                  mime === "text/csv" ||
                  mime ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                  mime === "application/vnd.ms-excel"
                ) {
                  return (
                    <div className="w-full h-full bg-emerald-50/50 dark:bg-emerald-950/10 flex flex-col p-4 select-none">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200/50 dark:border-emerald-800/30">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileSpreadsheet size={12} /> Spreadsheet / Data
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium uppercase">
                          {mime === "text/csv" ? "csv" : "xlsx"}
                        </span>
                      </div>
                      <div className="mt-3 flex-1 flex flex-col gap-1.5">
                        <div className="grid grid-cols-4 gap-1.5 bg-emerald-100/50 dark:bg-emerald-900/20 p-1.5 rounded text-[8px] font-bold text-emerald-800 dark:text-emerald-300">
                          <div className="h-2 w-full bg-emerald-200 dark:bg-emerald-800/60 rounded-xs" />
                          <div className="h-2 w-full bg-emerald-200 dark:bg-emerald-800/60 rounded-xs" />
                          <div className="h-2 w-full bg-emerald-200 dark:bg-emerald-800/60 rounded-xs" />
                          <div className="h-2 w-full bg-emerald-200 dark:bg-emerald-800/60 rounded-xs" />
                        </div>
                        {[1, 2, 3].map((r) => (
                          <div
                            key={r}
                            className="grid grid-cols-4 gap-1.5 p-1 border-b border-emerald-100/30"
                          >
                            <div className="h-2 w-10 bg-slate-200 dark:bg-slate-700 rounded-xs" />
                            <div className="h-2 w-14 bg-slate-200 dark:bg-slate-700 rounded-xs" />
                            <div className="h-2 w-8 bg-emerald-400/30 dark:bg-emerald-500/20 rounded-xs" />
                            <div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded-xs" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Word documents & plain text
                if (
                  mime === "text/plain" ||
                  mime ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                  mime === "application/msword"
                ) {
                  const isWord =
                    mime.includes("word") || mime.includes("msword");
                  return (
                    <div className="w-full h-full bg-sky-50/50 dark:bg-sky-950/10 flex flex-col p-4 select-none">
                      <div className="flex items-center justify-between pb-2 border-b border-sky-200/50 dark:border-sky-800/30">
                        <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText size={12} /> Document
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-medium uppercase">
                          {isWord ? "docx" : "txt"}
                        </span>
                      </div>
                      <div className="mt-3 flex-1 flex flex-col gap-2 bg-white dark:bg-surface-2 p-3 rounded-lg shadow-xs border border-sky-100/50 dark:border-sky-900/10 max-h-[110px] overflow-hidden">
                        <div className="h-2.5 w-1/3 bg-sky-100 dark:bg-sky-900/40 rounded-sm" />
                        <div className="space-y-1.5">
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-xs" />
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-xs" />
                          <div className="h-1.5 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-xs" />
                          <div className="h-1.5 w-4/6 bg-slate-100 dark:bg-slate-800 rounded-xs" />
                        </div>
                      </div>
                    </div>
                  );
                }

                // JSON Data Files
                if (mime === "application/json") {
                  return (
                    <div className="w-full h-full bg-slate-900 text-slate-300 flex flex-col p-4 font-mono select-none">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileCode size={12} className="text-yellow-500" />{" "}
                          JSON / Data
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium uppercase">
                          json
                        </span>
                      </div>
                      <div className="mt-3 flex-1 text-[9.5px] leading-relaxed text-indigo-300 space-y-1 overflow-hidden max-h-[110px]">
                        <div>{"{"}</div>
                        <div className="pl-3">
                          <span className="text-pink-400">"document"</span>:{" "}
                          <span className="text-emerald-400">
                            "{document.name.slice(0, 15)}"
                          </span>
                          ,
                        </div>
                        <div className="pl-3">
                          <span className="text-pink-400">"type"</span>:{" "}
                          <span className="text-emerald-400">
                            "{document.type}"
                          </span>
                          ,
                        </div>
                        <div className="pl-3">
                          <span className="text-pink-400">"status"</span>:{" "}
                          <span className="text-emerald-400">"valid"</span>
                        </div>
                        <div>{"}"}</div>
                      </div>
                    </div>
                  );
                }

                // ZIP & Compressed files
                if (
                  mime === "application/zip" ||
                  mime === "application/x-zip-compressed"
                ) {
                  return (
                    <div className="w-full h-full bg-amber-50/50 dark:bg-amber-950/10 flex flex-col p-4 select-none">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-200/50 dark:border-amber-800/30">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FolderArchive size={12} /> Zip Archive
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium uppercase">
                          zip
                        </span>
                      </div>
                      <div className="mt-3 flex-1 flex items-center justify-center gap-4">
                        <div className="relative w-12 h-12 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-600 dark:text-amber-400 shadow-xs">
                          <FolderArchive size={28} />
                          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full px-1 text-[7px] font-black leading-none border border-white dark:border-slate-900">
                            ZIP
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] font-medium text-text-secondary">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-bold">Compressed folder</span>
                          </div>
                          <span className="text-[9px] text-text-muted">
                            Contains travel archives
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Default state for non-previewable files (or missing mimeType)
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 transition-transform duration-500 group-hover:scale-110">
                    <FileText
                      size={48}
                      className="text-slate-300"
                      strokeWidth={1}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                      {mime?.split("/")[1] || "FILE"}
                    </span>
                  </div>
                );
              })()}
              {/* Hover Overlay indicating preview or download action */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white font-bold text-xs shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {(() => {
                    const mime = document.mimeType;

                    const isPreviewable =
                      mime?.startsWith("image/") ||
                      mime === "application/pdf" ||
                      mime === "text/plain";
                    if (isPreviewable) {
                      return (
                        <>
                          <Eye size={14} className="text-lavender-500" />
                          <span>View Preview</span>
                        </>
                      );
                    }
                    return (
                      <>
                        <FileDown
                          size={14}
                          className="text-amber-500 animate-bounce"
                        />
                        <span>Download File</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col min-h-[120px]">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-lavender-50 text-lavender-700 dark:bg-lavender-900/40 dark:text-lavender-300 border-lavender-100/50 shadow-none text-[10px] py-0.5 px-2 font-black uppercase flex items-center gap-1.5">
                  {(() => {
                    const type = DOCUMENT_TYPES.find(
                      (t) => t.value === document.type,
                    );
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
                  <p className="text-xs text-text-muted">
                    No description provided
                  </p>
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
