import { useState, useRef, useEffect } from "react";
import { FileText, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { fileToBase64 } from "@/lib/utils";
import type { Document } from "@/db/types";

interface DocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Document, "id" | "createdAt" | "tripId">) => Promise<void>;
  initial?: Document;
}

export function DocumentModal({ open, onClose, onSave, initial }: DocumentModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [file, setFile] = useState<string | undefined>(initial?.file);
  const [fileType, setFileType] = useState<string | undefined>(initial?.type);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setFile(initial?.file);
      setFileType(initial?.type);
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Title is required";
    if (!file) e.file = "File is required";
    return e;
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
        name,
        description,
        file: file!,
        type: fileType!,
      });
      onClose();
    } catch (err) {
      console.error("Failed to save document", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const { base64, type } = await fileToBase64(selectedFile);
      setFile(base64);
      setFileType(type);

      // Default name to filename if name is empty
      if (!name) {
        // Strip extension for the name
        const fileName = selectedFile.name.split(".").slice(0, -1).join(".");
        setName(fileName || selectedFile.name);
      }
    } catch (err) {
      console.error("File upload failed", err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Document" : "Upload Document"}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : initial ? "Save Changes" : "Upload Document"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* File upload area */}
        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">
            File / Image{" "}
            {errors.file && (
              <span className="text-rose-500 text-xs font-normal">({errors.file})</span>
            )}
          </label>
          <div
            className={`relative min-h-32 rounded-xl border-2 border-dashed overflow-hidden cursor-pointer transition-colors group ${
              errors.file
                ? "border-rose-300 bg-rose-50/30"
                : "border-border hover:border-lavender-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <div className="p-4">
                {fileType?.startsWith("image/") ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                    <img src={file} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 gap-2 text-lavender-600">
                    <FileText size={48} className="text-lavender-400" />
                    <span className="text-sm font-medium uppercase">
                      {fileType?.split("/")[1] || "FILE"}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    Click to Change File
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-text-muted">
                <Upload size={24} />
                <span className="text-sm">Click to upload a document or image</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60">
                  JSON, PDF, IMG
                </span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            // Matching the restricted types from DocumentsPage
            accept=".json, image/*, application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <Input
          id="doc-title"
          label="Title"
          placeholder="e.g. Flight Ticket"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        <Textarea
          id="doc-description"
          label="Description (optional)"
          placeholder="Add some details about this document..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
}
