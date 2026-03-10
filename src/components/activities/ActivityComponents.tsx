import { useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Clock,
  DollarSign,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  MapPin,
  Camera,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  formatCurrency,
  formatDuration,
  fileToBase64,
  cn,
  formatDate,
  getCountryFlag,
} from "@/lib/utils";
import { format } from "date-fns";
import type { Activity, Currency, Destination } from "@/db/types";

const ACTIVITY_TAGS = [
  { value: "sightseeing", label: "Sightseeing", icon: "🏛️" },
  { value: "dining", label: "Dining", icon: "🍽️" },
  { value: "adventure", label: "Adventure", icon: "🌋" },
  { value: "culture", label: "Culture", icon: "🎭" },
  { value: "relaxation", label: "Relaxation", icon: "🧘" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "entertainment", label: "Entertainment", icon: "🍿" },
  { value: "sport", label: "Sport", icon: "⚽" },
  { value: "nature", label: "Nature", icon: "🌳" },
  { value: "other", label: "Other", icon: "📍" },
];

interface ActivityCardProps {
  activity: Activity;
  destinationName?: string;
  onEdit: (a: Activity) => void;
  onDelete: (id: number) => void;
  onConfirm: (id: number) => void;
}

export function ActivityCard({
  activity,
  destinationName,
  onEdit,
  onDelete,
  onConfirm,
}: ActivityCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

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
            "overflow-hidden",
            activity.isConfirmed ? "border-sage-500 dark:border-sage-500" : "",
          ])}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Image Section */}
            <div className="p-3 shrink-0">
              <div className="w-full sm:w-[400px] h-80 rounded-xl overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                {activity.image ? (
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Compass
                    size={48}
                    className="text-slate-300 dark:text-slate-700"
                    strokeWidth={1.5}
                  />
                )}
              </div>
            </div>

            {/* Content Section */}
            <CardContent className="pt-4 flex-1">
              <div className="flex items-start justify-between gap-3 w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center shrink-0">
                    <Compass size={16} className="text-lavender-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-[20px] text-text-primary wrap-break-word whitespace-normal line-clamp-2">
                      {activity.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {activity.country && (
                        <Badge variant="default" className="text-[10px] h-5 py-0 px-2 opacity-70">
                          {activity.country}
                        </Badge>
                      )}
                      {destinationName && (
                        <Badge
                          variant="default"
                          className="text-[10px] h-5 py-0 px-2 bg-lavender-50 text-lavender-600 border-lavender-100"
                        >
                          <MapPin size={10} className="mr-1" />
                          {destinationName}
                        </Badge>
                      )}
                      {activity.type && (
                        <Badge
                          variant="default"
                          className="text-[10px] h-5 py-0 px-2 border-lavender-200 text-lavender-600 dark:border-lavender-900/30 dark:text-lavender-400"
                        >
                          {ACTIVITY_TAGS.find((t) => t.value === activity.type)?.icon}{" "}
                          {ACTIVITY_TAGS.find((t) => t.value === activity.type)?.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 justify-between mt-7 text-sm text-text-secondary">
                <div className="flex items-center gap-3">
                  <Calendar size={17} />
                  <span>{formatDate(activity.date)}</span>
                </div>
                {activity.duration && (
                  <div className="flex items-center gap-3">
                    <Clock size={17} />
                    <span>{formatDuration(activity.duration)}</span>
                  </div>
                )}
                {activity.cost !== undefined && activity.cost > 0 && (
                  <div className="flex items-center gap-3">
                    <DollarSign size={17} />
                    <span>{formatCurrency(activity.cost, activity.currency)}</span>
                  </div>
                )}
                {activity.link && (
                  <div>
                    <a
                      href={activity.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-lavender-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                      View Link
                    </a>
                  </div>
                )}
              </div>

              {activity.notes && (
                <p className="max-w-70 mt-2 overflow-auto text-xs text-text-muted bg-surface-3 rounded-lg px-3 py-2">
                  {activity.notes}
                </p>
              )}
            </CardContent>
          </div>

          <CardFooter className="h-15 justify-between bg-surface-2/50 border-t border-border">
            <div className="flex items-center gap-1 shrink-0">
              {activity.isConfirmed ? (
                <Badge variant="confirmed">
                  <CheckCircle size={10} />
                  Confirmed
                </Badge>
              ) : (
                <Badge variant="option">Option</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!activity.isConfirmed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onConfirm(activity.id!)}
                  className="text-lavender-600"
                >
                  <CheckCircle size={14} />
                  Confirm
                </Button>
              )}
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(activity)}>
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
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete(activity.id!);
          setDeleteOpen(false);
        }}
        title="Delete Activity"
        description={`Delete "${activity.name}"?`}
      />
    </>
  );
}

interface ActivityFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Activity, "id" | "createdAt">) => Promise<void>;
  initial?: Activity;
  tripId: number;
  defaultDate?: string;
  destinations?: string[]; // Countries
  allDestinations?: Destination[]; // Specific cities/towns
}

export function ActivityForm({
  open,
  onClose,
  onSave,
  initial,
  tripId,
  defaultDate,
  destinations = [],
  allDestinations = [],
}: ActivityFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    date: initial?.date ?? defaultDate ?? "",
    country: initial?.country ?? destinations[0] ?? "",
    type: initial?.type ?? "sightseeing",
    link: initial?.link ?? "",
    notes: initial?.notes ?? "",
    duration: initial?.duration?.toString() ?? "",
    cost: initial?.cost?.toString() ?? "",
    currency: initial?.currency ?? "USD",
    destinationId: initial?.destinationId ?? undefined,
    image: initial?.image ?? "",
    isConfirmed: initial?.isConfirmed ?? false,
    order: initial?.order ?? 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const CURRENCIES = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "ZAR", label: "ZAR" },
  ];

  const set = (k: string, v: string | boolean | number | undefined) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.date) e.date = "Required";
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
      name: form.name,
      date: form.date,
      country: form.country,
      type: form.type,
      link: form.link || undefined,
      notes: form.notes || undefined,
      duration: form.duration ? Number(form.duration) : undefined,
      cost: form.cost ? Number(form.cost) : undefined,
      currency: form.currency as Currency,
      destinationId: form.destinationId,
      image: form.image || undefined,
      isConfirmed: form.isConfirmed,
      order: form.order,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Activity" : "Add Activity"}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon size={14} className="text-text-muted" />
              Featured Photo (Optional)
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
                form.image
                  ? "border-transparent bg-surface-2"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {form.image ? (
                <div className="relative group">
                  <img src={form.image} alt="Preview" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm font-medium transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const { base64 } = await fileToBase64(file);
                            set("image", base64);
                          } catch (err) {
                            console.error("Failed to read file", err);
                            alert("Failed to upload image.");
                          }
                        }}
                      />
                      Change Image
                    </label>
                    <button
                      type="button"
                      onClick={() => set("image", "")}
                      className="bg-rose-500/80 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 py-8 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center">
                    <Camera size={18} className="text-text-muted" />
                  </div>
                  <span className="text-sm text-text-secondary">Click to upload photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const { base64 } = await fileToBase64(file);
                        set("image", base64);
                      } catch (err) {
                        console.error("Failed to read file", err);
                        alert("Failed to upload image.");
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <Input
            id="act-name"
            label="Activity Name"
            placeholder="e.g. Visit Senso-ji Temple"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={errors.name}
          />
          <DatePicker
            id="act-date"
            label="Date"
            value={form.date}
            onChange={(date) => {
              if (date) set("date", format(date, "yyyy-MM-dd"));
            }}
            error={errors.date}
          />
          <div className="grid grid-cols-2 gap-3">
            <SearchableSelect
              id="act-country"
              label="Country"
              placeholder="Select country..."
              value={form.country}
              options={destinations.map((d) => ({
                value: d,
                label: d,
                icon: <span>{getCountryFlag(d)}</span>,
              }))}
              onChange={(val: string) => set("country", val)}
              includeSearch={false}
            />
            <SearchableSelect
              id="act-type"
              label="Activity Type"
              placeholder="Select type..."
              value={form.type}
              options={ACTIVITY_TAGS}
              onChange={(val: string) => set("type", val)}
            />
          </div>
          <SearchableSelect
            id="act-destination"
            label="Destination (City/Town)"
            placeholder="Link to a destination..."
            value={form.destinationId?.toString() ?? ""}
            options={allDestinations.map((d) => ({
              value: d.id!.toString(),
              label: `${d.name} (${d.country})`,
              icon: <span>{getCountryFlag(d.country)}</span>,
            }))}
            onChange={(val: string) => set("destinationId", val ? Number(val) : undefined)}
            includeSearch={true}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="act-dur"
              label="Duration (minutes)"
              type="number"
              placeholder="e.g. 90"
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
            />
            <Input
              id="act-cost"
              label="Estimated Cost"
              type="number"
              placeholder="0.00"
              value={form.cost}
              onChange={(e) => set("cost", e.target.value)}
            />
          </div>
          <SearchableSelect
            id="act-currency"
            label="Currency"
            placeholder="Search currency..."
            value={form.currency}
            options={CURRENCIES}
            onChange={(val: string) => set("currency", val)}
            includeSearch={false}
          />
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
        </form>
      </div>
    </Modal>
  );
}
