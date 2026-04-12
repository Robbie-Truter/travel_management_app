import React, { useState } from "react";
import { Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { getFlagEmoji } from "@/lib/utils";
import { format } from "date-fns";
import type { Flight, Currency, TripCountry } from "@/db/types";

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

interface FlightFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Flight, "id" | "createdAt">) => Promise<void>;
  initial?: Flight;
  tripId: number;
  lastFlight?: Flight;
  tripCountries?: TripCountry[];
  tripStartDate: string;
  tripEndDate: string;
  tripCurrency: Currency;
}

export function FlightForm({
  open,
  onClose,
  onSave,
  initial,
  tripId,
  lastFlight,
  tripCountries = [],
  tripStartDate,
  tripEndDate,
  tripCurrency,
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
        departureTime: tripStartDate,
        arrivalTime: tripStartDate,
      },
    ],
    description: initial?.description ?? "",
    tripCountryId: initial?.tripCountryId ?? tripCountries[0]?.id ?? undefined,
    price: initial?.price?.toString() ?? "",
    currency: initial?.currency ?? tripCurrency,
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
          departureTime: lastSegment?.arrivalTime ?? tripStartDate,
          arrivalTime: lastSegment?.arrivalTime ?? tripStartDate,
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

  const set = (k: string, v: string | boolean | number) => setForm((f) => ({ ...f, [k]: v }));

  const airportOptions = React.useMemo(() => {
    return airports.map((ap) => ({
      value: ap.iata,
      label: `${ap.iata} - ${ap.name}`,
      sublabel: `${ap.city}, ${ap.country}`,
      icon: getFlagEmoji(ap.country),
      country: ap.country,
    }));
  }, [airports]);

  const validate = () => {
    const e: Record<string, string> = {};

    form.segments.forEach((seg, i) => {
      if (!seg.airline.trim()) e[`seg-air-${i}`] = "Airline is required";
      if (!seg.departureAirport.trim()) e[`seg-dep-ap-${i}`] = "Departure airport is required";
      if (!seg.arrivalAirport.trim()) e[`seg-arr-ap-${i}`] = "Arrival airport is required";
      if (!seg.departureTime) e[`seg-dep-t-${i}`] = "Departure time is required";
      if (!seg.arrivalTime) e[`seg-arr-t-${i}`] = "Arrival time is required";

      if (seg.departureTime && seg.arrivalTime) {
        if (new Date(seg.arrivalTime) < new Date(seg.departureTime)) {
          e[`seg-arr-t-${i}`] = "Arrival must be after departure";
        }
      }

      if (i > 0) {
        const prevSeg = form.segments[i - 1];
        if (prevSeg.arrivalTime && seg.departureTime) {
          if (new Date(seg.departureTime) < new Date(prevSeg.arrivalTime)) {
            e[`seg-dep-t-${i}`] = "Must be after previous leg's arrival";
          }
        }
      }
    });

    if (!form.tripCountryId) e.tripCountryId = "Destination country is required";
    return e;
  };

  const handleClose = () => {
    setForm({
      segments: initial?.segments?.map((s) => ({
        ...s,
      })) ?? [
        {
          airline: lastFlight?.segments[0]?.airline ?? "",
          flightNumber: lastFlight?.segments[0]?.flightNumber ?? "",
          departureAirport: "",
          arrivalAirport: "",
          departureTime: tripStartDate,
          arrivalTime: tripStartDate,
        },
      ],
      description: initial?.description ?? "",
      tripCountryId: initial?.tripCountryId ?? tripCountries[0]?.id ?? undefined,
      price: initial?.price?.toString() ?? "",
      currency: initial?.currency ?? tripCurrency,
      bookingLink: initial?.bookingLink ?? "",
      notes: initial?.notes ?? "",
      isConfirmed: initial?.isConfirmed ?? false,
    });
    setErrors({});
    onClose();
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
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={initial ? "Edit Flight" : "Add Flight"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
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
          label="Country To"
          searchHint="End destination country"
          placeholder="Select country.."
          value={form.tripCountryId?.toString() || ""}
          options={tripCountries.map((tc) => ({
            value: tc.id!.toString(),
            label: tc.countryName,
            icon: <span>{getFlagEmoji(tc.countryCode)}</span>,
          }))}
          onChange={(val: string) => set("tripCountryId", Number(val))}
          includeSearch={false}
          error={errors.tripCountryId}
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
                options={airportOptions}
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
                disabled={{ before: new Date(tripStartDate), after: new Date(tripEndDate) }}
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
                disabled={[
                  { before: new Date(tripStartDate), after: new Date(tripEndDate) },
                  ...(seg.departureTime
                    ? [{ before: new Date(new Date(seg.departureTime).setHours(0, 0, 0, 0)) }]
                    : []),
                ]}
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
              label={`Total Price (${tripCurrency})`}
              type="number"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </div>
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
