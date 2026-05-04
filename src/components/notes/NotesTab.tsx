import { useState, useEffect, useRef } from "react";
import { Lightbulb, RefreshCcw } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useNotes } from "@/hooks/useNotes";
import { formatDateTime } from "@/lib/utils";
import { NoteSkeleton, NoteRefetchingIndicator } from "./NoteLoadingStates";
import { NoteErrorState } from "./NoteErrorState";

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
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { note, saveNote, saving, isLoading, isError, isRefetching, refetch } = useNotes(tripId);

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

  if (isLoading) return <NoteSkeleton />;
  if (isError) return <NoteErrorState onRetry={() => refetch()} />;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>{isRefetching && <NoteRefetchingIndicator />}</AnimatePresence>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="bg-amber-pastel-50 dark:bg-amber-pastel-900/10 p-4 border-b border-amber-pastel-100 dark:border-amber-pastel-900/20">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg flex items-center gap-2 text-amber-pastel-700 dark:text-amber-pastel-400">
                <Lightbulb size={20} className="text-amber-pastel-500" />
                Trip Notebook
                <AnimatePresence>{isRefetching && <NoteRefetchingIndicator />}</AnimatePresence>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 h-4">
                  {saving ? (
                    <div className="flex items-center gap-1.5 transition-opacity">
                      <RefreshCcw size={10} className="animate-spin text-amber-pastel-500" />
                      <span className="text-[10px] font-bold text-amber-pastel-600 uppercase tracking-widest">
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
                  <span className="text-[10px] text-amber-pastel-600/60 dark:text-amber-pastel-400/40 font-medium mt-0.5">
                    Last sync: {formatDateTime(note.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-amber-pastel-600/80 dark:text-amber-pastel-400/80">
            Capture your thoughts, packing lists, and hidden gems here.
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Notes editor area */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm shadow-amber-pastel-500/5 transition-all duration-300 focus-within:shadow-md focus-within:shadow-amber-pastel-500/10 focus-within:border-amber-pastel-300">
            <div className="relative group">
              <textarea
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Start writing..."
                className="w-full min-h-120 p-8 text-base text-text-primary placeholder:text-text-muted/50 resize-none focus:outline-none bg-linear-to-b from-surface to-surface-2/30 selection:bg-amber-pastel-100 dark:selection:bg-amber-pastel-900/40 leading-relaxed font-medium transition-colors"
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
    </>
  );
}
