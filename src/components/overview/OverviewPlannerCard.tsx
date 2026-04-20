import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Props {
  plannedItemsCount: number;
}

export function OverviewPlannerCard({ plannedItemsCount }: Props) {
  return (
    <Card className="p-0 overflow-hidden group hover:shadow-card-hover transition-shadow text-center sm:text-left">
      <div className="bg-indigo-pastel-50 dark:bg-indigo-pastel-900/10 p-5 border-b border-indigo-pastel-100 dark:border-indigo-pastel-900/20 text-left">
        <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-pastel-700 dark:text-indigo-pastel-400">
          <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
            <Calendar size={18} className="text-indigo-pastel-500" />
          </div>
          Planner
        </h3>
      </div>
      <div className="p-5">
        <p className="text-3xl font-bold text-text-primary">{plannedItemsCount}</p>
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          Planned Items
        </p>
      </div>
    </Card>
  );
}
