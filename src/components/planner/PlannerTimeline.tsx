import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { Plane, Hotel, Compass, GripVertical } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Flight, Accommodation, Activity } from "@/db/types";
import { cn } from "@/lib/utils";

interface PlannerItem {
  id: string;
  type: "flight" | "accommodation" | "activity";
  date: string;
  data: Flight | Accommodation | Activity;
}

interface PlannerTimelineProps {
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
  tripStartDate: string;
  tripEndDate: string;
  onReorderActivities: (updates: { id: number; order: number }[]) => void;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function PlannerTimeline({
  flights,
  accommodations,
  activities,
  tripStartDate,
  tripEndDate,
  onReorderActivities,
}: PlannerTimelineProps) {
  const dates = getDatesInRange(tripStartDate, tripEndDate);

  const [localActivities, setLocalActivities] = useState(activities);

  // Keep local state in sync when activities change externally
  if (
    JSON.stringify(activities.map((a) => a.id)) !== JSON.stringify(localActivities.map((a) => a.id))
  ) {
    setLocalActivities(activities);
  }

  const getItemsForDate = useCallback(
    (date: string) => {
      const items: PlannerItem[] = [];

      flights.forEach((f) => {
        const depDate = f.departureTime.split("T")[0];
        if (depDate === date) {
          items.push({ id: `flight-${f.id}`, type: "flight", date, data: f });
        }
      });

      accommodations.forEach((a) => {
        if (a.checkIn <= date && a.checkOut > date) {
          items.push({ id: `acc-${a.id}`, type: "accommodation", date, data: a });
        }
      });

      return items;
    },
    [flights, accommodations],
  );

  const getActivitiesForDate = (date: string) =>
    localActivities.filter((a) => a.date === date).sort((a, b) => a.order - b.order);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index)
      return;

    const actId = Number(draggableId.replace("activity-", ""));
    const destDate = destination.droppableId.replace("activities-", "");
    const destActivities = getActivitiesForDate(destDate).filter((a) => a.id !== actId);
    destActivities.splice(destination.index, 0, localActivities.find((a) => a.id === actId)!);

    const updated = localActivities.map((a) => {
      const idx = destActivities.findIndex((da) => da.id === a.id);
      if (idx !== -1) return { ...a, date: destDate, order: idx };
      return a;
    });

    setLocalActivities(updated);
    onReorderActivities(
      updated.filter((a) => a.id !== undefined).map((a) => ({ id: a.id!, order: a.order })),
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-100">
        {dates.map((date) => {
          const staticItems = getItemsForDate(date);
          const dayActivities = getActivitiesForDate(date);

          return (
            <div key={date} className="shrink-0 w-72">
              <div className="mb-3 px-1">
                <p className="font-semibold text-sm text-text-primary">
                  {formatDate(date, "EEE, MMM d")}
                </p>
              </div>

              <div className="space-y-2">
                {/* Static items (flights, accommodations) */}
                {staticItems.map((item) => (
                  <StaticPlannerCard key={item.id} item={item} />
                ))}

                {/* Draggable activities */}
                <Droppable droppableId={`activities-${date}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-20 rounded-xl p-2 transition-colors",
                        snapshot.isDraggingOver
                          ? "bg-lavender-50 dark:bg-lavender-900/20 border-2 border-dashed border-lavender-300"
                          : "border-2 border-dashed border-transparent",
                      )}
                    >
                      {dayActivities.map((activity, index) => (
                        <Draggable
                          key={activity.id}
                          draggableId={`activity-${activity.id}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "mb-2 rounded-lg bg-surface border border-border p-3 flex items-center gap-2 shadow-sm",
                                snapshot.isDragging && "shadow-lg rotate-1 opacity-90",
                              )}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="text-text-muted cursor-grab"
                              >
                                <GripVertical size={14} />
                              </div>
                              <div className="w-6 h-6 rounded-md bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center shrink-0">
                                <Compass size={12} className="text-lavender-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-text-primary truncate">
                                  {activity.name}
                                </p>
                                {activity.cost !== undefined && activity.cost > 0 && (
                                  <p className="text-xs text-text-muted">
                                    {formatCurrency(activity.cost, activity.currency)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {dayActivities.length === 0 && (
                        <p className="text-xs text-text-muted text-center py-4">
                          Drop activities here
                        </p>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

function StaticPlannerCard({ item }: { item: PlannerItem }) {
  const icons = {
    flight: {
      icon: Plane,
      color: "text-sky-pastel-500",
      bg: "bg-sky-pastel-100 dark:bg-sky-pastel-900/30",
    },
    accommodation: {
      icon: Hotel,
      color: "text-lavender-500",
      bg: "bg-lavender-100 dark:bg-lavender-900/30",
    },
    activity: {
      icon: Compass,
      color: "text-lavender-500",
      bg: "bg-lavender-100 dark:bg-lavender-900/30",
    },
  };
  const { icon: Icon, color, bg } = icons[item.type];

  const getLabel = () => {
    if (item.type === "flight") {
      const f = item.data as Flight;
      return `${f.airline} ${f.flightNumber} · ${f.departureAirport}→${f.arrivalAirport}`;
    }
    if (item.type === "accommodation") {
      const a = item.data as Accommodation;
      return `${a.name} (check-in)`;
    }
    return (item.data as Activity).name;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg bg-surface border border-border p-3 flex items-center gap-2 shadow-sm"
    >
      <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", bg)}>
        <Icon size={12} className={color} />
      </div>
      <p className="text-xs font-medium text-text-primary truncate">{getLabel()}</p>
    </motion.div>
  );
}
