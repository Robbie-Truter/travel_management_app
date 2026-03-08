import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Hotel,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  Image as ImageIcon,
  X,
  Phone,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { formatDateTime, formatCurrency, fileToBase64 } from "@/lib/utils";
import type { Accommodation, Currency } from "@/db/types";
import { SearchableSelect } from "../ui/SearchableSelect";
import { DatePicker } from "@/components/ui/DatePicker";

const TYPE_OPTIONS = [
  { value: "hotel", label: "Hotel" },
  { value: "apartment", label: "Apartment" },
  { value: "hostel", label: "Hostel" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "resort", label: "Resort" },
  { value: "other", label: "Other" },
];

const PLATFORM_OPTIONS = [
  {
    value: "booking",
    label: "Booking.com",
    icon: <img src="https://www.booking.com/favicon.ico" className="w-4 h-4 rounded-sm" />,
  },
  {
    value: "airbnb",
    label: "Airbnb",
    icon: <img src="https://www.airbnb.com/favicon.ico" className="w-4 h-4 rounded-sm" />,
  },
  {
    value: "expedia",
    label: "Expedia",
    icon: <img src="https://www.expedia.com/favicon.ico" className="w-4 h-4 rounded-sm" />,
  },
  {
    value: "agoda",
    label: "Agoda",
    icon: <img src="https://www.agoda.com/favicon.ico" className="w-4 h-4 rounded-sm" />,
  },
  {
    value: "hotels",
    label: "Hotels.com",
    icon: <img src="https://www.hotels.com/favicon.ico" className="w-4 h-4 rounded-sm" />,
  },
  { value: "direct", label: "Direct", icon: <Phone size={14} className="text-slate-400" /> },
  { value: "other", label: "Other", icon: <HelpCircle size={14} className="text-slate-400" /> },
];

interface AccommodationCardProps {
  acc: Accommodation;
  onEdit: (a: Accommodation) => void;
  onDelete: (id: number) => void;
  onConfirm: (id: number) => void;
}

export function AccommodationCard({ acc, onEdit, onDelete, onConfirm }: AccommodationCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const nights = Math.max(
    1,
    Math.round((new Date(acc.checkOut).getTime() - new Date(acc.checkIn).getTime()) / 86400000),
  );

  const platform = PLATFORM_OPTIONS.find((p) => p.value === acc.platform);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Card hover className={acc.isConfirmed ? "border-sage-500 dark:border-sage-500" : ""}>
          {acc.image && (
            <div className="rounded-t-xl h-40 w-full overflow-hidden border-b">
              <img src={acc.image} alt={acc.name} className="w-full h-full object-cover" />
            </div>
          )}
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center shrink-0">
                  <Hotel size={16} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-text-primary truncate">{acc.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span className="capitalize">{acc.type}</span>
                    {platform && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {platform.icon} {platform.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {acc.isConfirmed ? (
                  <Badge variant="confirmed">
                    <CheckCircle size={10} />
                    Confirmed
                  </Badge>
                ) : (
                  <Badge variant="option">Option</Badge>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-sm text-text-secondary">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} />
                <span>
                  {acc.country && `${acc.country}, `}
                  {acc.location}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>
                  {formatDateTime(acc.checkIn)} → {formatDateTime(acc.checkOut)}
                </span>
                <span className="text-text-muted">
                  ({nights} night{nights > 1 ? "s" : ""})
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <DollarSign size={13} />
                  {formatCurrency(acc.price, acc.currency)} total
                </span>
                {acc.bookingLink && (
                  <a
                    href={acc.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-lavender-500 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={12} />
                    View Booking
                  </a>
                )}
              </div>
            </div>
            {acc.notes && (
              <p className="mt-2 text-xs text-text-muted bg-surface-3 rounded-lg px-3 py-2">
                {acc.notes}
              </p>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            {!acc.isConfirmed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onConfirm(acc.id!)}
                className="text-lavender-600"
              >
                <CheckCircle size={14} />
                Confirm
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(acc)}>
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
          onDelete(acc.id!);
          setDeleteOpen(false);
        }}
        title="Delete Accommodation"
        description={`Delete "${acc.name}"?`}
      />
    </>
  );
}

interface AccommodationFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Accommodation, "id" | "createdAt">) => Promise<void>;
  initial?: Accommodation;
  tripId: number;
  destinations?: string[];
}

export function AccommodationForm({
  open,
  onClose,
  onSave,
  initial,
  tripId,
  destinations = [],
}: AccommodationFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    country: initial?.country ?? destinations[0] ?? "",
    type: initial?.type ?? "hotel",
    platform: initial?.platform ?? "booking",
    location: initial?.location ?? "",
    checkIn: initial?.checkIn ?? "",
    checkOut: initial?.checkOut ?? "",
    price: initial?.price?.toString() ?? "",
    currency: initial?.currency ?? "USD",
    bookingLink: initial?.bookingLink ?? "",
    notes: initial?.notes ?? "",
    image: initial?.image ?? "",
    isConfirmed: initial?.isConfirmed ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CURRENCIES = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "ZAR", label: "ZAR" },
  ];

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadedFile = await fileToBase64(file);
    set("image", uploadedFile.base64);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.location.trim()) e.location = "Required";
    if (!form.checkIn) e.checkIn = "Required";
    if (!form.checkOut) e.checkOut = "Required";
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
      name: form.name,
      country: form.country,
      type: form.type as Accommodation["type"],
      platform: form.platform,
      location: form.location,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      price: Number(form.price),
      currency: form.currency as Currency,
      bookingLink: form.bookingLink || undefined,
      notes: form.notes || undefined,
      image: form.image || undefined,
      isConfirmed: form.isConfirmed,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Accommodation" : "Add Accommodation"}
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
          value={form.country}
          options={destinations.map((d) => ({ value: d, label: d }))}
          onChange={(val: string) => set("country", val)}
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
          id="acc-loc"
          label="Location"
          placeholder="e.g. Shinjuku, Tokyo"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          error={errors.location}
        />
        <div className="grid grid-cols-2 gap-3">
          <DatePicker
            label="Check-in"
            showTime
            value={form.checkIn}
            onChange={(date) => set("checkIn", date ? date.toISOString() : "")}
            error={errors.checkIn}
          />
          <DatePicker
            label="Check-out"
            showTime
            value={form.checkOut}
            onChange={(date) => set("checkOut", date ? date.toISOString() : "")}
            error={errors.checkOut}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              id="acc-price"
              label="Total Price"
              type="number"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              error={errors.price}
            />
          </div>
          <SearchableSelect
            id="acc-currency"
            label="Currency"
            placeholder="Search currency..."
            value={form.currency}
            options={CURRENCIES}
            onChange={(val: string) => set("currency", val)}
            includeSearch={false}
          />
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

interface AccommodationComparisonProps {
  open: boolean;
  onClose: () => void;
  accommodations: Accommodation[];
}

export function AccommodationComparison({
  open,
  onClose,
  accommodations,
}: AccommodationComparisonProps) {
  return (
    <Modal open={open} onClose={onClose} title="Compare Accommodations" size="xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-text-muted font-medium">Field</th>
              {accommodations.map((a) => (
                <th key={a.id} className="text-left py-2 px-4 text-text-primary font-semibold">
                  {a.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              {
                label: "Image",
                render: (a: Accommodation) =>
                  a.image ? (
                    <img
                      src={a.image}
                      alt={a.name}
                      className="w-16 h-12 object-cover rounded shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-surface-3 rounded flex items-center justify-center text-text-muted">
                      <ImageIcon size={16} />
                    </div>
                  ),
              },
              { label: "Type", render: (a: Accommodation) => a.type },
              {
                label: "Platform",
                render: (a: Accommodation) => {
                  const p = PLATFORM_OPTIONS.find((opt) => opt.value === a.platform);
                  if (!p) return a.platform ?? "—";
                  return (
                    <div className="flex items-center gap-2">
                      {p.icon}
                      <span>{p.label}</span>
                    </div>
                  );
                },
              },
              { label: "Country", render: (a: Accommodation) => a.country ?? "—" },
              { label: "Location", render: (a: Accommodation) => a.location },
              { label: "Check-in", render: (a: Accommodation) => formatDateTime(a.checkIn) },
              { label: "Check-out", render: (a: Accommodation) => formatDateTime(a.checkOut) },
              { label: "Price", render: (a: Accommodation) => formatCurrency(a.price, a.currency) },
              {
                label: "Status",
                render: (a: Accommodation) => (a.isConfirmed ? "✅ Confirmed" : "Option"),
              },
              { label: "Notes", render: (a: Accommodation) => a.notes ?? "—" },
            ].map((row) => (
              <tr key={row.label}>
                <td className="py-2.5 pr-4 text-text-muted font-medium">{row.label}</td>
                {accommodations.map((a) => (
                  <td key={a.id} className="py-2.5 px-4 text-text-primary">
                    {row.render(a)}
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
