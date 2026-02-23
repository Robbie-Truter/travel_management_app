import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Trash2, Edit, Download, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, statusLabels } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { formatDate, tripDuration } from "@/lib/utils";
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
        <Card hover className="overflow-hidden group" onClick={() => navigate(`/trips/${trip.id}`)}>
          {/* Cover Image */}
          <div className="relative h-40 bg-linear-to-br from-sage-100 to-sky-pastel-100 dark:from-sage-900/30 dark:to-sky-pastel-900/30 overflow-hidden">
            {trip.coverImage ? (
              <img
                src={trip.coverImage}
                alt={trip.destination}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin size={40} className="text-sage-300" />
              </div>
            )}

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="secondary"
                size="icon-sm"
                className="bg-white/90 text-black border-0 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(trip);
                }}
                title="Edit trip"
              >
                <Edit size={12} />
              </Button>
              <Button
                variant="secondary"
                size="icon-sm"
                className="bg-white/90 text-black border-0 shadow-sm"
                onClick={handleExport}
                title="Export trip"
              >
                <Download size={12} />
              </Button>
              <Button
                variant="secondary"
                size="icon-sm"
                className="bg-white/90 border-0 shadow-sm text-rose-pastel-500 hover:text-rose-pastel-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
                title="Delete trip"
              >
                <Trash2 size={12} />
              </Button>
            </div>

            {/* Status badge */}
            <div className="absolute bottom-2 left-2">
              <Badge variant={trip.status as TripStatus}>
                {trip.status === "booked" && <CheckCircle size={10} />}
                {statusLabels[trip.status]}
              </Badge>
            </div>
          </div>

          <CardContent className="pt-4">
            <h3 className="font-semibold text-text-primary truncate">{trip.name}</h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-text-secondary">
              <MapPin size={13} />
              <span className="truncate">{trip.destination}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
              <Calendar size={12} />
              <span>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
              {duration && <span className="ml-1 text-sage-500">· {duration}</span>}
            </div>
            {trip.description && (
              <p className="mt-2 text-xs text-text-muted line-clamp-2">{trip.description}</p>
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
