import { useState, useRef } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { fileToBase64, getFlagEmoji } from "@/lib/utils";
import type { Destination, TripCountry } from "@/db/types";
import { useDebounce } from "@/hooks/useDebounce";
import { useCitySearch } from "@/hooks/useCitySearch";

interface DestinationFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Destination, "id" | "createdAt">) => Promise<void>;
  initial?: Destination;
  tripId: number;
  tripCountries?: TripCountry[];
  existingDestinations?: Destination[];
}

export function DestinationForm({
  open,
  onClose,
  onSave,
  initial,
  tripId,
  tripCountries = [],
  existingDestinations = [],
}: DestinationFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    tripCountryId: initial?.tripCountryId ?? tripCountries[0]?.id ?? undefined,
    cityLookupId: initial?.cityLookupId ?? (undefined as number | undefined),
    notes: initial?.notes ?? "",
    image: initial?.image ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [citySearchRaw, setCitySearchRaw] = useState("");
  const debounced = useDebounce(citySearchRaw, 300);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve iso2 from the selected trip country
  const selectedCountry = tripCountries.find((tc) => tc.id === form.tripCountryId);
  const iso2 = selectedCountry?.countryCode ?? "";

  const { cities, isLoading: isCityLoading } = useCitySearch(debounced, iso2);

  // Dropdown with city options from server response — filter out ones already in the trip
  const cityOptions = cities
    .filter(
      (city) =>
        !existingDestinations.some(
          (d) =>
            d.cityLookupId === city.id &&
            d.tripCountryId === form.tripCountryId &&
            (!initial || d.id !== initial.id),
        ),
    )
    .map((city) => ({
      value: String(city.id),
      label: city.city,
    }));

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
    if (!form.name.trim()) e.name = "City or town name is required";
    if (!form.tripCountryId) e.country = "Please select a country first";

    // Prevent manual name duplicate in the same country
    if (!e.name && form.tripCountryId) {
      const isDuplicate = existingDestinations.some(
        (d) =>
          d.name.toLowerCase() === form.name.trim().toLowerCase() &&
          d.tripCountryId === form.tripCountryId &&
          (!initial || d.id !== initial.id),
      );
      if (isDuplicate) {
        e.name = "This destination already exists for this country";
      }
    }

    return e;
  };

  const handleCitySelect = (val: string) => {
    if (val.startsWith("__manual__")) {
      // User chose to add manually — extract typed text as name, no DB link
      const manualName = val.replace("__manual__", "");
      set("name", manualName);
      set("cityLookupId", undefined);
    } else {
      // User picked a city from the lookup table
      const city = cities.find((c) => String(c.id) === val);
      if (city) {
        set("name", city.city);
        set("cityLookupId", city.id);
      }
    }
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
        tripCountryId: form.tripCountryId!,
        countryId: selectedCountry!.countryId,
        cityLookupId: form.cityLookupId,
        notes: form.notes || undefined,
        image: form.image || undefined,
        order: initial?.order ?? 0,
      });

      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: initial?.name ?? "",
      tripCountryId: initial?.tripCountryId ?? tripCountries[0]?.id ?? undefined,
      cityLookupId: initial?.cityLookupId ?? undefined,
      notes: initial?.notes ?? "",
      image: initial?.image ?? "",
    });
    setErrors({});
    setCitySearchRaw("");
    onClose();
  };

  // Derive the displayed city value — match by cityLookupId or fall back to name
  const citySelectValue = form.cityLookupId
    ? String(form.cityLookupId)
    : form.name
      ? `__manual__${form.name}`
      : "";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={initial ? "Edit Destination" : "Add Destination"}
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
            Destination Image
          </label>
          <div
            className="relative h-32 rounded-xl border-2 border-dashed border-border overflow-hidden cursor-pointer hover:border-lavender-400 transition-colors group"
            onClick={() => fileInputRef.current?.click()}
          >
            {form.image ? (
              <>
                <img src={form.image} alt="Destination" className="w-full h-full object-cover" />
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

        {/* Country must be selected first */}
        <SearchableSelect
          id="dest-country"
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
            // Reset city when country changes
            set("name", "");
            set("cityLookupId", undefined);
            setCitySearchRaw("");
          }}
          error={errors.country}
          includeSearch={false}
        />

        {/* City / Town search — disabled until country is selected */}
        <SearchableSelect
          id="dest-city"
          label="City / Town"
          placeholder={iso2 ? "Search for a city..." : "Select a country first"}
          value={citySelectValue}
          options={cityOptions}
          onChange={handleCitySelect}
          onSearchChange={setCitySearchRaw}
          isSearchLoading={isCityLoading}
          searchHint="Type at least 2 characters to search"
          selectedOption={
            form.name
              ? {
                  value: citySelectValue,
                  label: form.name,
                }
              : undefined
          }
          allowManual
          error={errors.name}
          disabled={!iso2}
          includeSearch
        />

        <Textarea
          id="dest-notes"
          label="Notes (optional)"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
}
