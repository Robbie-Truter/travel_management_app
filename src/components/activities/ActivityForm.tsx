import { useState, useRef } from "react";
import { Image as ImageIcon, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { fileToBase64, getFlagEmoji } from "@/lib/utils";
import type { Activity, Currency, TripCountry, Destination } from "@/db/types";
import { ACTIVITY_TAGS } from "./activity-types";
import { useTripAvailability } from "@/hooks/useTripAvailability";

interface ActivityFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Activity, "id" | "createdAt">) => Promise<void>;
  initial?: Activity;
  tripId: number;
  tripCountries?: TripCountry[];
  destinations?: Destination[];
  tripStartDate: string;
  tripEndDate: string;
  tripCurrency: Currency;
}

export function ActivityForm({
  open,
  onClose,
  onSave,
  initial,
  tripId,
  tripCountries = [],
  destinations = [],
  tripStartDate,
  tripEndDate,
  tripCurrency,
}: ActivityFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    tripCountryId: initial?.tripCountryId ?? tripCountries[0]?.id ?? undefined,
    destinationId: initial?.destinationId ?? undefined,
    type: initial?.type ?? "other",
    date: initial?.date ?? tripStartDate,
    duration: initial?.duration?.toString() ?? "",
    cost: initial?.cost?.toString() ?? "",
    currency: initial?.currency ?? tripCurrency,
    link: initial?.link ?? "",
    notes: initial?.notes ?? "",
    image: initial?.image ?? "",
    isConfirmed: initial?.isConfirmed ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { disabledDuringFlights } = useTripAvailability(tripId);

  const set = (k: string, v: string | boolean | number | undefined) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadedFile = await fileToBase64(file);
    set("image", uploadedFile.base64);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Activity name is required";
    if (!form.date) e.date = "Date and time are required";
    if (!form.destinationId) e.destinationId = "Please select a destination";
    if (!form.tripCountryId) e.tripCountryId = "Please select a country";
    return e;
  };

  const handleClose = () => {
    setForm({
      name: initial?.name ?? "",
      tripCountryId: initial?.tripCountryId ?? tripCountries[0]?.id ?? undefined,
      destinationId: initial?.destinationId ?? undefined,
      type: initial?.type ?? "other",
      date: initial?.date ?? tripStartDate,
      duration: initial?.duration?.toString() ?? "",
      cost: initial?.cost?.toString() ?? "",
      currency: initial?.currency ?? tripCurrency,
      link: initial?.link ?? "",
      notes: initial?.notes ?? "",
      image: initial?.image ?? "",
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

    try {
      await onSave({
        tripId,
        name: form.name,
        tripCountryId: form.tripCountryId,
        destinationId: form.destinationId,
        type: form.type as Activity["type"],
        date: form.date,
        duration: Number(form.duration) || undefined,
        cost: Number(form.cost) || 0,
        currency: form.currency as Currency,
        link: form.link || undefined,
        notes: form.notes || undefined,
        image: form.image || undefined,
        isConfirmed: form.isConfirmed,
        order: initial?.order ?? 0,
      });
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const filteredDestinations = destinations.filter((d) => d.tripCountryId === form.tripCountryId);

  const destinationOptions = filteredDestinations.map((d) => ({
    value: d.id!.toString(),
    label: d.name,
    icon: <MapPin size={12} className="text-lavender-500" />,
  }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={initial ? "Edit Activity" : "Add Activity"}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">
            Activity Image
          </label>
          <div
            className="relative h-32 rounded-xl border-2 border-dashed border-border overflow-hidden cursor-pointer hover:border-lavender-400 transition-colors group"
            onClick={() => fileInputRef.current?.click()}
          >
            {form.image ? (
              <>
                <img src={form.image} alt="Activity" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium">
                    Change Image
                  </span>
                </div>
                <button
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    set("image", "");
                  }}
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-text-muted">
                <ImageIcon size={24} />
                <span className="text-sm">Click to upload an image</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        <Input
          id="act-name"
          label="Name"
          placeholder="e.g. Sushi Making Class"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
        />

        <div className="grid grid-cols-2 gap-3">
          <SearchableSelect
            id="act-country"
            label="Country"
            placeholder="Select country..."
            value={form.tripCountryId?.toString() || ""}
            options={tripCountries.map((tc) => ({
              value: tc.id!.toString(),
              label: tc.countryName,
              icon: <span>{getFlagEmoji(tc.countryCode)}</span>,
            }))}
            onChange={(val: string) => {
              set("tripCountryId", Number(val));
              set("destinationId", undefined);
            }}
            includeSearch={false}
            error={errors.tripCountryId}
          />
          <SearchableSelect
            id="act-dest"
            label="Destination"
            placeholder="Select destination (optional)..."
            value={form.destinationId?.toString() || ""}
            options={destinationOptions}
            onChange={(val: string) => set("destinationId", Number(val))}
            disabled={!form.tripCountryId}
            error={errors.destinationId}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SearchableSelect
            id="act-type"
            label="Category"
            placeholder="Select category..."
            value={form.type}
            options={ACTIVITY_TAGS}
            onChange={(val: string) => set("type", val)}
          />
          <DatePicker
            tripId={tripId}
            label="Date"
            showTime
            value={form.date}
            onChange={(date) => set("date", date ? date.toISOString() : "")}
            defaultMonth={form.date ? new Date(form.date) : new Date(tripStartDate)}
            disabled={[
              ...(disabledDuringFlights ? [disabledDuringFlights] : []),
              { before: new Date(tripStartDate) },
              { after: new Date(tripEndDate) },
            ]}
            error={errors.date}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            id="act-duration"
            label="Duration (mins)"
            type="number"
            placeholder="e.g. 120"
            value={form.duration}
            onChange={(e) => set("duration", e.target.value)}
          />
          <div className="col-span-2">
            <Input
              id="act-cost"
              label={`Cost (${tripCurrency})`}
              type="number"
              placeholder="0.00"
              value={form.cost}
              onChange={(e) => set("cost", e.target.value)}
            />
          </div>
        </div>

        <Input
          id="act-link"
          label="Link (optional)"
          placeholder="https://..."
          value={form.link}
          onChange={(e) => set("link", e.target.value)}
        />
        <Textarea
          id="act-notes"
          label="Notes (optional)"
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
