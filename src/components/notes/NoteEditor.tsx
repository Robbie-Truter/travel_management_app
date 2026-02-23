import { useState, useEffect, useRef } from "react";
import { Lightbulb, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNotes } from "@/hooks/useNotes";
import { formatDateTime } from "@/lib/utils";

const TRAVEL_TIPS = [
  "🗺️ Always carry a physical copy of your important documents.",
  "💊 Pack a small first-aid kit with essentials.",
  "📱 Download offline maps before you travel.",
  "💳 Notify your bank before traveling internationally.",
  "🔌 Bring a universal power adapter.",
  "🧳 Pack light — you can always buy things at your destination.",
  "📸 Back up your photos to the cloud daily.",
  "🌐 Get a local SIM card or international data plan.",
  "🏥 Check if your health insurance covers international travel.",
  "🎒 Keep valuables in a money belt or hidden pouch.",
  "🌤️ Check the weather forecast before packing.",
  "🍽️ Try local street food — it's often the most authentic experience.",
];

interface NoteEditorProps {
  tripId: number;
}

export function NoteEditor({ tripId }: NoteEditorProps) {
  const { note, saveNote } = useNotes(tripId);

  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (note?.content !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContent(note.content);
    }
  }, [note?.content]);

  const handleChange = (val: string) => {
    setContent(val);
    setSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await saveNote(val);
      setSaved(true);
    }, 1500);
  };

  const handleManualSave = async () => {
    setSaving(true);
    await saveNote(content);
    setSaving(false);
    setSaved(true);
  };

  const tips = TRAVEL_TIPS.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Notes editor */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-text-primary">Trip Notes</h3>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-sage-500">Auto-saved</span>}
            {note?.updatedAt && (
              <span className="text-xs text-text-muted">
                Last saved: {formatDateTime(note.updatedAt)}
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={handleManualSave} disabled={saving}>
              <Save size={14} />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write your trip notes, packing list, reminders, or anything else here..."
          className="w-full min-h-75 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-colors"
        />
      </div>

      {/* AI Tips */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-amber-pastel-400" />
          <h3 className="font-semibold text-text-primary">Travel Tips</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <div
              key={i}
              className="rounded-xl bg-amber-pastel-50 dark:bg-amber-pastel-900/10 border border-amber-pastel-200 dark:border-amber-pastel-800/30 px-4 py-3 text-sm text-text-secondary"
            >
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
