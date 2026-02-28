import type { Flight, Accommodation, Activity, Trip } from "@/db/types";
import { useNotes } from "@/hooks/useNotes";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plane, Hotel, Compass, Calendar, StickyNote, Plus, PiggyBank } from "lucide-react";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { useMemo } from "react";
import { useExchangeRates } from "@/hooks/useExchangeRates";

interface TripOverviewProps {
  trip: Trip;
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
}

function EmptyState({
  icon: Icon,
  label,
  action,
  actionLabel,
}: {
  icon: React.ElementType;
  label: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="text-center p-4">
      <Icon size={24} className="mx-auto text-gray-400" />
      <p className="mt-2 text-sm text-gray-500">{label}</p>
      {action && actionLabel && (
        <Button variant="primary" size="sm" onClick={action} className="mt-2">
          <Plus size={14} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function TripOverview({ trip, flights, accommodations, activities }: TripOverviewProps) {
  const { note } = useNotes(trip.id!);
  const { data: currencyRates } = useExchangeRates();

  const upcomingFlights = flights.filter((f) => new Date(f.departureTime) > new Date());
  const confirmedStays = accommodations.filter((a) => a.isConfirmed);
  const upcomingActivities = activities.filter((a) => new Date(a.date) > new Date());

  // Calculate totals by currency and total in base currency (USD)
  const { budgetBreakdown, totalInBase } = useMemo(() => {
    const breakdown: Record<
      string,
      { total: number; flights: number; stays: number; activities: number }
    > = {};
    let totalCost = 0;

    const ensureCurrency = (currency: string) => {
      const c = currency.toUpperCase();
      if (!breakdown[c]) {
        breakdown[c] = { total: 0, flights: 0, stays: 0, activities: 0 };
      }
      return c;
    };

    const convertCurrency = (
      amount: number,
      from: "USD" | "EUR" | "ZAR",
      to: "USD" | "EUR" | "ZAR",
    ) => {
      if (!currencyRates) return 0;

      const rates = currencyRates;
      return amount * (rates[from] / rates[to]);
    };

    flights.forEach((f) => {
      const c = ensureCurrency(f.currency);
      breakdown[c].flights += f.price;
      breakdown[c].total += f.price;
      totalCost += convertCurrency(f.price, f.currency as "USD" | "EUR" | "ZAR", "ZAR");
    });

    accommodations.forEach((a) => {
      const c = ensureCurrency(a.currency);
      breakdown[c].stays += a.price;
      breakdown[c].total += a.price;
      totalCost += convertCurrency(a.price, a.currency as "USD" | "EUR" | "ZAR", "ZAR");
    });

    activities.forEach((a) => {
      const c = ensureCurrency(a.currency);
      const cost = a.cost || 0;
      breakdown[c].activities += cost;
      breakdown[c].total += cost;
      totalCost += convertCurrency(cost, a.currency as "USD" | "EUR" | "ZAR", "ZAR");
    });

    return { budgetBreakdown: breakdown, totalInBase: totalCost };
  }, [flights, accommodations, activities, currencyRates]);

  const currencies = Object.keys(budgetBreakdown);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-0 overflow-hidden group hover:shadow-card-hover transition-shadow">
          <div className="bg-sky-pastel-50 dark:bg-sky-pastel-900/10 p-5 border-b border-sky-pastel-100 dark:border-sky-pastel-900/20">
            <h3 className="font-bold text-lg flex items-center gap-2 text-sky-pastel-700 dark:text-sky-pastel-400">
              <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
                <Plane size={18} className="text-sky-pastel-500" />
              </div>
              Flights
            </h3>
          </div>
          <div className="p-5">
            {flights.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-text-primary">{flights.length}</p>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Total Flights
                  </p>
                </div>

                {upcomingFlights.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-semibold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                      <Calendar size={12} />
                      Upcoming
                    </h4>
                    <ul className="space-y-3">
                      {upcomingFlights.slice(0, 2).map((f) => (
                        <li key={f.id} className="group/item">
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-sm font-semibold text-text-primary group-hover/item:text-sky-pastel-600 transition-colors">
                              {f.airline} {f.flightNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary flex items-center gap-1">
                            {formatDate(f.departureTime)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState icon={Plane} label="No flights yet" />
            )}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden group hover:shadow-card-hover transition-shadow">
          <div className="bg-lavender-50 dark:bg-lavender-900/10 p-5 border-b border-lavender-100 dark:border-lavender-900/20">
            <h3 className="font-bold text-lg flex items-center gap-2 text-lavender-700 dark:text-lavender-400">
              <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
                <Hotel size={18} className="text-lavender-500" />
              </div>
              Stays
            </h3>
          </div>
          <div className="p-5">
            {accommodations.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-text-primary">{accommodations.length}</p>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Total Stays
                  </p>
                </div>
                <div className="border-l border-border pl-4">
                  <p className="text-3xl font-bold text-sage-600">{confirmedStays.length}</p>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Confirmed
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState icon={Hotel} label="No accommodations yet" />
            )}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden group hover:shadow-card-hover transition-shadow">
          <div className="bg-teal-pastel-50 dark:bg-teal-pastel-900/10 p-5 border-b border-teal-pastel-100 dark:border-teal-pastel-900/20">
            <h3 className="font-bold text-lg flex items-center gap-2 text-teal-pastel-700 dark:text-teal-pastel-400">
              <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
                <Compass size={18} className="text-teal-pastel-500" />
              </div>
              Activities
            </h3>
          </div>
          <div className="p-5">
            {activities.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-text-primary">{activities.length}</p>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Total Activities
                  </p>
                </div>
                {upcomingActivities.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-semibold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                      <Calendar size={12} />
                      Upcoming
                    </h4>
                    <ul className="space-y-3">
                      {upcomingActivities.slice(0, 2).map((a) => (
                        <li key={a.id} className="group/item">
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-sm font-semibold text-text-primary group-hover/item:text-lavender-600 transition-colors">
                              {a.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary flex items-center gap-1">
                            {formatDate(a.date)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState icon={Compass} label="No activities yet" />
            )}
          </div>
        </Card>

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
            <p className="text-3xl font-bold text-text-primary">
              {flights.length + accommodations.length + activities.length}
            </p>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Planned Items
            </p>
          </div>
        </Card>

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
      </div>
      <Card className="mt-10 p-0 overflow-hidden shadow-md">
        <div className="bg-rose-pastel-50 dark:bg-rose-pastel-900/10 p-6 border-b border-rose-pastel-100 dark:border-rose-pastel-900/20">
          <h3 className="font-bold text-xl flex items-center gap-2 text-rose-pastel-700 dark:text-rose-pastel-400">
            <div className="p-2 bg-white dark:bg-surface-2 rounded-xl shadow-sm">
              <PiggyBank size={22} className="text-rose-pastel-500" />
            </div>
            Budget Breakdown
          </h3>
        </div>
        <div className="p-6">
          {currencies.length > 0 ? (
            <div className="space-y-8">
              {currencies.map((curr) => {
                const data = budgetBreakdown[curr];
                return (
                  <div key={curr} className="space-y-4">
                    <div className="flex justify-between items-end border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-surface-3 rounded text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                          {curr}
                        </span>
                        <span className="text-sm font-semibold text-text-muted">
                          Total Expenses
                        </span>
                      </div>
                      <span className="font-bold text-2xl text-text-primary">
                        {formatCurrency(data.total, curr as "USD" | "EUR" | "ZAR")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-sky-pastel-50/50 dark:bg-sky-pastel-900/5 border border-sky-pastel-100/50 dark:border-sky-pastel-900/10">
                        <p className="text-[10px] font-bold text-sky-pastel-600 uppercase mb-1">
                          Flights
                        </p>
                        <p className="text-sm font-bold text-text-primary">
                          {formatCurrency(data.flights, curr as "USD" | "EUR" | "ZAR")}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/5 border border-slate-100/50 dark:border-slate-900/10">
                        <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Stays</p>
                        <p className="text-sm font-bold text-text-primary">
                          {formatCurrency(data.stays, curr as "USD" | "EUR" | "ZAR")}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-lavender-50/50 dark:bg-lavender-900/5 border border-lavender-100/50 dark:border-lavender-900/10">
                        <p className="text-[10px] font-bold text-lavender-600 uppercase mb-1">
                          Activities
                        </p>
                        <p className="text-sm font-bold text-text-primary">
                          {formatCurrency(data.activities, curr as "USD" | "EUR" | "ZAR")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {currencies.length > 0 && (
                <div className="mt-8 p-5 bg-surface-2 rounded-xl border border-border shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                        Estimated Grand Total
                      </p>
                      <p className="text-2xl font-black text-lavender-600">
                        {formatCurrency(totalInBase, "ZAR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-lavender-100 text-lavender-700 uppercase tracking-tighter">
                        ZAR BASE
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted mt-3 italic">
                    * Exchange rates are approximate and for planning purposes only.
                  </p>
                </div>
              )}

              {trip.budget && (
                <div className="mt-6 pt-6 border-t border-dashed border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                        Target Budget
                      </p>
                      <p className="text-lg font-bold text-text-secondary">{trip.budget}</p>
                    </div>
                    {currencies.length > 0 && (
                      <div
                        className={cn(
                          "px-4 py-2 rounded-lg font-bold text-sm shadow-sm",
                          parseFloat(trip.budget.replace(/[^0-9.]/g, "")) < totalInBase
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100",
                        )}
                      >
                        {parseFloat(trip.budget.replace(/[^0-9.]/g, "")) < totalInBase
                          ? "Over Budget"
                          : "Under Budget"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState icon={PiggyBank} label="No costs added yet" />
          )}
        </div>
      </Card>
    </>
  );
}
