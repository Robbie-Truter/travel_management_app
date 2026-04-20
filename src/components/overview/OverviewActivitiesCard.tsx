import { AnimatePresence } from "framer-motion";
import { Compass, Calendar, AlertCircle, RefreshCcw } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatCurrency, formatDuration } from "@/lib/utils";
import { CardSkeleton, OverviewRefetchingIndicator } from "./OverviewLoadingStates";

const ACTIVITY_TAGS = [
  { value: "sightseeing", label: "Sightseeing", icon: "🏛️" },
  { value: "dining", label: "Dining", icon: "🍽️" },
  { value: "adventure", label: "Adventure", icon: "🌋" },
  { value: "culture", label: "Culture", icon: "🎭" },
  { value: "relaxation", label: "Relaxation", icon: "🧘" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "entertainment", label: "Entertainment", icon: "🍿" },
  { value: "sport", label: "Sport", icon: "⚽" },
  { value: "nature", label: "Nature", icon: "🌳" },
  { value: "other", label: "Other", icon: "📍" },
];

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
  countryMap: Record<number, string>;
}

export function OverviewActivitiesCard({ tripId, countryMap }: Props) {
  const { activities, loading, isRefetching, isError, refetch } = useActivities(tripId);

  if (loading) return <CardSkeleton />;

  if (isError) {
    return (
      <Card className="flex flex-col p-0 h-110 overflow-hidden">
        <div className="bg-teal-pastel-50 dark:bg-teal-pastel-900/10 p-5 border-b border-teal-pastel-100 dark:border-teal-pastel-900/20 shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2 text-teal-pastel-700 dark:text-teal-pastel-400">
            <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
              <Compass size={18} className="text-teal-pastel-500" />
            </div>
            Activities
          </h3>
        </div>
        <div className="grow flex flex-col items-center justify-center gap-3 p-5 text-center">
          <AlertCircle size={24} className="text-rose-pastel-400" />
          <p className="text-sm text-text-secondary font-medium">Failed to load activities</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCcw size={13} />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const now = new Date();
  const confirmedActivities = activities.filter((a) => a.isConfirmed);
  const unconfirmedActivities = activities.filter((a) => !a.isConfirmed);
  const upcomingActivities = activities
    .filter((a) => new Date(a.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <AnimatePresence>{isRefetching && <OverviewRefetchingIndicator />}</AnimatePresence>
      <Card className="flex flex-col p-0 h-110 overflow-hidden group hover:shadow-card-hover transition-shadow">
        <div className="bg-teal-pastel-50 dark:bg-teal-pastel-900/10 p-5 border-b border-teal-pastel-100 dark:border-teal-pastel-900/20 shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2 text-teal-pastel-700 dark:text-teal-pastel-400">
            <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
              <Compass size={18} className="text-teal-pastel-500" />
            </div>
            Activities
          </h3>
        </div>
        <div className="grow p-5 overflow-y-auto">
          {activities.length > 0 ? (
            <div className="flex flex-col h-full space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-text-primary">{activities.length}</p>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Total
                  </p>
                </div>
                <div className="border-l border-border pl-4">
                  <p className="text-3xl font-bold text-sage-600">{confirmedActivities.length}</p>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Confirmed
                  </p>
                </div>
              </div>
              {upcomingActivities.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Upcoming
                  </h4>
                  <ul className="space-y-3">
                    {upcomingActivities.slice(0, 3).map((a) => (
                      <li key={a.id} className="group/item">
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="text-sm font-semibold text-text-primary group-hover/item:text-lavender-600 transition-colors">
                            {a.name}
                          </span>
                          {!a.isConfirmed && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold uppercase tracking-tighter border border-amber-100">
                              Planning
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 my-1">
                          {a.tripCountryId && (
                            <span className="text-[9px] text-text-muted px-1.5 py-0.5 bg-surface-3 rounded border border-border">
                              {countryMap[a.tripCountryId]}
                            </span>
                          )}
                          {a.type && (
                            <Badge
                              variant="default"
                              className="text-[9px] h-4 py-0 px-1.5 opacity-80"
                            >
                              {ACTIVITY_TAGS.find((t) => t.value === a.type)?.icon}{" "}
                              {ACTIVITY_TAGS.find((t) => t.value === a.type)?.label}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                          <span>{formatDate(a.date)}</span>
                          {a.cost !== undefined && a.cost > 0 && (
                            <span className="flex items-center gap-0.5 text-sage-600 font-medium">
                              • {formatCurrency(a.cost, a.currency)}
                            </span>
                          )}
                          {a.duration && (
                            <span className="text-text-muted">• {formatDuration(a.duration)}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto">
                <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg font-medium border border-amber-100/50">
                  {`${unconfirmedActivities.length > 0 ? unconfirmedActivities.length : "No"} activit${unconfirmedActivities.length !== 1 ? "ies" : "y"} in planning phase`}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState icon={Compass} label="No activities yet" />
          )}
        </div>
      </Card>
    </>
  );
}
