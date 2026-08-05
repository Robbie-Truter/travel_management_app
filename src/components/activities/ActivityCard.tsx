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
import { formatCurrency, formatDuration, cn, formatDate } from "@/lib/utils";
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

  const activityType = ACTIVITY_TAGS.find((t) => t.value === activity.type);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="h-full w-full max-w-full lg:w-[380px]"
      >
        <Card
          hover
          className={cn([
            "overflow-hidden h-full w-full group flex flex-col border-border/60",
            activity.isConfirmed ? "border-sage-500/50" : "",
          ])}
        >
          {/* Header Area - Consistent with TripCountries and Destinations */}
          <div
            className={cn(
              "p-4 flex items-center gap-3 border-b border-border transition-colors rounded-t-2xl",
              activity.isConfirmed
                ? "bg-sage-50/50 dark:bg-sage-900/10"
                : "bg-surface-2/80 backdrop-blur-xs",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-border shadow-sm",
                activity.isConfirmed ? "bg-sage-100 dark:bg-sage-900/30" : "bg-surface-3",
              )}
            >
              <Compass
                size={18}
                className={activity.isConfirmed ? "text-sage-600" : "text-lavender-500"}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-text-primary truncate">{activity.name}</h2>
              {destinationName && (
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-text-muted mt-0.5">
                  <MapPin size={10} className="text-text-muted/60" />
                  <span>{destinationName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(activity);
                }}
              >
                <Edit size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-rose-pastel-400 hover:text-rose-pastel-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          <CardContent className="p-0 flex flex-col h-full bg-surface">
            {/* Visual Section */}
            <div className="relative h-52 w-full overflow-hidden border-b border-border/40">
              {activity.image ? (
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-fuchsia-pastel-50 to-lavender-50 dark:from-fuchsia-pastel-900/10 dark:to-lavender-900/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-fuchsia-pastel-400/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-lavender-400/20 rounded-full blur-3xl animate-pulse delay-500" />
                  </div>
                  <Compass
                    size={48}
                    className="text-fuchsia-pastel-200 dark:text-fuchsia-pastel-800 relative z-10"
                    strokeWidth={1}
                  />
                </div>
              )}
              {/* Overlay Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {activityType && (
                  <Badge
                    variant="default"
                    className="shadow-lg backdrop-blur-md bg-white/90 dark:bg-black/40 text-text-primary border-none text-[10px] h-6"
                  >
                    {activityType.icon} <span className="ml-1.5">{activityType.label}</span>
                  </Badge>
                )}
              </div>
              <div className="absolute top-3 right-3">
                {activity.isConfirmed ? (
                  <Badge
                    variant="confirmed"
                    className="shadow-lg backdrop-blur-md bg-sage-500/90 text-white border-none h-6"
                  >
                    <CheckCircle size={10} />
                    Confirmed
                  </Badge>
                ) : (
                  <Badge
                    variant="option"
                    className="shadow-lg backdrop-blur-md bg-surface/90 text-text-primary border-none h-6 text-[10px]"
                  >
                    Option
                  </Badge>
                )}
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Essential Metadata */}
            <div className="px-5 py-5 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">
                    Date
                  </span>
                  <div className="flex items-center gap-2 text-sm text-text-primary font-medium">
                    <Calendar size={14} className="text-text-muted" />
                    {formatDate(activity.date)}
                  </div>
                </div>
                {activity.duration && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">
                      Duration
                    </span>
                    <div className="flex items-center gap-2 text-sm text-text-primary font-medium">
                      <Clock size={14} className="text-text-muted" />
                      {formatDuration(activity.duration)}
                    </div>
                  </div>
                )}
              </div>

              {activity.cost !== undefined && activity.cost > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">
                    Cost
                  </span>
                  <div className="flex items-center gap-2 text-sm text-text-primary font-semibold">
                    <DollarSign size={14} className="text-text-muted" />
                    {formatCurrency(activity.cost, activity.currency)}
                  </div>
                </div>
              )}

              {activity.notes ? (
                <div className="pt-4 border-t border-border/40">
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 italic font-medium">
                    "{activity.notes}"
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 opacity-40">
                  <p className="text-xs text-text-muted italic">No extra notes</p>
                </div>
              )}
            </div>
          </CardContent>

          {/* Integrated Actions */}
          <CardFooter
            className={cn(
              "border-t border-border flex justify-end items-center h-12  transition-colors",
              activity.isConfirmed ? "bg-sage-50/30" : "bg-surface-2/40",
            )}
          >
            <div className="flex items-center gap-2">
              {activity.link && (
                <a
                  href={activity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-lavender-600 transition-colors"
                >
                  <ExternalLink size={12} />
                  Official Link
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!activity.isConfirmed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onConfirm(activity.id!)}
                  className="text-sage-600 hover:bg-sage-100/50 h-7 px-3 text-xs font-bold rounded-lg border border-transparent hover:border-sage-200"
                >
                  <CheckCircle size={12} className="mr-1" />
                  Confirm
                </Button>
              )}
              {activity.isConfirmed && (
                <div className="text-[10px] font-bold text-sage-500/80 uppercase tracking-widest hidden sm:block">
                  Bucket List Item
                </div>
              )}
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
