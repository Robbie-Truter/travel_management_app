import { useState } from "react";
import { MapPin, Image as ImageIcon, Trash2, Edit2, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Input, Textarea } from "@/components/ui/Input";
import { motion } from "framer-motion";
import type { Destination, TripCountry } from "@/db/types";
import { fileToBase64, getCountryFlag } from "@/lib/utils";

// --- DESTINATION CARD ---
interface DestinationCardProps {
  destination: Destination;
  onEdit: (dest: Destination) => void;
  onDelete: (id: number) => void;
  tripCountries?: TripCountry[];
}

export function DestinationCard({
  destination,
  onEdit,
  onDelete,
  tripCountries = [],
}: DestinationCardProps) {
  const tc = tripCountries.find((c) => c.trip_id === destination.tripCountryId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-surface border border-border rounded-xl overflow-hidden hover:border-lavender-500/30 transition-colors"
    >
      <div className="flex flex-col sm:flex-row h-full">
        {/* Image Section */}
        <div className="sm:w-48 h-48 sm:h-full shrink-0 bg-surface-2 relative border-b sm:border-b-0 sm:border-r border-border">
          {destination.image ? (
            <img
              src={destination.image}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin size={32} className="text-lavender-300" />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-semibold text-lg text-text-primary">{destination.name}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-text-secondary">
                  <MapPin size={14} className="text-rose-pastel-500" />
                  <span>
                    {tc ? `${getCountryFlag(tc.countryName)} ${tc.countryName}` : "No country"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(destination)}
                  className="text-text-muted hover:text-lavender-600 hover:bg-lavender-50"
                  title="Edit Destination"
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this destination?")) {
                      onDelete(destination.id!);
                    }
                  }}
                  className="text-text-muted hover:text-rose-pastel-600 hover:bg-rose-pastel-50"
                  title="Delete Destination"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            {destination.notes && (
              <div className="mt-4 p-3 bg-surface-2 rounded-lg text-sm text-text-secondary">
                {destination.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- DESTINATION FORM ---
interface DestinationFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Destination, "id" | "createdAt">) => Promise<unknown>;
  initial?: Destination;
  tripId: number;
  tripCountries?: TripCountry[];
}

export function DestinationForm({
  open,
  onClose,
  onSave,
  initial,
  tripId,
  tripCountries = [],
}: DestinationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initial?.name || "",
    tripCountryId: initial?.tripCountryId || tripCountries[0]?.trip_id || undefined,
    notes: initial?.notes || "",
    image: initial?.image || "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { base64 } = await fileToBase64(file);
      setFormData((prev) => ({ ...prev, image: base64 }));
    } catch (err) {
      console.error("Failed to read file", err);
      alert("Failed to upload image.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Please enter a destination name.");
    if (!formData.tripCountryId) return alert("Please select a country.");

    setLoading(true);
    try {
      await onSave({
        tripId,
        name: formData.name.trim(),
        tripCountryId: formData.tripCountryId,
        notes: formData.notes.trim() || undefined,
        image: formData.image || undefined,
      });
      onClose();
    } catch (err) {
      console.error("Failed to save destination", err);
      alert("An error occurred while saving the destination.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Destination" : "Add Destination"}
      size="md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading} onClick={handleSubmit}>
            {loading ? "Saving..." : "Save Destination"}
          </Button>
        </>
      }
    >
      <div className="py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon size={14} className="text-text-muted" />
              Featured Photo (Optional)
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
                formData.image
                  ? "border-transparent bg-surface-2"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {formData.image ? (
                <div className="relative group">
                  <img src={formData.image} alt="Preview" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm font-medium transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      Change Image
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
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
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <Input
            id="name"
            label="Destination Name"
            required
            placeholder="e.g. Paris, Kyoto, New York City"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />

          <div className="space-y-2">
            <SearchableSelect
              id="country"
              label="Country"
              placeholder="Select a country..."
              value={formData.tripCountryId?.toString() || ""}
              options={
                tripCountries.length > 0
                  ? tripCountries.map((tc) => ({
                      value: tc.trip_id!.toString(),
                      label: tc.countryName,
                      icon: <span>{getCountryFlag(tc.countryName)}</span>,
                    }))
                  : [{ value: "", label: "No countries added to trip yet" }]
              }
              onChange={(val: string) =>
                setFormData((prev) => ({ ...prev, tripCountryId: Number(val) }))
              }
              includeSearch={false}
            />
            {tripCountries.length === 0 && (
              <p className="text-xs text-rose-pastel-500">
                You need to add countries to the trip first.
              </p>
            )}
          </div>

          <Textarea
            id="notes"
            label="Notes & Description (Optional)"
            placeholder="What do you plan to do here? Any highlights?"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </form>
      </div>
    </Modal>
  );
}
