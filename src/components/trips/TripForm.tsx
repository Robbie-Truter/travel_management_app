import React, { useState, useRef } from "react";
import { Image, X, AlertTriangle, Plane, Hotel, Compass } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { fileToBase64, cn } from "@/lib/utils";
import { parseISO, format } from "date-fns";
import type { Trip, TripStatus, Currency } from "@/db/types";
import { CURRENCIES } from "@/constants/currencies";
import { getOutOfRangeItems, type ConflictItem } from "@/lib/tripDateConflicts";

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "booked", label: "Booked" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const CONFLICT_ICONS: Record<ConflictItem["type"], React.ReactNode> = {
  flight: <Plane size={13} className="text-sky-500 shrink-0" />,
  accommodation: <Hotel size={13} className="text-rose-500 shrink-0" />,
  activity: <Compass size={13} className="text-emerald-500 shrink-0" />,
};

interface TripFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Trip, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  initial?: Trip;
}

export function TripForm({ open, onClose, onSave, initial }: TripFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [status, setStatus] = useState<TripStatus>(initial?.status ?? "planning");
  const [baseCurrency, setBaseCurrency] = useState(initial?.baseCurrency ?? "USD");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverImage, setCoverImage] = useState<string | undefined>(initial?.coverImage);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [pendingSaveData, setPendingSaveData] = useState<Omit<
    Trip,
    "id" | "createdAt" | "updatedAt"
  > | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dateRange = React.useMemo(
    () => ({
      from: startDate ? parseISO(startDate) : undefined,
      to: endDate ? parseISO(endDate) : undefined,
    }),
    [startDate, endDate],
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Trip name is required";
    if (!startDate) e.startDate = "Start date is required";
    if (!endDate) e.endDate = "End date is required";
    if (startDate && endDate && endDate < startDate)
      e.endDate = "End date must be after start date";
    return e;
  };

  const datesChanged = initial && (startDate !== initial.startDate || endDate !== initial.endDate);

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const saveData: Omit<Trip, "id" | "createdAt" | "updatedAt"> = {
      name,
      startDate,
      endDate,
      status,
      description,
      coverImage,
      baseCurrency,
      tripCountries: initial?.tripCountries || [],
    };

    // Only check for conflicts when editing an existing trip with changed dates
    if (initial?.id && datesChanged) {
      setSaving(true);
      try {
        const outOfRange = await getOutOfRangeItems(initial.id, startDate, endDate);
        if (outOfRange.length > 0) {
          setConflicts(outOfRange);
          setPendingSaveData(saveData);
          return; // Show confirmation step
        }
      } finally {
        setSaving(false);
      }
    }

    await commitSave(saveData);
  };

  const commitSave = async (data: Omit<Trip, "id" | "createdAt" | "updatedAt">) => {
    setSaving(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error("Error saving trip:", error);
    } finally {
      setSaving(false);
    }
    handleClose();
  };

  const handleConfirmAnyway = async () => {
    if (pendingSaveData) {
      setConflicts([]);
      await commitSave(pendingSaveData);
      setPendingSaveData(null);
    }
  };

  const handleCancelConflict = () => {
    setConflicts([]);
    setPendingSaveData(null);
  };

  const handleClose = () => {
    setName(initial?.name ?? "");
    setStartDate(initial?.startDate ?? "");
    setEndDate(initial?.endDate ?? "");
    setStatus(initial?.status ?? "planning");
    setBaseCurrency(initial?.baseCurrency ?? "USD");
    setDescription(initial?.description ?? "");
    setCoverImage(initial?.coverImage);
    setErrors({});
    setConflicts([]);
    setPendingSaveData(null);
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadedFile = await fileToBase64(file);
    setCoverImage(uploadedFile.base64);
  };

  // --- Conflict Confirmation View ---
  if (conflicts.length > 0) {
    return (
      <Modal
        open={open}
        onClose={handleCancelConflict}
        title="Date Range Conflict"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={handleCancelConflict} disabled={saving}>
              Go Back
            </Button>
            <Button variant="danger" onClick={handleConfirmAnyway} disabled={saving}>
              {saving ? "Saving..." : "Save Anyway"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              The new date range{" "}
              <strong>
                ({format(parseISO(startDate), "MMM d")} – {format(parseISO(endDate), "MMM d, yyyy")}
                )
              </strong>{" "}
              doesn't cover the following items. They'll remain in the database but will appear
              outside your trip range.
            </p>
          </div>

          <div className="space-y-1.5">
            {conflicts.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-2 border border-border/40"
              >
                {CONFLICT_ICONS[item.type]}
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-text-primary truncate block">
                    {item.name}
                  </span>
                  <span className="text-xs text-text-muted">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    );
  }

  // --- Main Form View ---
  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={initial ? "Edit Trip" : "New Trip"}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Checking..." : initial ? "Save Changes" : "Create Trip"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Cover image */}
        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">Cover Image</label>
          <div
            className={cn(
              "relative min-h-32 rounded-2xl border-2 border-dashed overflow-hidden cursor-pointer transition-all duration-300 group",
              coverImage
                ? "border-lavender-400 bg-lavender-50/10"
                : "border-border hover:border-lavender-400 bg-surface-2/30",
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {coverImage ? (
              <div className="relative aspect-video sm:aspect-auto sm:h-40 w-full overflow-hidden">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-black uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
                    Change Cover
                  </span>
                </div>
                <button
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-rose-500 transition-colors z-10 backdrop-blur-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverImage(undefined);
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 gap-3 text-text-muted">
                <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center shadow-sm border border-border group-hover:border-lavender-200 transition-colors">
                  <Image size={24} className="text-lavender-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-text-primary">Click to upload cover image</p>
                  <p className="text-[10px] uppercase tracking-widest font-black opacity-60 mt-0.5">
                    Recommended: 1200 x 600
                  </p>
                </div>
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
          id="trip-name"
          label="Trip Name"
          placeholder="e.g. Summer in Japan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <DateRangePicker
          label="Trip Duration"
          value={dateRange}
          onChange={(range) => {
            setStartDate(range.from ? format(range.from, "yyyy-MM-dd") : "");
            setEndDate(range.to ? format(range.to, "yyyy-MM-dd") : "");
          }}
          error={errors.startDate || errors.endDate}
        />
        <SearchableSelect
          id="trip-status"
          label="Status"
          value={status}
          onChange={(val) => setStatus(val as TripStatus)}
          options={STATUS_OPTIONS}
          includeSearch={false}
        />
        <SearchableSelect
          id="trip-currency"
          label="Base Currency"
          placeholder="Select currency..."
          value={baseCurrency}
          options={CURRENCIES.map((c) => ({
            value: c.code,
            label: `${c.code} - ${c.name}`,
          }))}
          onChange={(val: string) => setBaseCurrency(val as Currency)}
          includeSearch={true}
        />
        <Textarea
          id="trip-description"
          label="Description (optional)"
          placeholder="What's this trip about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
}
