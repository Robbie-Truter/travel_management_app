import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  DollarSign,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import type { Flight, Currency } from "@/db/types";

interface FlightCardProps {
  flight: Flight;
  onEdit: (f: Flight) => void;
  onDelete: (id: number) => void;
  onConfirm: (id: number) => void;
}

export function FlightCard({ flight, onEdit, onDelete, onConfirm }: FlightCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

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

            {/* Route */}
            <div className="mt-3 flex items-center gap-2 text-sm">
              <div className="text-center">
                <p className="font-bold text-text-primary">{flight.departureAirport}</p>
                <p className="text-xs text-text-muted">{formatDateTime(flight.departureTime)}</p>
              </div>
              <div className="flex-1 flex items-center gap-1 text-text-muted">
                <div className="flex-1 h-px bg-border" />
                <ArrowRight size={14} />
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="text-center">
                <p className="font-bold text-text-primary">{flight.arrivalAirport}</p>
                <p className="text-xs text-text-muted">{formatDateTime(flight.arrivalTime)}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <DollarSign size={13} />
                {formatCurrency(flight.price, flight.currency)}
              </span>
              {flight.bookingLink && (
                <a
                  href={flight.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-lavender-500 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                  Book
                </a>
              )}
            </div>
            {flight.notes && (
              <p className="mt-2 text-xs text-text-muted bg-surface-3 rounded-lg px-3 py-2">
                {flight.notes}
              </p>
            )}
          </CardContent>
          <CardFooter className="justify-end">
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
    bookingLink: initial?.bookingLink ?? "",
    notes: initial?.notes ?? "",
    isConfirmed: initial?.isConfirmed ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

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
      airline: form.airline,
      flightNumber: form.flightNumber,
      departureAirport: form.departureAirport,
      arrivalAirport: form.arrivalAirport,
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      price: Number(form.price),
      currency: form.currency as Currency,
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
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="fl-dep-ap"
            label="Departure Airport"
            placeholder="e.g. JFK"
            value={form.departureAirport}
            onChange={(e) => set("departureAirport", e.target.value)}
            error={errors.departureAirport}
          />
          <Input
            id="fl-arr-ap"
            label="Arrival Airport"
            placeholder="e.g. DXB"
            value={form.arrivalAirport}
            onChange={(e) => set("arrivalAirport", e.target.value)}
            error={errors.arrivalAirport}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="fl-dep-t"
            label="Departure Time"
            type="datetime-local"
            value={form.departureTime}
            onChange={(e) => set("departureTime", e.target.value)}
            error={errors.departureTime}
          />
          <Input
            id="fl-arr-t"
            label="Arrival Time"
            type="datetime-local"
            value={form.arrivalTime}
            onChange={(e) => set("arrivalTime", e.target.value)}
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
          <Select
            id="fl-currency"
            label="Currency"
            value={form.currency}
            options={CURRENCIES}
            onChange={(e) => set("currency", e.target.value)}
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
