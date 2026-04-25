import Widget from "../ui/Widget";
import { StickyNote, AlertCircle, RefreshCcw } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";
import { Button } from "../ui/Button";

interface NotesWidgetProps {
  tripId: number;
}

const NotesWidget = ({ tripId }: NotesWidgetProps) => {
  const { note, isLoading, isError, refetch } = useNotes(tripId);

  return (
    <Widget title="Quick Notes" icon={<StickyNote size={14} />}>
      <div className="flex flex-col h-full pt-1 relative">
        {isLoading ? (
          <div className="flex-1 animate-pulse space-y-2 opacity-70 mt-1">
            <div className="h-2 w-full bg-border/40 rounded" />
            <div className="h-2 w-5/6 bg-border/30 rounded" />
            <div className="h-2 w-4/6 bg-border/20 rounded" />
          </div>
        ) : isError ? (
          <div className="py-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-pastel-50 flex items-center justify-center text-rose-pastel-500 mb-2 border border-rose-pastel-100">
              <AlertCircle size={20} />
            </div>
            <p className="text-[10px] font-bold text-text-primary mb-3">Failed to load notes</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider"
            >
              <RefreshCcw size={10} className="mr-1.5" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="flex-1 relative group/textarea bg-surface-3/30 rounded-xl border border-border/40 p-3 overflow-hidden">
            {note?.content ? (
              note?.content
            ) : (
              <p className="text-[12px] text-text-muted/50 font-medium leading-relaxed scrollbar-thin">
                No notes
              </p>
            )}
          </div>
        )}
      </div>
    </Widget>
  );
};

export default NotesWidget;
