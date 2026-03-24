import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  ExternalLink,
  Trash2,
  CheckCircle,
  Clock,
  Plus,
  Edit3,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  formatDateTime,
  formatCurrency,
  calculateDuration,
  cn,
  formatDate,
  getCountryFlag,
} from "@/lib/utils";
import { format } from "date-fns";
import type { Flight, Currency } from "@/db/types";

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return "✈️";
  // Convert 3-letter to 2-letter for flags if possible, or just use first 2
  // For now, let's just use the first 2 letters of the ISO-3 code which often works or fallback
  const code = countryCode.length === 3 ? countryCode.substring(0, 2) : countryCode;
  const codePoints = code
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
        <Card
          hover
          className={cn([
            "overflow-hidden relative transition-all duration-300 flex flex-col h-full",
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
                  {calculateDuration(firstSeg.departureTime, lastSeg.arrivalTime)}
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
                        <span className="text-xs font-bold text-text-primary">
                          {seg.departureAirport}
                        </span>
                        <div className="w-4 h-px bg-text-muted/30" />
                        <span className="text-xs font-bold text-text-primary">
                          {seg.arrivalAirport}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted font-medium">
                        {calculateDuration(seg.departureTime, seg.arrivalTime)}
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
                          {`Layover: ${calculateDuration(seg.arrivalTime, flight.segments[i + 1].departureTime)} in ${seg.arrivalAirport}`}
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

interface FlightFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Flight, "id" | "createdAt">) => Promise<void>;
  initial?: Flight;
  tripId: number;
  lastFlight?: Flight;
  tripCountries?: TripCountry[];
}

export function FlightForm({
  open,
  onClose,
  onSave,
  initial,
  tripId,
  lastFlight,
  tripCountries = [],
}: FlightFormProps) {
  const [form, setForm] = useState({
    segments: initial?.segments?.map((s) => ({
      ...s,
    })) ?? [
      {
        airline: lastFlight?.segments[0]?.airline ?? "",
        flightNumber: lastFlight?.segments[0]?.flightNumber ?? "",
        departureAirport: "",
        arrivalAirport: "",
        departureTime: "",
        arrivalTime: "",
      },
    ],
    description: initial?.description ?? "",
    tripCountryId: initial?.tripCountryId ?? tripCountries[0]?.id ?? undefined,
    price: initial?.price?.toString() ?? "",
    currency: initial?.currency ?? (lastFlight?.currency || "USD"),
    bookingLink: initial?.bookingLink ?? "",
    notes: initial?.notes ?? "",
    isConfirmed: initial?.isConfirmed ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);

  React.useEffect(() => {
    fetch("/data/airports-search.json")
      .then((res) => res.json())
      .then((data) => setAirports(data))
      .catch((err) => console.error("Failed to load airports:", err));
  }, []);

  const addSegment = () => {
    const lastSegment = form.segments[form.segments.length - 1];
    setForm((f) => ({
      ...f,
      segments: [
        ...f.segments,
        {
          airline: lastSegment?.airline ?? "",
          flightNumber: lastSegment?.flightNumber ?? "",
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

  const moveSegment = (index: number, direction: "up" | "down") => {
    const newSegments = [...form.segments];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSegments.length) return;

    [newSegments[index], newSegments[targetIndex]] = [newSegments[targetIndex], newSegments[index]];

    setForm((f) => ({ ...f, segments: newSegments }));
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
  }, [airports]);

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
      description: form.description || undefined,
      tripCountryId: form.tripCountryId,
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
        <Input
          id="fl-description"
          label="Flight Description"
          placeholder="e.g. Outbound Journey, Internal Connection..."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
        <SearchableSelect
          id="fl-country"
          label="Country"
          placeholder="Select country..."
          value={form.tripCountryId?.toString() || ""}
          options={tripCountries.map((tc) => ({
            value: tc.id!.toString(),
            label: tc.countryName,
            icon: <span>{getCountryFlag(tc.countryName)}</span>,
          }))}
          onChange={(val: string) => set("tripCountryId", Number(val))}
          includeSearch={false}
        />

        {form.segments.map((seg, index) => (
          <div
            key={index}
            className="space-y-4 p-4 bg-surface-2 rounded-xl border border-border/50 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-lavender-600">
                  Leg {index + 1}
                </h4>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-text-muted hover:text-lavender-600 disabled:opacity-30"
                    onClick={() => moveSegment(index, "up")}
                    disabled={index === 0}
                  >
                    <ChevronUp size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-text-muted hover:text-lavender-600 disabled:opacity-30"
                    onClick={() => moveSegment(index, "down")}
                    disabled={index === form.segments.length - 1}
                  >
                    <ChevronDown size={18} />
                  </Button>
                </div>
              </div>
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
                label: "Description",
                render: (f: Flight) => f.description ?? "—",
              },
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
