import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plane, ExternalLink, Trash2, CheckCircle, Clock, Plus, Edit3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { formatDateTime, formatCurrency, calculateDuration } from "@/lib/utils";
import { format } from "date-fns";
import airportsData from "@/lib/airports.json";
import type { Flight, Currency } from "@/db/types";

const airports = airportsData as { name: string; iata: string; city: string; country: string }[];

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return "✈️";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

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
      >
        <Card className={flight.isConfirmed ? "border-sage-500 dark:border-sage-500" : ""}>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-pastel-100 dark:bg-sky-pastel-900/30 flex items-center justify-center shrink-0">
                  <Plane size={20} className="text-sky-pastel-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-text-primary truncate">
                    {airlines.length > 1 ? "Multiple Airlines" : firstSeg.airline}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {airlines.length > 1 ? `${flight.segments.length} legs` : firstSeg.flightNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {flight.isConfirmed ? (
                  <Badge variant="confirmed">
                    <CheckCircle size={10} />
                    Confirmed
                  </Badge>
                ) : (
                  <Badge variant="option">Option</Badge>
                )}
              </div>
            </div>

            {/* Vertical Segments Timeline */}
            <div className="relative pl-6 ml-2 space-y-6">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 border-l-2 border-dashed border-lavender-200 dark:border-lavender-900/30" />

              {flight.segments.map((seg, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[23px] top-1.5 w-4 h-4 rounded-full bg-surface border-2 border-lavender-400 z-10" />

                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-text-primary">
                          {format(new Date(seg.departureTime), "HH:mm")}
                        </span>
                        <span className="text-xs font-bold text-lavender-600">
                          {seg.departureAirport}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted font-medium mt-0.5">
                        {format(new Date(seg.departureTime), "EEE, MMM d")}
                      </p>
                    </div>

                    <div className="flex-1 text-right min-w-0">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-bold text-lavender-600">
                          {seg.arrivalAirport}
                        </span>
                        <span className="text-sm font-black text-text-primary">
                          {format(new Date(seg.arrivalTime), "HH:mm")}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted font-medium mt-0.5 text-right">
                        {format(new Date(seg.arrivalTime), "EEE, MMM d")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-px flex-1 bg-border/40" />
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        {seg.airline} {seg.flightNumber}
                      </p>
                      <span className="text-[10px] text-text-muted/60">•</span>
                      <p className="text-[10px] text-text-muted font-medium">
                        {calculateDuration(seg.departureTime, seg.arrivalTime)}
                      </p>
                    </div>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>

                  {i < flight.segments.length - 1 && (
                    <div className="mt-4 mb-2 py-1.5 px-3 bg-lavender-50 dark:bg-lavender-900/20 rounded-lg inline-flex items-center gap-2 border border-lavender-100 dark:border-lavender-900/10">
                      <Clock size={12} className="text-lavender-500" />
                      <span className="text-[10px] font-bold text-lavender-700 dark:text-lavender-400">
                        {calculateDuration(seg.arrivalTime, flight.segments[i + 1].departureTime)}{" "}
                        layover in {seg.arrivalAirport}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-lg font-black text-text-primary">
                  {formatCurrency(flight.price, flight.currency)}
                </span>
                {flight.bookingLink && (
                  <a
                    href={flight.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg hover:bg-surface-3 flex items-center justify-center text-text-secondary transition-colors"
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
                    className="text-lavender-600 h-8 font-bold"
                  >
                    Confirm
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" onClick={() => onEdit(flight)}>
                  <Edit3 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-rose-pastel-400 hover:text-rose-pastel-500"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            {flight.notes && (
              <p className="mt-4 text-xs text-text-muted italic bg-text-muted/5 p-3 rounded-xl border border-dashed border-border/50">
                {flight.notes}
              </p>
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

interface FlightFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Flight, "id" | "createdAt">) => Promise<void>;
  initial?: Flight;
  tripId: number;
}

export function FlightForm({ open, onClose, onSave, initial, tripId }: FlightFormProps) {
  const [form, setForm] = useState({
    segments: initial?.segments?.map((s) => ({
      ...s,
    })) ?? [
      {
        airline: "",
        flightNumber: "",
        departureAirport: "",
        arrivalAirport: "",
        departureTime: "",
        arrivalTime: "",
      },
    ],
    price: initial?.price?.toString() ?? "",
    currency: initial?.currency ?? "USD",
    bookingLink: initial?.bookingLink ?? "",
    notes: initial?.notes ?? "",
    isConfirmed: initial?.isConfirmed ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const addSegment = () => {
    const lastSegment = form.segments[form.segments.length - 1];
    setForm((f) => ({
      ...f,
      segments: [
        ...f.segments,
        {
          airline: lastSegment?.airline ?? "",
          flightNumber: "",
          departureAirport: lastSegment?.arrivalAirport ?? "",
          arrivalAirport: "",
          departureTime: "",
          arrivalTime: "",
        },
      ],
    }));
  };

  const removeSegment = (index: number) => {
    if (form.segments.length <= 1) return;
    setForm((f) => ({
      ...f,
      segments: f.segments.filter((_, i) => i !== index),
    }));
  };

  const updateSegment = (index: number, k: string, v: string) => {
    setForm((f) => ({
      ...f,
      segments: f.segments.map((s, i) => (i === index ? { ...s, [k]: v } : s)),
    }));
  };

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const airportOptions = React.useMemo(() => {
    return airports.map((ap) => ({
      value: ap.iata,
      label: `${ap.iata} - ${ap.name}`,
      sublabel: `${ap.city}, ${ap.country}`,
      icon: getFlagEmoji(ap.country),
      country: ap.country,
    }));
  }, []);

  const filteredArrivalOptions = React.useMemo(() => {
    return airportOptions;
  }, [airportOptions]);

  const CURRENCIES = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "ZAR", label: "ZAR" },
  ];

  const validate = () => {
    const e: Record<string, string> = {};

    form.segments.forEach((seg, i) => {
      if (!seg.airline.trim()) e[`seg-air-${i}`] = "Required";
      if (!seg.flightNumber.trim()) e[`seg-num-${i}`] = "Required";
      if (!seg.departureAirport.trim()) e[`seg-dep-ap-${i}`] = "Required";
      if (!seg.arrivalAirport.trim()) e[`seg-arr-ap-${i}`] = "Required";
      if (!seg.departureTime) e[`seg-dep-t-${i}`] = "Required";
      if (!seg.arrivalTime) e[`seg-arr-t-${i}`] = "Required";

      if (seg.departureTime && seg.arrivalTime) {
        if (new Date(seg.arrivalTime) < new Date(seg.departureTime)) {
          e[`seg-arr-t-${i}`] = "Must be after departure";
        }
      }

      if (i > 0) {
        const prevSeg = form.segments[i - 1];
        if (prevSeg.arrivalTime && seg.departureTime) {
          if (new Date(seg.departureTime) < new Date(prevSeg.arrivalTime)) {
            e[`seg-dep-t-${i}`] = "Must be after previous arrival";
          }
        }
      }
    });

    if (!form.price || isNaN(Number(form.price))) e.price = "Valid price required";

    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSaving(true);
    await onSave({
      tripId,
      segments: form.segments,
      price: Number(form.price),
      currency: form.currency as Currency,
      bookingLink: form.bookingLink || undefined,
      notes: form.notes || undefined,
      isConfirmed: form.isConfirmed,
    });
    setSaving(true); // Keep saving state until onClose
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Flight" : "Add Flight"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Flight"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {form.segments.map((seg, index) => (
          <div
            key={index}
            className="space-y-4 p-4 bg-surface-2 rounded-xl border border-border/50 relative"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-lavender-600">
                Leg {index + 1}
              </h4>
              {form.segments.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-rose-pastel-400 hover:text-rose-pastel-500"
                  onClick={() => removeSegment(index)}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                id={`seg-air-${index}`}
                label="Airline"
                placeholder="e.g. Emirates"
                value={seg.airline}
                onChange={(e) => updateSegment(index, "airline", e.target.value)}
                error={errors[`seg-air-${index}`]}
              />
              <Input
                id={`seg-num-${index}`}
                label="Flight Number"
                placeholder="e.g. EK201"
                value={seg.flightNumber}
                onChange={(e) => updateSegment(index, "flightNumber", e.target.value)}
                error={errors[`seg-num-${index}`]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SearchableSelect
                id={`seg-dep-ap-${index}`}
                label="Departure Airport"
                placeholder="Search..."
                options={airportOptions}
                value={seg.departureAirport}
                onChange={(val: string) => updateSegment(index, "departureAirport", val)}
                error={errors[`seg-dep-ap-${index}`]}
              />
              <SearchableSelect
                id={`seg-arr-ap-${index}`}
                label="Arrival Airport"
                placeholder="Search..."
                options={
                  index === form.segments.length - 1 ? filteredArrivalOptions : airportOptions
                }
                value={seg.arrivalAirport}
                onChange={(val: string) => updateSegment(index, "arrivalAirport", val)}
                error={errors[`seg-arr-ap-${index}`]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DatePicker
                id={`seg-dep-t-${index}`}
                label="Departure Time"
                showTime
                value={seg.departureTime}
                onChange={(date) => {
                  if (date)
                    updateSegment(index, "departureTime", format(date, "yyyy-MM-dd'T'HH:mm"));
                }}
                error={errors[`seg-dep-t-${index}`]}
              />
              <DatePicker
                id={`seg-arr-t-${index}`}
                label="Arrival Time"
                showTime
                value={seg.arrivalTime}
                onChange={(date) => {
                  if (date) updateSegment(index, "arrivalTime", format(date, "yyyy-MM-dd'T'HH:mm"));
                }}
                disabled={
                  seg.departureTime
                    ? { before: new Date(new Date(seg.departureTime).setHours(0, 0, 0, 0)) }
                    : undefined
                }
                error={errors[`seg-arr-t-${index}`]}
              />
            </div>

            {index < form.segments.length - 1 && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-lavender-50 dark:bg-lavender-900/30 rounded-full border border-lavender-100 dark:border-lavender-900/20">
                <p className="text-[10px] font-bold text-lavender-600 uppercase tracking-tighter">
                  Layover
                </p>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={addSegment}
            className="text-lavender-600 hover:bg-lavender-50 group gap-2"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform" />
            Add Another Leg
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="col-span-2">
            <Input
              id="fl-price"
              label="Total Price"
              type="number"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              error={errors.price}
            />
          </div>
          <SearchableSelect
            id="fl-currency"
            label="Currency"
            placeholder="Search..."
            value={form.currency}
            options={CURRENCIES}
            onChange={(val: string) => set("currency", val)}
            includeSearch={false}
          />
        </div>

        <Input
          id="fl-link"
          label="Booking Link (optional)"
          placeholder="https://..."
          value={form.bookingLink}
          onChange={(e) => set("bookingLink", e.target.value)}
        />
        <Textarea
          id="fl-notes"
          label="Notes (optional)"
          placeholder="Seat preference, baggage info..."
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isConfirmed}
            onChange={(e) => set("isConfirmed", e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-text-primary">Mark as confirmed</span>
        </label>
      </div>
    </Modal>
  );
}

interface FlightComparisonProps {
  open: boolean;
  onClose: () => void;
  flights: Flight[];
}

export function FlightComparison({ open, onClose, flights }: FlightComparisonProps) {
  return (
    <Modal open={open} onClose={onClose} title="Compare Flights" size="xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-text-muted font-medium">Field</th>
              {flights.map((f) => {
                const firstSeg = f.segments[0];
                return (
                  <th key={f.id} className="text-left py-2 px-4 text-text-primary font-semibold">
                    {firstSeg.airline} {firstSeg.flightNumber}
                    {f.segments.length > 1 && (
                      <span className="block text-[10px] text-text-muted font-normal mt-0.5">
                        +{f.segments.length - 1} more legs
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              {
                label: "Route",
                render: (f: Flight) => {
                  const first = f.segments[0];
                  const last = f.segments[f.segments.length - 1];
                  return `${first.departureAirport} → ${last.arrivalAirport}`;
                },
              },
              {
                label: "Departure",
                render: (f: Flight) => formatDateTime(f.segments[0].departureTime),
              },
              {
                label: "Arrival",
                render: (f: Flight) =>
                  formatDateTime(f.segments[f.segments.length - 1].arrivalTime),
              },
              { label: "Price", render: (f: Flight) => formatCurrency(f.price, f.currency) },
              {
                label: "Layovers",
                render: (f: Flight) =>
                  f.segments.length > 1
                    ? f.segments
                        .slice(0, -1)
                        .map(
                          (s, i) =>
                            `${s.arrivalAirport} (${calculateDuration(s.arrivalTime, f.segments[i + 1].departureTime)})`,
                        )
                        .join(", ")
                    : "Direct",
              },
              {
                label: "Status",
                render: (f: Flight) => (f.isConfirmed ? "✅ Confirmed" : "Option"),
              },
              { label: "Notes", render: (f: Flight) => f.notes ?? "—" },
            ].map((row) => (
              <tr key={row.label}>
                <td className="py-2.5 pr-4 text-text-muted font-medium">{row.label}</td>
                {flights.map((f) => (
                  <td key={f.id} className="py-2.5 px-4 text-text-primary">
                    {row.render(f)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
