import { useState, useEffect, useRef } from "react";
import { Lightbulb, RefreshCcw } from "lucide-react";
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

interface NotesTabProps {
  tripId: number;
}

export function NotesTab({ tripId }: NotesTabProps) {
  const { note, saveNote, saving } = useNotes(tripId);

  const [content, setContent] = useState("");
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

  const tips = TRAVEL_TIPS.slice(0, 4);

  return (
    <div className="p-4 bg-surface border border-border rounded-xl">
      <div className="space-y-8">
        {/* Notes editor area */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm shadow-lavender-500/5 transition-all duration-300 focus-within:shadow-md focus-within:shadow-lavender-500/10 focus-within:border-lavender-300">
          <div className="px-5 py-4 border-b border-border bg-surface-2/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-lavender-500 flex items-center justify-center text-white shadow-sm">
                <Lightbulb size={16} />
              </div>
              <h3 className="font-bold text-text-primary tracking-tight">Trip Notebook</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 h-4">
                  {saving ? (
                    <div className="flex items-center gap-1.5 transition-opacity">
                      <RefreshCcw size={10} className="animate-spin text-lavender-500" />
                      <span className="text-[10px] font-bold text-lavender-500 uppercase tracking-widest">
                        Saving...
                      </span>
                    </div>
                  ) : saved ? (
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in slide-in-from-bottom-1">
                      Changes Saved
                    </span>
                  ) : null}
                </div>
                {note?.updatedAt && (
                  <span className="text-[10px] text-text-muted font-medium mt-0.5">
                    Last sync: {formatDateTime(note.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative group">
            <textarea
              value={content}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Capture your thoughts, packing lists, and hidden gems here..."
              className="w-full min-h-120 p-8 text-base text-text-primary placeholder:text-text-muted/50 resize-none focus:outline-none bg-linear-to-b from-surface to-surface-2/30 selection:bg-lavender-100 dark:selection:bg-lavender-900/40 leading-relaxed font-medium transition-colors"
            />
            <div className="absolute bottom-4 right-6 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                {content.length} characters
              </span>
            </div>
          </div>
        </div>

        {/* Travel Tips Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="w-1.5 h-6 bg-amber-pastel-400 rounded-full" />
            <h3 className="font-bold text-lg text-text-primary tracking-tight">
              Traveler's Wisdom
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="group relative rounded-2xl bg-surface border border-border p-5 transition-all duration-300 hover:border-amber-pastel-300 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1"
              >
                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-xl bg-amber-pastel-50 dark:bg-amber-pastel-900/30 border border-amber-pastel-200 dark:border-amber-pastel-800/30 flex items-center justify-center text-xs shadow-sm z-10">
                  {tip.split(" ")[0]}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed pt-2">
                  {tip.split(" ").slice(1).join(" ")}
                </p>
                <div className="absolute bottom-2 right-4 text-[10px] font-black text-amber-pastel-600/20 uppercase tracking-widest group-hover:text-amber-pastel-500/40 transition-colors">
                  Tip #{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
