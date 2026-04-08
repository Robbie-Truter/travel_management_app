import { useState } from "react";
import { motion } from "framer-motion";
import {
  Hotel,
  MapPin,
  DollarSign,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  DoorOpen,
  DoorClosedLocked,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { formatCurrency, cn, formatDate } from "@/lib/utils";
import type { Accommodation } from "@/db/types";
import { PLATFORM_OPTIONS } from "./AccommodationConstants";

interface AccommodationCardProps {
  acc: Accommodation;
  onEdit: (a: Accommodation) => void;
  onDelete: (id: number) => void;
  onConfirm: (id: number) => void;
}

export function AccommodationCard({ acc, onEdit, onDelete, onConfirm }: AccommodationCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const nights = Math.max(
    1,
    Math.round((new Date(acc.checkOut).getTime() - new Date(acc.checkIn).getTime()) / 86400000),
  );

  const platform = PLATFORM_OPTIONS.find((p) => p.value === acc.platform);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-full lg:w-[380px]"
      >
        <Card
          hover
          className={cn([
            "overflow-hidden w-full h-full group flex flex-col border-border/60",
            acc.isConfirmed ? "border-sage-500/50" : "",
          ])}
        >
          {/* Header Area - Consistent with TripCountries and Destinations */}
          <div
            className={cn(
              "p-4 flex items-center gap-3 border-b border-border transition-colors",
              acc.isConfirmed
                ? "bg-sage-50/50 dark:bg-sage-900/10"
                : "bg-surface-2/80 backdrop-blur-xs",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-border shadow-sm",
                acc.isConfirmed ? "bg-sage-100 dark:bg-sage-900/30" : "bg-surface-3",
              )}
            >
              <Hotel
                size={18}
                className={acc.isConfirmed ? "text-sage-600" : "text-sky-pastel-500"}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-text-primary truncate">{acc.name}</h2>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-text-muted mt-0.5">
                <span className="text-text-secondary">{acc.type}</span>
                {platform && (
                  <>
                    <span className="opacity-40">•</span>
                    <span className="flex items-center gap-1">
                      {platform.icon} {platform.label}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(acc);
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
                  setDeleteOpen(true);
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          <CardContent className="p-0 flex flex-col h-full bg-surface">
            {/* Visual Section */}
            <div className="relative h-52 w-full overflow-hidden border-b border-border/40">
              {acc.image ? (
                <img
                  src={acc.image}
                  alt={acc.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-sky-pastel-50 to-indigo-pastel-50 dark:from-sky-pastel-900/10 dark:to-indigo-pastel-900/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-sky-pastel-400/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-pastel-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
                  </div>
                  <Hotel
                    size={48}
                    className="text-sky-pastel-200 dark:text-sky-pastel-800 relative z-10"
                    strokeWidth={1}
                  />
                </div>
              )}
              {/* Overlay with Status Badge */}
              <div className="absolute top-3 right-3 flex gap-2">
                {acc.isConfirmed ? (
                  <Badge
                    variant="confirmed"
                    className="shadow-lg backdrop-blur-md bg-sage-500/90 text-white border-none"
                  >
                    <CheckCircle size={10} />
                    Confirmed
                  </Badge>
                ) : (
                  <Badge
                    variant="option"
                    className="shadow-lg backdrop-blur-md bg-surface/90 text-text-primary border-none"
                  >
                    Option
                  </Badge>
                )}
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Date Visualization */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mb-1">
                    Check-in
                  </span>
                  <div className="flex flex-col items-center bg-surface-2 rounded-xl py-2 w-full border border-border shadow-xs">
                    <span className="text-[10px] font-black text-lavender-500 uppercase">
                      {formatDate(acc.checkIn, "MMM")}
                    </span>
                    <span className="font-bold text-lg text-text-primary">
                      {formatDate(acc.checkIn, "d")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center -mb-4">
                  <span className="text-[10px] text-text-muted font-bold whitespace-nowrap mb-1">
                    {nights} night{nights > 1 ? "s" : ""}
                  </span>
                  <div className="w-12 h-px bg-border group-hover:bg-lavender-300 transition-colors" />
                </div>

                <div className="flex flex-col items-center flex-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mb-1">
                    Check-out
                  </span>
                  <div className="flex flex-col items-center bg-surface-2 rounded-xl py-2 w-full border border-border shadow-xs">
                    <span className="text-[10px] font-black text-rose-pastel-500 uppercase">
                      {formatDate(acc.checkOut, "MMM")}
                    </span>
                    <span className="font-bold text-lg text-text-primary">
                      {formatDate(acc.checkOut, "d")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Essential Metadata */}
            <div className="px-5 py-4 space-y-3 flex-1">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-surface-3 flex items-center justify-center shrink-0 border border-border/50">
                  <MapPin size={12} className="text-text-secondary" />
                </div>
                <span className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {acc.location}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-surface-3 flex items-center justify-center shrink-0 border border-border/50">
                  <DollarSign size={12} className="text-text-secondary" />
                </div>
                <span className="text-xs text-text-secondary font-semibold">
                  {formatCurrency(acc.price, acc.currency)} total
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <div className="flex-1 min-w-0 bg-surface-2/50 p-2 rounded-lg border border-border/40 flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                    <DoorOpen size={10} />
                  </div>
                  <span className="text-[10px] truncate text-text-secondary font-medium">
                    After {acc.checkInAfter ?? "3 PM"}
                  </span>
                </div>
                <div className="flex-1 min-w-0 bg-surface-2/50 p-2 rounded-lg border border-border/40 flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <DoorClosedLocked size={10} />
                  </div>
                  <span className="text-[10px] truncate text-text-secondary font-medium">
                    Before {acc.checkOutBefore ?? "11 AM"}
                  </span>
                </div>
              </div>

              {acc.notes && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <p className="text-xs text-text-muted italic leading-relaxed line-clamp-2">
                    "{acc.notes}"
                  </p>
                </div>
              )}
            </div>
          </CardContent>

          {/* Integrated Actions */}
          <CardFooter
            className={cn(
              "border-t border-border flex justify-between items-center h-12 p-4 mt-auto transition-colors",
              acc.isConfirmed ? "bg-sage-50/30" : "bg-surface-2/40",
            )}
          >
            <div className="flex items-center gap-2">
              {acc.bookingLink && (
                <a
                  href={acc.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-lavender-600 transition-colors"
                >
                  <ExternalLink size={12} />
                  Booking
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!acc.isConfirmed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onConfirm(acc.id!)}
                  className="text-sage-600 hover:bg-sage-100/50 h-7 px-3 text-xs font-bold rounded-lg border border-transparent hover:border-sage-200"
                >
                  <CheckCircle size={12} className="mr-1" />
                  Confirm
                </Button>
              )}
              {acc.isConfirmed && (
                <div className="text-[10px] font-bold text-sage-500/80 uppercase tracking-widest hidden sm:block">
                  Verified Stay
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete(acc.id!);
          setDeleteOpen(false);
        }}
        title="Delete Accommodation"
        description={`Delete "${acc.name}"?`}
      />
    </>
  );
}
