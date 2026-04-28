import { motion } from "framer-motion";
import { MapPin, Edit, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Destination } from "@/db/types";

interface DestinationCardProps {
  dest: Destination;
  onEdit: (d: Destination) => void;
  onDelete: (id: number) => void;
  onAddActivity?: (destId: number) => void;
}

export function DestinationCard({ dest, onEdit, onDelete, onAddActivity }: DestinationCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-full sm:w-[380px]"
    >
      <Card hover className="w-full overflow-hidden h-full group flex flex-col border-border/60">
        {/* Header Area - Consistent with TripCountries */}
        <div className="p-4 flex items-center gap-3 border-b border-border bg-surface-2/80 backdrop-blur-xs rounded-md">
          <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center shrink-0 border border-border shadow-sm">
            <MapPin size={18} className="text-lavender-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-text-primary truncate">{dest.name}</h2>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(dest);
              }}
            >
              <Edit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-rose-pastel-400 hover:text-rose-pastel-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(dest.id!);
              }}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        <CardContent className="p-0 flex flex-col h-full bg-surface">
          {/* Visual Section */}
          <div className="relative aspect-video w-full overflow-hidden border-b border-border/40">
            {dest.image ? (
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-lavender-50 to-sky-pastel-50 dark:from-lavender-900/20 dark:to-sky-pastel-900/20 flex items-center justify-center relative overflow-hidden">
                {/* Abstract Mesh Gradient Background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-lavender-400/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-sky-pastel-400/20 rounded-full blur-3xl animate-pulse delay-700" />
                </div>
                <MapPin
                  size={48}
                  className="text-lavender-200 dark:text-lavender-800 relative z-10"
                  strokeWidth={1}
                />
              </div>
            )}
            {/* Optional Gradient Overlay for depth */}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Content Area */}
          <div className="p-5 flex-1 min-h-[80px]">
            {dest.notes ? (
              <div className="relative">
                <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2 block">
                  Notes
                </span>
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 italic">
                  "{dest.notes}"
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-2 opacity-40">
                <p className="text-xs text-text-muted italic">No notes for this destination</p>
              </div>
            )}
          </div>
        </CardContent>

        {/* Integrated Actions */}
        <CardFooter className="bg-surface-2/40 border-t border-border flex justify-between items-center h-12 p-4 mt-auto">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {/* Quick Badge or Meta Info could go here */}
          </div>

          {onAddActivity && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddActivity(dest.id!)}
              className="text-lavender-600 hover:bg-lavender-100/50 h-7 px-2 text-xs font-semibold rounded-lg transition-all border border-transparent hover:border-lavender-200"
            >
              <Plus size={12} className="mr-1" />
              Add Activity
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
