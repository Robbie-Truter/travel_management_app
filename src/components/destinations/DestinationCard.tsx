import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Edit, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import type { Destination } from "@/db/types";

interface DestinationCardProps {
  dest: Destination;
  onEdit: (d: Destination) => void;
  onDelete: (id: number) => void;
  onAddActivity?: (destId: number) => void;
}

export function DestinationCard({ dest, onEdit, onDelete, onAddActivity }: DestinationCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card hover className="overflow-hidden h-full group">
          <div className="flex flex-col sm:flex-row">
            {/* Image Section */}
            <div className="p-3 shrink-0">
              <div className="w-full sm:w-[400px] h-80 rounded-xl overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                {dest.image ? (
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <MapPin
                    size={48}
                    className="text-slate-300 dark:text-slate-700"
                    strokeWidth={1.5}
                  />
                )}
              </div>
            </div>

            {/* Content Section */}
            <CardContent className="pt-4 flex-1">
              <div className="flex items-start justify-between gap-3 w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-lavender-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-[20px] text-text-primary wrap-break-word whitespace-normal line-clamp-2">
                      {dest.name}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {dest.notes && (
                  <p className="max-w-70 mt-2 overflow-auto text-xs text-text-muted bg-surface-3 rounded-lg px-3 py-2">
                    {dest.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </div>

          <CardFooter className="bg-surface-2/50 border-t border-border flex justify-between items-center h-15 p-4">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(dest)}>
                <Edit size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-rose-pastel-400 hover:text-rose-pastel-500"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 size={14} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {onAddActivity && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddActivity(dest.id!)}
                  className="text-lavender-600 hover:bg-lavender-50 h-8 px-2"
                >
                  <Plus size={14} className="mr-1" />
                  Activity
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete(dest.id!);
          setDeleteOpen(false);
        }}
        title="Delete Destination"
        description={`Remove "${dest.name}" from your trip?`}
      />
    </>
  );
}
