import { AnimatePresence } from "framer-motion";
import { StickyNote, AlertCircle, RefreshCcw } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CardSkeleton, OverviewRefetchingIndicator } from "./OverviewLoadingStates";

function EmptyState({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="text-center p-4">
      <Icon size={24} className="mx-auto text-gray-400" />
      <p className="mt-2 text-sm text-gray-500">{label}</p>
    </div>
  );
}

interface Props {
  tripId: number;
}

export function OverviewNotesCard({ tripId }: Props) {
  const { note, isLoading, isRefetching, isError, refetch } = useNotes(tripId);

  // We only show skeleton if it's loading and there's no previous note data
  if (isLoading && !note) return <CardSkeleton />;

  if (isError) {
    return (
      <Card className="flex flex-col p-0 h-110 overflow-hidden">
        <div className="bg-fuchsia-pastel-50 dark:bg-fuchsia-pastel-900/10 p-5 border-b border-fuchsia-pastel-100 dark:border-fuchsia-pastel-900/20 shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2 text-fuchsia-pastel-700 dark:text-fuchsia-pastel-400">
            <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
              <StickyNote size={18} className="text-fuchsia-pastel-500" />
            </div>
            Notes
          </h3>
        </div>
        <div className="grow flex flex-col items-center justify-center gap-3 p-5 text-center">
          <AlertCircle size={24} className="text-rose-pastel-400" />
          <p className="text-sm text-text-secondary font-medium">Failed to load notes</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCcw size={13} />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <AnimatePresence>{isRefetching && <OverviewRefetchingIndicator />}</AnimatePresence>
      <Card className="p-0 overflow-hidden group hover:shadow-card-hover transition-shadow h-full">
        <div className="bg-fuchsia-pastel-50 dark:bg-fuchsia-pastel-900/10 p-5">
          <h3 className="font-bold text-lg flex items-center gap-2 text-fuchsia-pastel-700 dark:text-fuchsia-pastel-400">
            <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
              <StickyNote size={18} className="text-fuchsia-pastel-500" />
            </div>
            Notes
          </h3>
        </div>
        <div className="p-5 flex flex-col h-full">
          {note ? (
            <div className="relative group/note">
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-4 italic">
                "{note.content}"
              </p>
              <div className="mt-4 flex items-center justify-end">
                <div className="h-px bg-border grow mr-2" />
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-tighter">
                  Your Notes
                </span>
              </div>
            </div>
          ) : (
            <EmptyState icon={StickyNote} label="No notes yet" />
          )}
        </div>
      </Card>
    </>
  );
}
