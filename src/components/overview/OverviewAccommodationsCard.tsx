import { AnimatePresence } from "framer-motion";
import { Hotel, Calendar, AlertCircle, RefreshCcw } from "lucide-react";
import { useAccommodations } from "@/hooks/useAccommodations";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
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
  countryMap: Record<number, string>;
}

export function OverviewAccommodationsCard({ tripId, countryMap }: Props) {
  const { accommodations, loading, isRefetching, isError, refetch } = useAccommodations(tripId);

  if (loading) return <CardSkeleton />;

  if (isError) {
    return (
      <Card className="flex flex-col p-0 h-110 overflow-hidden">
        <div className="bg-lavender-50 dark:bg-lavender-900/10 p-5 border-b border-lavender-100 dark:border-lavender-900/20 shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2 text-lavender-700 dark:text-lavender-400">
            <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
              <Hotel size={18} className="text-lavender-500" />
            </div>
            Stays
          </h3>
        </div>
        <div className="grow flex flex-col items-center justify-center gap-3 p-5 text-center">
          <AlertCircle size={24} className="text-rose-pastel-400" />
          <p className="text-sm text-text-secondary font-medium">Failed to load stays</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCcw size={13} />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const now = new Date();
  const confirmedStays = accommodations.filter((a) => a.isConfirmed);
  const unconfirmedStays = accommodations.filter((a) => !a.isConfirmed);
  const upcomingStays = accommodations
    .filter((a) => new Date(a.checkIn) >= now)
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

  return (
    <>
      <AnimatePresence>{isRefetching && <OverviewRefetchingIndicator />}</AnimatePresence>
      <Card className="flex flex-col p-0 h-110 overflow-hidden group hover:shadow-card-hover transition-shadow">
        <div className="bg-lavender-50 dark:bg-lavender-900/10 p-5 border-b border-lavender-100 dark:border-lavender-900/20 shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2 text-lavender-700 dark:text-lavender-400">
            <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
              <Hotel size={18} className="text-lavender-500" />
            </div>
            Stays
          </h3>
        </div>
        <div className="grow p-5 overflow-y-auto">
          {accommodations.length > 0 ? (
            <div className="flex flex-col h-full space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-text-primary">{accommodations.length}</p>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Total
                  </p>
                </div>
                <div className="border-l border-border pl-4">
                  <p className="text-3xl font-bold text-sage-600">{confirmedStays.length}</p>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Confirmed
                  </p>
                </div>
              </div>

              {upcomingStays.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Upcoming
                  </h4>
                  <ul className="space-y-3">
                    {upcomingStays.slice(0, 2).map((a) => (
                      <li key={a.id} className="group/item">
                        <div className="flex justify-between items-start mb-0.5">
                          <div className="text-sm font-semibold text-text-primary group-hover/item:text-lavender-600 transition-colors">
                            {a.tripCountryId && (
                              <span className="font-semibold">{countryMap[a.tripCountryId]}, </span>
                            )}
                            {a.name}
                          </div>
                          {!a.isConfirmed && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold uppercase tracking-tighter border border-amber-100">
                              Planning
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-secondary flex items-center gap-1">
                          {a.location}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          {formatDate(a.checkIn, "MMM d")} - {formatDate(a.checkOut, "MMM d")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto">
                <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg font-medium border border-amber-100/50">
                  {`${unconfirmedStays.length > 0 ? unconfirmedStays.length : "No"} stay${unconfirmedStays.length !== 1 ? "s" : ""} in planning phase`}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState icon={Hotel} label="No accommodations yet" />
          )}
        </div>
      </Card>
    </>
  );
}
