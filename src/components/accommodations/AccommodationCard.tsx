import { useState } from "react";
import { motion } from "framer-motion";
import {
  Hotel,
  MapPin,
  Calendar,
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
import {
  formatDateTime,
  formatCurrency,
  cn,
  formatDate,
} from "@/lib/utils";
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
      >
        <Card
          hover
          className={cn([
            "overflow-hidden",
            acc.isConfirmed ? "border-sage-500 dark:border-sage-500" : "",
          ])}
        >
          <div className="flex flex-col sm:flex-row">
            <div className="p-3 shrink-0">
              <div className="w-full sm:w-[400px] h-80 rounded-xl overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                {acc.image ? (
                  <img src={acc.image} alt={acc.name} className="w-full h-full object-cover" />
                ) : (
                  <Hotel
                    size={48}
                    className="text-slate-300 dark:text-slate-700"
                    strokeWidth={1.5}
                  />
                )}
              </div>
            </div>

            <CardContent className="pt-4 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center shrink-0">
                    <Hotel size={16} className="text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-[20px] text-text-primary truncate">{acc.name}</h2>

                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="capitalize">{acc.type}</span>
                      {platform && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {platform.icon} {platform.label}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 justify-between mt-7 text-sm text-text-secondary">
                <span className="text-[10px]">
                  ({nights} night{nights > 1 ? "s" : ""})
                </span>

                <div className="flex items-center gap-3">
                  <MapPin size={25} />
                  <span>
                    {acc.location}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={17} />
                  <span>
                    {formatDateTime(acc.checkIn)} → {formatDateTime(acc.checkOut)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <DollarSign size={17} />
                    {formatCurrency(acc.price, acc.currency)} total
                  </span>
                </div>

                <div>
                  {acc.bookingLink && (
                    <a
                      href={acc.bookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-lavender-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                      View Booking
                    </a>
                  )}
                </div>
              </div>
              {acc.notes && (
                <p className="max-w-70 mt-2 overflow-auto text-xs text-text-muted bg-surface-3 rounded-lg px-3 py-2">
                  {acc.notes}
                </p>
              )}
            </CardContent>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex justify-center items-center gap-8 ">
              <div className="flex flex-col items-center">
                {formatDate(acc.checkIn, "MMM")}
                <div className="flex justify-center items-center font-bold w-11 h-11 rounded-full shadow-md dark:bg-gray-100/20 bg-gray-100">
                  {formatDate(acc.checkIn, "d")}
                </div>
              </div>

              <div className="mt-5.5 w-80 h-0.5 bg-gray-200"></div>

              <div className="flex flex-col items-center">
                {formatDate(acc.checkOut, "MMM")}
                <div className="flex justify-center items-center font-bold w-11 h-11 rounded-full shadow-md dark:bg-gray-100/20 bg-gray-100">
                  {formatDate(acc.checkOut, "d")}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 w-full">
              <div className="flex flex-1 items-center gap-3 font-semibold shadow-sm bg-surface-2 rounded-xl p-3 border border-border">
                <div className="flex items-center rounded-lg p-2 shadow-md bg-sky-600 shrink-0">
                  <DoorOpen className="text-white" size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                    Check-in
                  </span>
                  <span className="text-xs">After {acc.checkInAfter ?? "3 PM"}</span>
                </div>
              </div>

              <div className="flex flex-1 items-center gap-3 font-semibold shadow-sm bg-surface-2 rounded-xl p-3 border border-border">
                <div className="flex items-center rounded-lg p-2 shadow-md bg-rose-600 shrink-0">
                  <DoorClosedLocked className="text-white" size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                    Check-out
                  </span>
                  <span className="text-xs">Before {acc.checkOutBefore ?? "11 AM"}</span>
                </div>
              </div>
            </div>
          </div>

          <CardFooter className="h-15 justify-between">
            <div className="flex items-center gap-1 shrink-0">
              {acc.isConfirmed ? (
                <Badge variant="confirmed">
                  <CheckCircle size={10} />
                  Confirmed
                </Badge>
              ) : (
                <Badge variant="option">Option</Badge>
              )}
            </div>
            <div>
              {!acc.isConfirmed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onConfirm(acc.id!)}
                  className="text-lavender-600"
                >
                  <CheckCircle size={14} />
                  Confirm
                </Button>
              )}
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(acc)}>
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
