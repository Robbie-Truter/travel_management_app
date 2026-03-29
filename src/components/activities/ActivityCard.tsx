import { useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Clock,
  DollarSign,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import {
  formatCurrency,
  formatDuration,
  cn,
  formatDate,
} from "@/lib/utils";
import type { Activity } from "@/db/types";
import { ACTIVITY_TAGS } from "./activity-types";

interface ActivityCardProps {
  activity: Activity;
  destinationName?: string;
  onEdit: (a: Activity) => void;
  onDelete: (id: number) => void;
  onConfirm: (id: number) => void;
}

export function ActivityCard({
  activity,
  destinationName,
  onEdit,
  onDelete,
  onConfirm,
}: ActivityCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Card
          hover
          className={cn([
            "overflow-hidden",
            activity.isConfirmed ? "border-sage-500 dark:border-sage-500" : "",
          ])}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Image Section */}
            <div className="p-3 shrink-0">
              <div className="w-full sm:w-[400px] h-80 rounded-xl overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                {activity.image ? (
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Compass
                    size={48}
                    className="text-slate-300 dark:text-slate-700"
                    strokeWidth={1.5}
                  />
                )}
              </div>
            </div>

            {/* Content Section */}
            <CardContent className="pt-4 flex-1">
              <div className="flex items-start justify-between gap-3 w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center shrink-0">
                    <Compass size={16} className="text-lavender-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-[20px] text-text-primary wrap-break-word whitespace-normal line-clamp-2">
                      {activity.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {destinationName && (
                        <Badge
                          variant="default"
                          className="text-[10px] h-5 py-0 px-2 bg-lavender-50 text-lavender-600 border-lavender-100"
                        >
                          <MapPin size={10} className="mr-1" />
                          {destinationName}
                        </Badge>
                      )}
                      {activity.type && (
                        <Badge
                          variant="default"
                          className="text-[10px] h-5 py-0 px-2 border-lavender-200 text-lavender-600 dark:border-lavender-900/30 dark:text-lavender-400"
                        >
                          {ACTIVITY_TAGS.find((t) => t.value === activity.type)?.icon}{" "}
                          {ACTIVITY_TAGS.find((t) => t.value === activity.type)?.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 justify-between mt-7 text-sm text-text-secondary">
                <div className="flex items-center gap-3">
                  <Calendar size={17} />
                  <span>{formatDate(activity.date)}</span>
                </div>
                {activity.duration && (
                  <div className="flex items-center gap-3">
                    <Clock size={17} />
                    <span>{formatDuration(activity.duration)}</span>
                  </div>
                )}
                {activity.cost !== undefined && activity.cost > 0 && (
                  <div className="flex items-center gap-3">
                    <DollarSign size={17} />
                    <span>{formatCurrency(activity.cost, activity.currency)}</span>
                  </div>
                )}
                {activity.link && (
                  <div>
                    <a
                      href={activity.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-lavender-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                      View Link
                    </a>
                  </div>
                )}
              </div>

              {activity.notes && (
                <p className="max-w-70 mt-2 overflow-auto text-xs text-text-muted bg-surface-3 rounded-lg px-3 py-2">
                  {activity.notes}
                </p>
              )}
            </CardContent>
          </div>

          <CardFooter className="h-15 justify-between bg-surface-2/50 border-t border-border">
            <div className="flex items-center gap-1 shrink-0">
              {activity.isConfirmed ? (
                <Badge variant="confirmed">
                  <CheckCircle size={10} />
                  Confirmed
                </Badge>
              ) : (
                <Badge variant="option">Option</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!activity.isConfirmed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onConfirm(activity.id!)}
                  className="text-lavender-600"
                >
                  <CheckCircle size={14} />
                  Confirm
                </Button>
              )}
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(activity)}>
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
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete(activity.id!);
          setDeleteOpen(false);
        }}
        title="Delete Activity"
        description={`Delete "${activity.name}"?`}
      />
    </>
  );
}
