import { useState, useRef } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { fileToBase64, getFlagEmoji } from "@/lib/utils";
import type { Accommodation, Currency, TripCountry } from "@/db/types";
import { SearchableSelect } from "../ui/SearchableSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { TYPE_OPTIONS, PLATFORM_OPTIONS } from "./AccommodationConstants";
import { useDestinations } from "@/hooks/useDestinations";

interface AccommodationFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Accommodation, "id" | "createdAt">) => Promise<void>;
  initial?: Accommodation;
  tripId: number;
  tripCountries?: TripCountry[];
  tripStartDate: string;
  tripEndDate: string;
  tripCurrency: Currency;
}

export function AccommodationForm({
  open,
  onClose,
  onSave,
  initial,
  tripId,
  tripCountries = [],
  tripStartDate,
  tripEndDate,
  tripCurrency,
}: AccommodationFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    tripCountryId: initial?.tripCountryId ?? tripCountries[0]?.id ?? undefined,
    destinationId: initial?.destinationId ?? undefined,
    type: initial?.type ?? "hotel",
    platform: initial?.platform ?? "booking",
    location: initial?.location ?? "",
    checkIn: initial?.checkIn ?? tripStartDate,
    checkOut: initial?.checkOut ?? tripStartDate,
    price: initial?.price?.toString() ?? "",
    currency: initial?.currency ?? tripCurrency,
    bookingLink: initial?.bookingLink ?? "",
    notes: initial?.notes ?? "",
    image: initial?.image ?? "",
    checkInAfter: initial?.checkInAfter ?? "",
    checkOutBefore: initial?.checkOutBefore ?? "",
    isConfirmed: initial?.isConfirmed ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { destinations } = useDestinations(tripId);

  const set = (k: string, v: string | boolean | number | undefined) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadedFile = await fileToBase64(file);
    set("image", uploadedFile.base64);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.destinationId) e.destinationId = "Required";
    if (!form.checkIn) e.checkIn = "Required";
    if (!form.checkOut) e.checkOut = "Required";

    if (form.checkIn && form.checkOut && new Date(form.checkIn) > new Date(form.checkOut)) {
      e.checkIn = "Check-in must be before check-out";
      e.checkOut = "Check-out must be after check-in";
    }

    return e;
  };

  const handleClose = () => {
    setForm({
      name: initial?.name ?? "",
      tripCountryId: initial?.tripCountryId ?? tripCountries[0]?.id ?? undefined,
      destinationId: initial?.destinationId ?? undefined,
      type: initial?.type ?? "hotel",
      platform: initial?.platform ?? "booking",
      location: initial?.location ?? "",
      checkIn: initial?.checkIn ?? tripStartDate,
      checkOut: initial?.checkOut ?? tripStartDate,
      price: initial?.price?.toString() ?? "",
      currency: initial?.currency ?? tripCurrency,
      bookingLink: initial?.bookingLink ?? "",
      notes: initial?.notes ?? "",
      image: initial?.image ?? "",
      checkInAfter: initial?.checkInAfter ?? "",
      checkOutBefore: initial?.checkOutBefore ?? "",
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

    const selectedDest = destinations.find((d) => d.id === form.destinationId);

    setSaving(true);

    await onSave({
      tripId,
      name: form.name,
      tripCountryId: form.tripCountryId,
      destinationId: form.destinationId,
      type: form.type as Accommodation["type"],
      platform: form.platform,
      location: form.location.trim() || selectedDest?.name || "Unknown",
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      price: Number(form.price),
      currency: form.currency as Currency,
      bookingLink: form.bookingLink || undefined,
      notes: form.notes || undefined,
      image: form.image || undefined,
      checkInAfter: form.checkInAfter || undefined,
      checkOutBefore: form.checkOutBefore || undefined,
      isConfirmed: form.isConfirmed,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={initial ? "Edit Accommodation" : "Add Accommodation"}
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
            Accommodation Image
          </label>
          <div
            className="relative h-32 rounded-xl border-2 border-dashed border-border overflow-hidden cursor-pointer hover:border-lavender-400 transition-colors group"
            onClick={() => fileInputRef.current?.click()}
          >
            {form.image ? (
              <>
                <img src={form.image} alt="Accommodation" className="w-full h-full object-cover" />
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
          id="acc-name"
          label="Name"
          placeholder="e.g. Park Hyatt Tokyo"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
        />
        <SearchableSelect
          id="acc-country"
          label="Country"
          placeholder="Select country..."
          value={form.tripCountryId?.toString() || ""}
          options={tripCountries.map((tc) => ({
            value: tc.id!.toString(),
            label: tc.countryName,
            icon: <span>{getFlagEmoji(tc.countryCode)}</span>,
          }))}
          onChange={(val: string) => {
            const newCountryId = Number(val);
            set("tripCountryId", newCountryId);

            // Reset destination if it doesn't belong to the new country
            if (form.destinationId) {
              const dest = destinations.find((d) => d.id === form.destinationId);
              if (dest && dest.tripCountryId !== newCountryId) {
                set("destinationId", undefined);
                set("location", "");
              }
            }
          }}
          includeSearch={false}
        />
        <SearchableSelect
          id="acc-location"
          label="City / Town (Destination)"
          placeholder="Select a destination..."
          value={form.destinationId?.toString() || ""}
          options={destinations
            .filter((d) => d.tripCountryId === form.tripCountryId)
            .map((dest) => ({
              value: dest.id!.toString(),
              label: dest.name,
            }))}
          onChange={(val: string) => {
            const dest = destinations.find((d) => d.id === Number(val));
            set("destinationId", Number(val));
            // Auto-fill location if it's empty
            if (!form.location && dest) {
              set("location", dest.name);
            }
          }}
          error={errors.destinationId}
          includeSearch={false}
        />
        <div className="grid grid-cols-2 gap-3">
          <SearchableSelect
            id="acc-type"
            label="Type"
            placeholder="Select type..."
            value={form.type}
            options={TYPE_OPTIONS}
            onChange={(val: string) => set("type", val)}
          />
          <SearchableSelect
            id="acc-platform"
            label="Platform"
            placeholder="Select platform..."
            value={form.platform}
            options={PLATFORM_OPTIONS}
            onChange={(val: string) => set("platform", val)}
          />
        </div>

        <Input
          id="acc-address"
          label="Address / Specific Area (optional)"
          placeholder="e.g. 123 Main St, Shinjuku"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <DatePicker
            label="Check-in"
            showTime
            value={form.checkIn}
            onChange={(date) => set("checkIn", date ? date.toISOString() : "")}
            disabled={{ before: new Date(tripStartDate), after: new Date(tripEndDate) }}
            error={errors.checkIn}
          />
          <DatePicker
            label="Check-out"
            showTime
            value={form.checkOut}
            onChange={(date) => set("checkOut", date ? date.toISOString() : "")}
            disabled={{ before: new Date(tripStartDate), after: new Date(tripEndDate) }}
            error={errors.checkOut}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="acc-check-in-after"
            type="time"
            label="Check-in After"
            value={form.checkInAfter}
            onChange={(e) => set("checkInAfter", e.target.value)}
          />
          <Input
            id="acc-check-out-before"
            type="time"
            label="Check-out Before"
            value={form.checkOutBefore}
            onChange={(e) => set("checkOutBefore", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input
              id="acc-price"
              label={`Total Price (${tripCurrency})`}
              type="number"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </div>
        </div>
        <Input
          id="acc-link"
          label="Booking Link (optional)"
          placeholder="https://..."
          value={form.bookingLink}
          onChange={(e) => set("bookingLink", e.target.value)}
        />
        <Textarea
          id="acc-notes"
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
