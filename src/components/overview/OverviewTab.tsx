import React, { useMemo } from "react";
import type { Trip, TripCountry } from "@/db/types";
import { useNotes } from "@/hooks/useNotes";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plane, Hotel, Compass, Calendar, StickyNote, Plus, PiggyBank, MapPin } from "lucide-react";
import { formatDate, formatCurrency, formatDuration, getCountryFlag } from "@/lib/utils";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { Badge } from "@/components/ui/Badge";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { AnimatePresence } from "framer-motion";
import { OverviewSkeleton, OverviewRefetchingIndicator } from "./OverviewLoadingStates";
import { OverviewErrorState } from "./OverviewErrorState";

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

interface TripOverviewProps {
  trip: Trip;
  tripCountries: TripCountry[];
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

export function OverviewTab({ trip, tripCountries }: TripOverviewProps) {
  const {
    flights,
    loading: flightsLoading,
    isRefetching: flightsRefetching,
    isError: flightsError,
    refetch: refetchFlights,
  } = useFlights(trip.id!);
  const {
    accommodations,
    loading: accsLoading,
    isRefetching: accsRefetching,
    isError: accsError,
    refetch: refetchAccs,
  } = useAccommodations(trip.id!);
  const {
    activities,
    loading: actsLoading,
    isRefetching: actsRefetching,
    isError: actsError,
    refetch: refetchActs,
  } = useActivities(trip.id!);

  const { note } = useNotes(trip.id!);
  const { data: currencyRates } = useExchangeRates();

  const isInitialLoading = flightsLoading || accsLoading || actsLoading;
  const isAnyRefetching = flightsRefetching || accsRefetching || actsRefetching;
  const isAnyError = flightsError || accsError || actsError;

  const handleRetry = () => {
    refetchFlights();
    refetchAccs();
    refetchActs();
  };

  const countryMap = useMemo(() => {
    const map: Record<number, string> = {};
    tripCountries.forEach((tc) => {
      if (tc.id) map[tc.id] = tc.countryName;
    });
    return map;
  }, [tripCountries]);

  // Derived data
  const {
    confirmedFlights,
    unconfirmedFlights,
    upcomingFlights,
    confirmedStays,
    unconfirmedStays,
    upcomingStays,
    confirmedActivities,
    unconfirmedActivities,
    upcomingActivities,
  } = useMemo(() => {
    const now = new Date();
    return {
      confirmedFlights: flights.filter((f) => f.isConfirmed),
      unconfirmedFlights: flights.filter((f) => !f.isConfirmed),
      upcomingFlights: flights.filter((f) => new Date(f.segments[0].departureTime) > now),
      confirmedStays: accommodations.filter((a) => a.isConfirmed),
      unconfirmedStays: accommodations.filter((a) => !a.isConfirmed),
      upcomingStays: accommodations
        .filter((a) => new Date(a.checkIn) >= now)
        .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()),
      confirmedActivities: activities.filter((a) => a.isConfirmed),
      unconfirmedActivities: activities.filter((a) => !a.isConfirmed),
      upcomingActivities: activities
        .filter((a) => new Date(a.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
  }, [flights, accommodations, activities]);

  // Budget calculations
  const { budgetBreakdown, totalInBase, confirmedTotalInBase } = useMemo(() => {
    const breakdown: Record<
      string,
      {
        total: number;
        confirmedTotal: number;
        unconfirmedTotal: number;
        flights: number;
        confirmedFlights: number;
        stays: number;
        confirmedStays: number;
        activities: number;
        confirmedActivities: number;
      }
    > = {};
    let totalCost = 0;
    let confirmedTotalCost = 0;

    const ensureCurrency = (currency: string) => {
      const c = currency.toUpperCase();
      if (!breakdown[c]) {
        breakdown[c] = {
          total: 0,
          confirmedTotal: 0,
          unconfirmedTotal: 0,
          flights: 0,
          confirmedFlights: 0,
          stays: 0,
          confirmedStays: 0,
          activities: 0,
          confirmedActivities: 0,
        };
      }
      return c;
    };

    const convertCurrency = (amount: number, from: string, to: "USD" | "EUR" | "ZAR") => {
      if (!currencyRates) return 0;
      const rates = currencyRates as unknown as Record<string, number>;
      const fromRate = rates[from.toUpperCase()] || 1;
      const toRate = rates[to] || 1;
      // Convert to a baseline then to target
      // If rates are relative to base, then amount * (fromRate/toRate) might be wrong depending on how rates are defined.
      // Usually rates are "1 base = X currency". So baselineValue = amount / fromRate. targetValue = baselineValue * toRate.
      return (amount / fromRate) * toRate;
    };

    flights.forEach((f) => {
      const c = ensureCurrency(f.currency);
      breakdown[c].flights += f.price;
      breakdown[c].total += f.price;
      if (f.isConfirmed) {
        breakdown[c].confirmedFlights += f.price;
        breakdown[c].confirmedTotal += f.price;
        confirmedTotalCost += convertCurrency(f.price, f.currency, "ZAR");
      } else {
        breakdown[c].unconfirmedTotal += f.price;
      }
      totalCost += convertCurrency(f.price, f.currency, "ZAR");
    });

    accommodations.forEach((a) => {
      const c = ensureCurrency(a.currency);
      breakdown[c].stays += a.price;
      breakdown[c].total += a.price;
      if (a.isConfirmed) {
        breakdown[c].confirmedStays += a.price;
        breakdown[c].confirmedTotal += a.price;
        confirmedTotalCost += convertCurrency(a.price, a.currency, "ZAR");
      } else {
        breakdown[c].unconfirmedTotal += a.price;
      }
      totalCost += convertCurrency(a.price, a.currency, "ZAR");
    });

    activities.forEach((a) => {
      const c = ensureCurrency(a.currency);
      const cost = a.cost || 0;
      breakdown[c].activities += cost;
      breakdown[c].total += cost;
      if (a.isConfirmed) {
        breakdown[c].confirmedActivities += cost;
        breakdown[c].confirmedTotal += cost;
        confirmedTotalCost += convertCurrency(cost, a.currency, "ZAR");
      } else {
        breakdown[c].unconfirmedTotal += cost;
      }
      totalCost += convertCurrency(cost, a.currency, "ZAR");
    });

    return {
      budgetBreakdown: breakdown,
      totalInBase: totalCost,
      confirmedTotalInBase: confirmedTotalCost,
    };
  }, [flights, accommodations, activities, currencyRates]);

  const currencies = useMemo(() => Object.keys(budgetBreakdown), [budgetBreakdown]);

  // Early returns for loading and error states
  if (isInitialLoading) {
    return <OverviewSkeleton />;
  }

  if (isAnyError) {
    return <OverviewErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="relative">
      <AnimatePresence>{isAnyRefetching && <OverviewRefetchingIndicator />}</AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Countries Card */}
        <Card className="flex flex-col p-0 h-110 overflow-hidden group hover:shadow-card-hover transition-shadow text-center sm:text-left">
          <div className="bg-lavender-50 dark:bg-lavender-900/10 p-5 border-b border-lavender-100 dark:border-lavender-900/20 text-left shrink-0">
            <h3 className="font-bold text-lg flex items-center gap-2 text-lavender-700 dark:text-lavender-400">
              <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
                <MapPin size={18} className="text-lavender-500" />
              </div>
              Countries
            </h3>
          </div>
          <div className="p-5 flex flex-col h-full overflow-y-auto">
            <div className="grow">
              <p className="text-3xl font-bold text-text-primary">{tripCountries?.length ?? 0}</p>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Countries Visited
              </p>

              {(tripCountries?.length ?? 0) > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tripCountries?.map((tc) => (
                    <span
                      key={tc.id}
                      className="px-2 py-1 bg-surface-3 rounded-md text-[11px] font-medium text-text-primary border border-border flex items-center gap-1.5"
                    >
                      <span className="text-[14px]">{getCountryFlag(tc.countryName)}</span>
                      {tc.countryName}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {(tripCountries?.length ?? 0) === 0 && (
              <p className="text-xs text-text-muted italic mt-2">No countries added yet.</p>
            )}
          </div>
        </Card>

        {/* Flights Card */}
        <Card className="flex flex-col p-0 h-110 overflow-hidden group hover:shadow-card-hover transition-shadow">
          <div className="bg-sky-pastel-50 dark:bg-sky-pastel-900/10 p-5 border-b border-sky-pastel-100 dark:border-sky-pastel-900/20 shrink-0">
            <h3 className="font-bold text-lg flex items-center gap-2 text-sky-pastel-700 dark:text-sky-pastel-400">
              <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm">
                <Plane size={18} className="text-sky-pastel-500" />
              </div>
              Flights
            </h3>
          </div>
          <div className="grow p-5 overflow-y-auto">
            {flights.length > 0 ? (
              <div className="flex flex-col h-full space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-text-primary">{flights.length}</p>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Total
                    </p>
                  </div>
                  <div className="border-l border-border pl-4">
                    <p className="text-3xl font-bold text-sage-600">{confirmedFlights.length}</p>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Confirmed
                    </p>
                  </div>
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
                              {f.description ||
                                `${f.segments[0].airline} ${f.segments[0].flightNumber}`}
                            </span>
                            {!f.isConfirmed && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold uppercase tracking-tighter border border-amber-100">
                                Planning
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-text-secondary flex items-center gap-1">
                            {f.description && (
                              <span className="text-text-muted">
                                {f.segments[0].airline} {f.segments[0].flightNumber} •{" "}
                              </span>
                            )}
                            {formatDate(f.segments[0].departureTime)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-auto">
                  <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg font-medium border border-amber-100/50">
                    {`${unconfirmedFlights?.length > 0 ? unconfirmedFlights?.length : "No"} flight${unconfirmedFlights.length > 1 ? "s" : ""} in planning phase`}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState icon={Plane} label="No flights yet" />
            )}
          </div>
        </Card>

        {/* Accommodations Card */}
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
                                <span className="font-semibold">
                                  {countryMap[a.tripCountryId]},{" "}
                                </span>
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
                    {`${unconfirmedStays?.length > 0 ? unconfirmedStays?.length : "No"} stay${unconfirmedStays.length !== 1 ? "s" : ""} in planning phase`}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState icon={Hotel} label="No accommodations yet" />
            )}
          </div>
        </Card>

        {/* Activities Card */}
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
                              <span className="text-text-muted">
                                • {formatDuration(a.duration)}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-auto">
                  <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg font-medium border border-amber-100/50">
                    {`${unconfirmedActivities?.length > 0 ? unconfirmedActivities?.length : "No"} activit${unconfirmedActivities.length !== 1 ? "ies" : "y"} in planning phase`}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState icon={Compass} label="No activities yet" />
            )}
          </div>
        </Card>

        {/* Planner Card */}
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

        {/* Notes Card */}
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

      {/* Budget Breakdown Summary */}
      <Card className="mt-10 p-0 overflow-hidden shadow-md">
        <div className="bg-rose-pastel-50 dark:bg-rose-pastel-900/10 p-6 border-b border-rose-pastel-100 dark:border-rose-pastel-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-xl flex items-center gap-2 text-rose-pastel-700 dark:text-rose-pastel-400">
            <div className="p-2 bg-white dark:bg-surface-2 rounded-xl shadow-sm">
              <PiggyBank size={22} className="text-rose-pastel-500" />
            </div>
            Budget Breakdown
          </h3>

          {totalInBase > 0 && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Total Trip Value
                </span>
                <span className="text-xl font-black text-text-primary">
                  {formatCurrency(totalInBase, "ZAR")}
                </span>
              </div>
              <div className="text-[10px] font-bold text-sage-600 uppercase mt-0.5">
                Confirmed: {formatCurrency(confirmedTotalInBase, "ZAR")}
              </div>
            </div>
          )}
        </div>
        <div className="p-6">
          {currencies.length > 0 ? (
            <div className="space-y-8">
              {currencies.map((curr) => {
                const data = budgetBreakdown[curr];
                return (
                  <div key={curr} className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-border pb-3 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-surface-3 rounded text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                          {curr}
                        </span>
                        <span className="text-sm font-semibold text-text-muted">Total Budget</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-black text-3xl text-text-primary">
                          {formatCurrency(data.total, curr as "USD" | "ZAR" | "EUR")}
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-sage-600 uppercase">
                            Confirmed:{" "}
                            {formatCurrency(data.confirmedTotal, curr as "USD" | "ZAR" | "EUR")}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 uppercase">
                            Planned:{" "}
                            {formatCurrency(data.unconfirmedTotal, curr as "USD" | "ZAR" | "EUR")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-sky-pastel-50/50 dark:bg-sky-pastel-900/5 border border-sky-pastel-100/50 dark:border-sky-pastel-900/10">
                        <p className="text-[10px] font-bold text-sky-pastel-600 uppercase mb-1">
                          Flights
                        </p>
                        <p className="text-base font-bold text-text-primary">
                          {formatCurrency(data.flights, curr as "USD" | "ZAR" | "EUR")}
                        </p>
                        <p className="text-[9px] text-text-muted mt-1 font-medium">
                          {formatCurrency(data.confirmedFlights, curr as "USD" | "ZAR" | "EUR")}{" "}
                          Confirmed
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/5 border border-slate-100/50 dark:border-slate-900/10">
                        <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Stays</p>
                        <p className="text-base font-bold text-text-primary">
                          {formatCurrency(data.stays, curr as "USD" | "ZAR" | "EUR")}
                        </p>
                        <p className="text-[9px] text-text-muted mt-1 font-medium">
                          {formatCurrency(data.confirmedStays, curr as "USD" | "ZAR" | "EUR")}{" "}
                          Confirmed
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-teal-pastel-50/50 dark:bg-teal-pastel-900/5 border border-teal-pastel-100/50 dark:border-teal-pastel-900/10">
                        <p className="text-[10px] font-bold text-teal-pastel-600 uppercase mb-1">
                          Activities
                        </p>
                        <p className="text-base font-bold text-text-primary">
                          {formatCurrency(data.activities, curr as "USD" | "ZAR" | "EUR")}
                        </p>
                        <p className="text-[9px] text-text-muted mt-1 font-medium">
                          {formatCurrency(data.confirmedActivities, curr as "USD" | "ZAR" | "EUR")}{" "}
                          Confirmed
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <PiggyBank size={40} className="text-slate-200 mb-2" />
              <p className="text-sm text-text-muted">No expenses recorded yet.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
