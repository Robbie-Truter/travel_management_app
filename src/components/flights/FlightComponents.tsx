import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plane, ExternalLink, Edit, Trash2, CheckCircle, Clock, Plus, Minus } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatDuration,
  minutesToTime,
  timeToMinutes,
  calculateDuration,
} from "@/lib/utils";
import { format } from "date-fns";
import { useTrip } from "@/hooks/useTrips";
import { COUNTRIES } from "@/lib/countries";
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

  const totalDuration = calculateDuration(flight.departureTime, flight.arrivalTime);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Card className={flight.isConfirmed ? "border-sage-500 dark:border-sage-500" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sky-pastel-100 dark:bg-sky-pastel-900/30 flex items-center justify-center shrink-0">
                  <Plane size={16} className="text-sky-pastel-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-text-primary">{flight.airline}</p>
                  <p className="text-xs text-text-muted">{flight.flightNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {flight.isConfirmed && (
                  <Badge variant="confirmed">
                    <CheckCircle size={10} />
                    Confirmed
                  </Badge>
                )}
                {!flight.isConfirmed && <Badge variant="option">Option</Badge>}
              </div>
            </div>

            {/* Dates Row */}
            <div className="mt-4 flex justify-between text-[11px] text-text-muted font-medium px-1">
              <span>{formatDate(flight.departureTime, "MMM d, EEEE")}</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {formatDuration(totalDuration)}
              </span>
              <span>{formatDate(flight.arrivalTime, "MMM d, EEEE")}</span>
            </div>

            {/* Route */}
            <div className="mt-1 flex items-center gap-2 text-sm overflow-x-auto pb-1 no-scrollbar">
              <div className="text-center shrink-0">
                <p className="font-bold text-lg text-text-primary leading-tight">
                  {flight.departureAirport}
                </p>
                <p className="text-xs font-semibold text-text-secondary">
                  {formatDate(flight.departureTime, "HH:mm")}
                </p>
              </div>

              {flight.stops?.map((stop, i) => (
                <React.Fragment key={i}>
                  <div className="flex-1 min-w-[30px] flex items-center gap-1 text-text-muted">
                    <div className="flex-1 h-px bg-border border-dashed border-t-2" />
                  </div>
                  <div className="text-center shrink-0">
                    <p className="font-bold text-text-secondary text-xs">{stop.airport}</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/20 px-1.5 rounded-full">
                      {formatDuration(stop.duration)}
                    </p>
                  </div>
                </React.Fragment>
              ))}

              <div className="flex-1 min-w-[30px] flex items-center gap-1 text-text-muted">
                <div className="flex-1 h-px bg-border border-dashed border-t-2" />
              </div>

              <div className="text-center shrink-0">
                <p className="font-bold text-lg text-text-primary leading-tight">
                  {flight.arrivalAirport}
                </p>
                <p className="text-xs font-semibold text-text-secondary">
                  {formatDate(flight.arrivalTime, "HH:mm")}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1 font-semibold text-text-primary bg-green-100 px-2 py-1 rounded-md">
                {formatCurrency(flight.price, flight.currency)}
              </span>

              {flight.stops && flight.stops.length > 0 && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <Clock size={12} />
                  {flight.stops.length} {flight.stops.length > 1 ? "stops" : "stop"}
                </span>
              )}

              {flight.bookingLink && (
                <a
                  href={flight.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-lavender-500 hover:underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                  View Booking
                </a>
              )}
            </div>

            {flight.notes && (
              <p className="mt-3 text-xs text-text-muted bg-surface-3/50 rounded-lg px-3 py-2 border border-border/30">
                {flight.notes}
              </p>
            )}
          </CardContent>
          <CardFooter className="justify-end border-t border-border/50 mt-2 pt-2">
            {!flight.isConfirmed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onConfirm(flight.id!)}
                className="text-lavender-600"
              >
                <CheckCircle size={14} /> Confirm
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(flight)}>
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
          </CardFooter>
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
        description={`Delete ${flight.airline} ${flight.flightNumber}?`}
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
    airline: initial?.airline ?? "",
    flightNumber: initial?.flightNumber ?? "",
    departureAirport: initial?.departureAirport ?? "",
    arrivalAirport: initial?.arrivalAirport ?? "",
    departureTime: initial?.departureTime ?? "",
    arrivalTime: initial?.arrivalTime ?? "",
    price: initial?.price?.toString() ?? "",
    currency: initial?.currency ?? "USD",
    stops:
      initial?.stops?.map((s) => ({ airport: s.airport, duration: minutesToTime(s.duration) })) ??
      [],
    bookingLink: initial?.bookingLink ?? "",
    notes: initial?.notes ?? "",
    isConfirmed: initial?.isConfirmed ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showAllAirports] = useState(false);

  const trip = useTrip(tripId);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const addStop = () => {
    setForm((f) => ({
      ...f,
      stops: [...f.stops, { airport: "", duration: "00:00" }],
    }));
  };

  const removeStop = (index: number) => {
    setForm((f) => ({
      ...f,
      stops: f.stops.filter((_, i) => i !== index),
    }));
  };

  const updateStop = (index: number, k: string, v: string) => {
    setForm((f) => ({
      ...f,
      stops: f.stops.map((s, i) => (i === index ? { ...s, [k]: v } : s)),
    }));
  };

  const tripCountryCode = React.useMemo(() => {
    if (!trip?.destination) return undefined;
    return COUNTRIES.find((c) => c.name === trip.destination)?.code;
  }, [trip]);

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
    if (!tripCountryCode || showAllAirports) return airportOptions;
    return airportOptions.filter((ap) => ap.country === tripCountryCode);
  }, [airportOptions, tripCountryCode, showAllAirports]);

  const filteredDepartureOptions = React.useMemo(() => {
    if (showAllAirports) return airportOptions;
    // For departure, if we're flying TO a destination, we're likely coming from elsewhere.
    // But we'll show destination airports too in case of domestic flights.
    return airportOptions;
  }, [airportOptions, showAllAirports]);

  const CURRENCIES = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "ZAR", label: "ZAR" },
  ];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.airline.trim()) e.airline = "Required";
    if (!form.flightNumber.trim()) e.flightNumber = "Required";
    if (!form.departureAirport.trim()) e.departureAirport = "Required";
    if (!form.arrivalAirport.trim()) e.arrivalAirport = "Required";
    if (!form.departureTime) e.departureTime = "Required";
    if (!form.arrivalTime) e.arrivalTime = "Required";

    if (form.departureTime && form.arrivalTime) {
      if (new Date(form.arrivalTime) < new Date(form.departureTime)) {
        e.arrivalTime = "Must be after departure";
      }
    }

    if (!form.price || isNaN(Number(form.price))) e.price = "Valid price required";

    form.stops.forEach((stop, i) => {
      if (!stop.airport) e[`stop-ap-${i}`] = "Required";
      if (!stop.duration) e[`stop-dur-${i}`] = "Required";
    });

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
      airline: form.airline,
      flightNumber: form.flightNumber,
      departureAirport: form.departureAirport,
      arrivalAirport: form.arrivalAirport,
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      price: Number(form.price),
      currency: form.currency as Currency,
      stops: form.stops.map((s) => ({ airport: s.airport, duration: timeToMinutes(s.duration) })),
      bookingLink: form.bookingLink || undefined,
      notes: form.notes || undefined,
      isConfirmed: form.isConfirmed,
    });
    setSaving(false);
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
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="fl-airline"
            label="Airline"
            placeholder="e.g. Emirates"
            value={form.airline}
            onChange={(e) => set("airline", e.target.value)}
            error={errors.airline}
          />
          <Input
            id="fl-num"
            label="Flight Number"
            placeholder="e.g. EK201"
            value={form.flightNumber}
            onChange={(e) => set("flightNumber", e.target.value)}
            error={errors.flightNumber}
          />
        </div>
        <div className="space-y-3">
          <SearchableSelect
            id="fl-dep-ap"
            label="Departure Airport"
            placeholder="Search airport..."
            options={filteredDepartureOptions}
            value={form.departureAirport}
            onChange={(val: string) => set("departureAirport", val)}
            error={errors.departureAirport}
          />

          {/* Stops Section */}
          <div className="space-y-3 relative pl-4 border-l-2 border-dashed border-lavender-200 ml-4 py-2">
            {form.stops.map((stop, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 items-end bg-surface-2 p-3 rounded-lg border border-border/50 relative"
              >
                <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-lavender-400 border-2 border-white shadow-sm" />
                <div className="col-span-6">
                  <SearchableSelect
                    id={`stop-ap-${index}`}
                    label={`Stop ${index + 1}`}
                    placeholder="Airport..."
                    options={airportOptions}
                    value={stop.airport}
                    onChange={(val: string) => updateStop(index, "airport", val)}
                    error={errors[`stop-ap-${index}`]}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    id={`stop-dur-${index}`}
                    label="Layover (HH:mm)"
                    type="time"
                    value={stop.duration}
                    onChange={(e) => updateStop(index, "duration", e.target.value)}
                    error={errors[`stop-dur-${index}`]}
                  />
                </div>
                <div className="col-span-2 pb-1 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-rose-pastel-400 hover:text-rose-pastel-500"
                    onClick={() => removeStop(index)}
                  >
                    <Minus size={16} />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-center -ml-4">
              <button
                type="button"
                onClick={addStop}
                className="group flex items-center justify-center w-8 h-8 rounded-full bg-lavender-50 border border-lavender-200 text-lavender-600 hover:bg-lavender-500 hover:text-white transition-all shadow-sm"
                title="Add Layover"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <SearchableSelect
            id="fl-arr-ap"
            label="Arrival Airport"
            placeholder="Search airport..."
            options={filteredArrivalOptions}
            value={form.arrivalAirport}
            onChange={(val: string) => set("arrivalAirport", val)}
            error={errors.arrivalAirport}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DatePicker
            id="fl-dep-t"
            label="Departure Time"
            showTime
            value={form.departureTime}
            onChange={(date) => {
              if (date) set("departureTime", format(date, "yyyy-MM-dd'T'HH:mm"));
            }}
            error={errors.departureTime}
          />
          <DatePicker
            id="fl-arr-t"
            label="Arrival Time"
            showTime
            value={form.arrivalTime}
            onChange={(date) => {
              if (date) set("arrivalTime", format(date, "yyyy-MM-dd'T'HH:mm"));
            }}
            disabled={
              form.departureTime
                ? { before: new Date(new Date(form.departureTime).setHours(0, 0, 0, 0)) }
                : undefined
            }
            error={errors.arrivalTime}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              id="fl-price"
              label="Price"
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
            placeholder="Search currency..."
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
              {flights.map((f) => (
                <th key={f.id} className="text-left py-2 px-4 text-text-primary font-semibold">
                  {f.airline} {f.flightNumber}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              {
                label: "Route",
                render: (f: Flight) => `${f.departureAirport} → ${f.arrivalAirport}`,
              },
              { label: "Departure", render: (f: Flight) => formatDateTime(f.departureTime) },
              { label: "Arrival", render: (f: Flight) => formatDateTime(f.arrivalTime) },
              { label: "Price", render: (f: Flight) => formatCurrency(f.price, f.currency) },
              {
                label: "Layovers",
                render: (f: Flight) =>
                  f.stops && f.stops.length > 0
                    ? `${f.stops.length} stops (${f.stops.map((s) => s.airport).join(", ")})`
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
