import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Trash2, Edit, Download, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, statusLabels } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { formatDate, tripDuration, getFlagEmoji } from "@/lib/utils";
import { exportTripAsJSON } from "@/lib/export";
import type { Trip, TripStatus } from "@/db/types";

interface TripCardProps {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onDelete: (id: number) => void;
}

export function TripCard({ trip, onEdit, onDelete }: TripCardProps) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(trip.id!);
    setDeleting(false);
    setDeleteOpen(false);
  };

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await exportTripAsJSON(trip.id!);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const duration = tripDuration(trip.startDate, trip.endDate);

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
          className="w-120 overflow-hidden group flex flex-col border-border/60 transition-all duration-300 min-h-[400px]"
          onClick={() => navigate(`/trips/${trip.id}`)}
        >
          {/* Cover Image Area */}
          <div className="relative h-48 sm:h-56 bg-linear-to-br from-lavender-100 to-sky-pastel-100 dark:from-lavender-900/30 dark:to-sky-pastel-900/30 overflow-hidden">
            {trip.coverImage ? (
              <img
                src={trip.coverImage}
                alt={trip.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-lavender-300 gap-2 transition-transform duration-500 group-hover:scale-110">
                <MapPin size={48} className="text-lavender-200" strokeWidth={1} />
                <span className="text-[10px] font-black uppercase tracking-widest text-lavender-400">
                  No Cover Image
                </span>
              </div>
            )}

            {/* Overlays */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
              <Button
                variant="secondary"
                size="icon-sm"
                className="bg-white/90 text-black border-0 shadow-xl hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(trip);
                }}
              >
                <Edit size={14} />
              </Button>
              <Button
                variant="secondary"
                size="icon-sm"
                className="bg-white/90 text-black border-0 shadow-xl hover:bg-white"
                onClick={handleExport}
              >
                <Download size={14} />
              </Button>
              <Button
                variant="secondary"
                size="icon-sm"
                className="bg-white/90 border-0 shadow-xl text-rose-pastel-500 hover:text-rose-pastel-600 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>

            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <Badge
                variant={trip.status as TripStatus}
                className="shadow-xl backdrop-blur-md border-0 uppercase font-black tracking-widest text-[10px]"
              >
                {trip.status === "booked" && <CheckCircle size={10} className="mr-1" />}
                {statusLabels[trip.status]}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6 flex flex-col items-center text-center flex-1 bg-surface">
            {/* Header Content */}
            <div className="mb-4">
              <h3 className="font-black text-xl text-text-primary tracking-tight group-hover:text-lavender-600 transition-colors line-clamp-1">
                {trip.name}
              </h3>

              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 overflow-hidden justify-center max-w-full px-2">
                  {trip.tripCountries && trip.tripCountries.length > 0 ? (
                    trip.tripCountries.map((tc, idx) => (
                      <span key={tc.id} className="flex items-center gap-1 shrink-0">
                        <span className="text-lg">{getFlagEmoji(tc.countryCode)}</span>
                        <span className="text-xs font-bold text-text-secondary truncate">
                          {tc.countryName}
                        </span>
                        {idx < trip.tripCountries!.length - 1 && (
                          <span className="text-slate-300">•</span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic flex items-center gap-1">
                      <MapPin size={10} /> No locations set
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Meta Info Area */}
            <div className="mt-auto w-full pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-1 border-r border-border/50">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                  Starts
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                  <Calendar size={12} className="text-lavender-500" />
                  {formatDate(trip.startDate)}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                  Duration
                </span>
                <div className="text-xs font-black text-lavender-600">
                  {duration || "Not specified"}
                </div>
              </div>
            </div>

            {trip.description && (
              <p className="mt-4 text-xs text-text-secondary line-clamp-2 leading-relaxed italic opacity-80">
                "{trip.description}"
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Trip"
        description={`Are you sure you want to delete "${trip.name}"? This will permanently remove all flights, accommodations, activities, and notes.`}
        loading={deleting}
      />
    </>
  );
}
