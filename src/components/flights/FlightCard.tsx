import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, ExternalLink, Trash2, CheckCircle, Clock, Edit3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { formatDateTime, formatCurrency, calculateDuration, cn, formatDate, getTimezoneAbbr } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { Flight } from "@/db/types";

interface FlightCardProps {
  flight: Flight;
  onEdit: (f: Flight) => void;
  onDelete: (id: number) => void;
  onConfirm: (id: number) => void;
}

export function FlightCard({ flight, onEdit, onDelete, onConfirm }: FlightCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const airlines = Array.from(new Set(flight.segments.map((s) => s.airline)));
  const firstSeg = flight.segments[0];
  const lastSeg = flight.segments[flight.segments.length - 1];

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-full xl:w-[650px]"
      >
        <Card
          hover
          className={cn([
            "overflow-hidden relative transition-all duration-300 flex flex-col h-full w-full",
            flight.isConfirmed
              ? "border-sage-400 dark:border-sage-500 bg-sage-50/30 dark:bg-sage-900/10 shadow-sage-100/50"
              : "",
          ])}
        >
          {/* Header area with Airline info */}
          <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center shrink-0 shadow-md">
                <Plane size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                {flight.description && (
                  <p className="text-[10px] font-bold text-lavender-600 uppercase tracking-wider mb-0.5">
                    {flight.description}
                  </p>
                )}
                <h3 className="font-bold text-base text-text-primary truncate">
                  {airlines.length > 1 ? "Multiple Airlines" : firstSeg.airline}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-text-muted">
                    {airlines.length > 1 ? `${flight.segments.length} legs` : firstSeg.flightNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-0 flex-1 flex flex-col">
            {/* Centered Journey Layout */}
            <div className="p-6 flex flex-col items-center">
              <div className="flex justify-center items-center gap-8 w-full max-w-md">
                {/* Departure Date */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-text-muted mb-1">
                    {formatDate(firstSeg.departureTime, "MMM")}
                  </span>
                  <div className="flex justify-center items-center font-bold text-lg w-12 h-12 rounded-full shadow-md dark:bg-gray-100/20 bg-gray-100">
                    {formatDate(firstSeg.departureTime, "d")}
                  </div>
                  <span className="text-sm font-black text-text-primary mt-2">
                    {format(new Date(firstSeg.departureTime), "HH:mm")}
                    <span className="ml-1 text-[10px] text-text-muted font-normal">
                      {getTimezoneAbbr(firstSeg.departureTime, firstSeg.departureTimezone)}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-lavender-600 uppercase">
                    {firstSeg.departureAirport}
                  </span>
                </div>

                {/* Connection Line */}
                <div className="flex-1 mt-2 relative">
                  <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface p-1 rounded-full border border-border shadow-sm">
                    <Plane size={14} className="text-sky-600" />
                  </div>
                </div>

                {/* Arrival Date */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-text-muted mb-1">
                    {formatDate(lastSeg.arrivalTime, "MMM")}
                  </span>
                  <div className="flex justify-center items-center font-bold text-lg w-12 h-12 rounded-full shadow-md dark:bg-gray-100/20 bg-gray-100">
                    {formatDate(lastSeg.arrivalTime, "d")}
                  </div>
                  <span className="text-sm font-black text-text-primary mt-2">
                    {format(new Date(lastSeg.arrivalTime), "HH:mm")}
                    <span className="ml-1 text-[10px] text-text-muted font-normal">
                      {getTimezoneAbbr(lastSeg.arrivalTime, lastSeg.arrivalTimezone)}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-lavender-600 uppercase">
                    {lastSeg.arrivalAirport}
                  </span>
                </div>
              </div>

              {/* Total Duration Info */}
              <div className="mt-4 px-3 py-1 bg-surface-2 rounded-full border border-border flex items-center gap-2">
                <Clock size={12} className="text-text-muted" />
                <span className="text-[11px] font-medium text-text-secondary">
                  Total Travel Time:
                  {calculateDuration(firstSeg.departureTime, lastSeg.arrivalTime, {
                    startTimeZone: firstSeg.departureTimezone ?? "UTC",
                    endTimeZone: lastSeg.arrivalTimezone ?? "UTC",
                  })}
                </span>
              </div>
            </div>

            {/* Detailed Segments (Collapsible or visible) */}
            <div className="px-6 pb-6 space-y-4">
              <div className="h-px bg-border/50" />
              <div className="space-y-3">
                {flight.segments.map((seg, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-border/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-primary">
                            {format(parseISO(seg.departureTime), "HH:mm")}
                            <span className="ml-1 text-[10px] text-text-muted font-normal">
                              {getTimezoneAbbr(seg.departureTime, seg.departureTimezone)}
                            </span>
                          </span>
                          <span className="text-[10px] text-text-muted font-medium">
                            {seg.departureAirport}
                          </span>
                        </div>
                        <div className="w-4 h-px bg-text-muted/30" />
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-text-primary">
                            {format(parseISO(seg.arrivalTime), "HH:mm")}
                            <span className="ml-1 text-[10px] text-text-muted font-normal">
                              {getTimezoneAbbr(seg.arrivalTime, seg.arrivalTimezone)}
                            </span>
                          </span>
                          <span className="text-[10px] text-text-muted font-medium text-right">
                            {seg.arrivalAirport}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-text-muted font-medium">
                        {calculateDuration(seg.departureTime, seg.arrivalTime, {
                          startTimeZone: seg.departureTimezone ?? "UTC",
                          endTimeZone: seg.arrivalTimezone ?? "UTC",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
                      <span>
                        {seg.airline} {seg.flightNumber}
                      </span>
                      <span>{formatDateTime(seg.departureTime)}</span>
                    </div>
                    {i < flight.segments.length - 1 && (
                      <div className="mt-2 py-1 px-2 bg-lavender-500/20 rounded-md border border-lavender-900/10 flex items-center gap-2">
                        <Clock size={10} className="text-lavender-500" />
                        <span className="text-[9px] font-bold text-lavender-700 dark:text-lavender-400">
                          {`Layover: ${calculateDuration(seg.arrivalTime, flight.segments[i + 1].departureTime, {
                            startTimeZone: seg.arrivalTimezone ?? "UTC",
                            endTimeZone: flight.segments[i + 1].departureTimezone ?? "UTC",
                          })} in ${seg.arrivalAirport}`}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto px-6 py-4 border-t border-border flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/10">
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-text-primary">
                  {formatCurrency(flight.price, flight.currency)}
                </span>
                {flight.bookingLink && (
                  <a
                    href={flight.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg hover:bg-surface-3 flex items-center justify-center text-lavender-600 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1">
                {!flight.isConfirmed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onConfirm(flight.id!)}
                    className="text-lavender-600 font-bold hover:bg-lavender-50"
                  >
                    <CheckCircle size={14} className="mr-1.5" />
                    Confirm
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" onClick={() => onEdit(flight)}>
                  <Edit3 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-rose-pastel-400 hover:text-rose-pastel-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            {flight.notes && (
              <div className="px-6 pb-6 pt-0">
                <p className="text-xs text-text-muted italic bg-surface-2 p-3 rounded-xl border border-dashed border-border/50">
                  "{flight.notes}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete(flight.id!);
          setDeleteOpen(false);
        }}
        title="Delete Flight"
        description={`Delete this journey to ${lastSeg.arrivalAirport}?`}
      />
    </>
  );
}
