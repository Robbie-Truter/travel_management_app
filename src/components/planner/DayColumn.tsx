import { formatDate } from "@/lib/utils";
import { PlannerCard, type PlannerItem } from "./PlannerCard";

interface DayColumnProps {
  date: string;
  items: PlannerItem[];
}

export function DayColumn({ date, items }: DayColumnProps) {
  return (
    <div className="shrink-0 w-80 group">
      <div className="mb-4 sticky top-0 bg-surface/80 backdrop-blur-sm z-10 p-2 flex rounded items-baseline gap-2 text-left">
        <h3 className="text-xl font-bold text-text-primary">{formatDate(date, "d")}</h3>
        <span className="text-sm font-medium text-text-secondary">
          {formatDate(date, "EEEE, MMM")}
        </span>
      </div>

      <div className="relative space-y-4 min-h-[400px]">
        {/* Timeline line */}
        <div className="absolute left-5.5 top-2 bottom-0 w-0.5 bg-border group-hover:bg-lavender-200 transition-colors" />

        {items.length === 0 ? (
          <div className="pl-12 py-8 text-left">
            <p className="text-sm text-text-muted italic">No plans for today</p>
          </div>
        ) : (
          items.map((item) => <PlannerCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
