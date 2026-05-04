import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useFlights } from "@/hooks/useFlights";
import { Info, PiggyBank, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Card } from "../ui/Card";
import { SearchableSelect } from "../ui/SearchableSelect";
import { formatCurrency, getFlagEmoji } from "@/lib/utils";
import { CURRENCIES } from "@/constants/currencies";
import { type Trip } from "@/db/types";
import {
  BudgetBreakdownSkeleton,
  BudgetBreakdownRefetchingIndicator,
} from "./BudgetBreakdownLoadingStates";
import { BudgetBreakdownErrorState } from "./BudgetBreakdownErrorState";

const BudgetBreakdownTab = ({ trip }: { trip: Trip }) => {
  const tripId = trip.id!;
  const [displayCurrency, setDisplayCurrency] = useState(trip.baseCurrency);

  const {
    flights,
    isLoading: flightsLoading,
    isRefetching: flightsRefetching,
    isError: flightsError,
    refetch: refetchFlights,
  } = useFlights(tripId);
  const {
    accommodations,
    isLoading: accLoading,
    isRefetching: accRefetching,
    isError: accError,
    refetch: refetchAccs,
  } = useAccommodations(tripId);
  const {
    activities,
    isLoading: actLoading,
    isRefetching: actRefetching,
    isError: actError,
    refetch: refetchActs,
  } = useActivities(tripId);

  const {
    data: currencyRates,
    isLoading: currencyLoading,
    isRefetching: currencyRefetching,
    error: currencyError,
    refetch: refetchCurrency,
  } = useExchangeRates();

  const convertCurrency = useCallback(
    (amount: number, from: string, to: string) => {
      if (!currencyRates) return 0;
      const rates = currencyRates;
      const fromCode = from.toUpperCase();
      const toCode = to.toUpperCase();
      const fromRate = rates[fromCode] || 1;
      const toRate = rates[toCode] || 1;
      return (amount / fromRate) * toRate;
    },
    [currencyRates],
  );

  // Budget calculations
  const { globalTotals, countryBreakdowns } = useMemo(() => {
    const global = {
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

    const breakdowns = (trip?.tripCountries || []).map((country) => {
      const stats = {
        total: 0,
        confirmedTotal: 0,
        unconfirmedTotal: 0,
        flights: 0,
        confirmedFlights: 0,
        stays: 0,
        confirmedStays: 0,
        activities: 0,
        confirmedActivities: 0,
        countryName: country.countryName,
        countryCode: country.countryCode,
        id: country.id,
      };

      // Calculate flights
      flights.forEach((f) => {
        if (f.tripCountryId === country.id) {
          stats.flights += f.price;
          stats.total += f.price;
          if (f.isConfirmed) {
            stats.confirmedFlights += f.price;
            stats.confirmedTotal += f.price;
          } else {
            stats.unconfirmedTotal += f.price;
          }
        }
      });

      // Calculate stays
      accommodations.forEach((a) => {
        if (a.tripCountryId === country.id) {
          stats.stays += a.price;
          stats.total += a.price;
          if (a.isConfirmed) {
            stats.confirmedStays += a.price;
            stats.confirmedTotal += a.price;
          } else {
            stats.unconfirmedTotal += a.price;
          }
        }
      });

      // Calculate activities
      activities.forEach((a) => {
        if (a.tripCountryId === country.id) {
          const cost = a.cost || 0;
          stats.activities += cost;
          stats.total += cost;
          if (a.isConfirmed) {
            stats.confirmedActivities += cost;
            stats.confirmedTotal += cost;
          } else {
            stats.unconfirmedTotal += cost;
          }
        }
      });

      // Accumulate global
      global.flights += stats.flights;
      global.confirmedFlights += stats.confirmedFlights;
      global.stays += stats.stays;
      global.confirmedStays += stats.confirmedStays;
      global.activities += stats.activities;
      global.confirmedActivities += stats.confirmedActivities;
      global.total += stats.total;
      global.confirmedTotal += stats.confirmedTotal;
      global.unconfirmedTotal += stats.unconfirmedTotal;

      return stats;
    });

    return { globalTotals: global, countryBreakdowns: breakdowns };
  }, [trip.tripCountries, flights, accommodations, activities]);

  const totalInBase = globalTotals.total;
  const confirmedTotalInBase = globalTotals.confirmedTotal;

  const isLoading = flightsLoading || accLoading || actLoading || currencyLoading;
  const isAnyRefetching = flightsRefetching || accRefetching || actRefetching || currencyRefetching;
  const isAnyError = flightsError || accError || actError || currencyError || !trip.tripCountries;

  const refetchAll = () => {
    refetchFlights();
    refetchAccs();
    refetchActs();
    refetchCurrency();
  };

  useEffect(() => {
    refetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <BudgetBreakdownSkeleton />;
  }

  if (isAnyError) {
    return <BudgetBreakdownErrorState onRetry={refetchAll} />;
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="bg-rose-pastel-50 dark:bg-rose-pastel-900/10 p-4 border-b border-rose-pastel-100 dark:border-rose-pastel-900/20">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-rose-pastel-700 dark:text-rose-pastel-400">
              <PiggyBank size={20} className="text-rose-pastel-500" />
              Budget Breakdown
              <span className="text-rose-pastel-600/60 dark:text-rose-pastel-400/40 font-normal text-sm">
                ({trip.baseCurrency})
              </span>
            </h2>
            <AnimatePresence>
              {isAnyRefetching && <BudgetBreakdownRefetchingIndicator />}
            </AnimatePresence>
          </div>
        </div>
        <p className="text-sm text-rose-pastel-600/80 dark:text-rose-pastel-400/80">
          Overview of your trip expenses and budget distribution.
        </p>
      </div>

      <div className="p-6">
        {/* Budget Breakdown Summary */}
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden shadow-sm border-rose-pastel-100/50">
            <div className="bg-rose-pastel-50 dark:bg-rose-pastel-900/10 p-4 sm:p-6 border-b border-rose-pastel-100 dark:border-rose-pastel-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-rose-pastel-700 dark:text-rose-pastel-400">
                <PiggyBank size={20} className="text-rose-pastel-500" />
                Summary
              </h3>

              {totalInBase > 0 && (
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-text-muted">
                        Total Trip Value
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-text-primary">
                        {formatCurrency(totalInBase, trip.baseCurrency)}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-sage-600 uppercase mt-0.5">
                      Confirmed: {formatCurrency(confirmedTotalInBase, trip.baseCurrency)}
                    </div>
                  </div>

                  {displayCurrency !== trip.baseCurrency && (
                    <div className="mt-1 pt-1 border-t border-rose-pastel-200/50 flex flex-col items-start sm:items-end opacity-90 scale-95 origin-left sm:origin-right">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-rose-pastel-600/70">
                          In {displayCurrency}
                        </span>
                        <span className="text-base font-black text-rose-pastel-700">
                          ~{" "}
                          {formatCurrency(
                            convertCurrency(totalInBase, trip.baseCurrency, displayCurrency),
                            displayCurrency,
                          )}
                        </span>
                      </div>
                      <div className="text-[9px] font-bold text-sage-600/70 uppercase">
                        Confirmed: ~{" "}
                        {formatCurrency(
                          convertCurrency(confirmedTotalInBase, trip.baseCurrency, displayCurrency),
                          displayCurrency,
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Currency Converter Control */}
            <div className="px-4 sm:px-6 py-3 bg-surface-2/50 border-b border-border flex flex-col xs:flex-row xs:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-text-secondary">
                <RefreshCw size={14} className="text-rose-pastel-500" />
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  Currency Converter
                </span>
              </div>
              <div className="w-full xs:w-48">
                <SearchableSelect
                  id="converter-currency"
                  value={displayCurrency}
                  options={CURRENCIES.map((c) => ({
                    value: c.code,
                    label: `${c.code} - ${c.name}`,
                  }))}
                  onChange={(val) => setDisplayCurrency(val || trip.baseCurrency)}
                  placeholder="Select currency..."
                  includeSearch
                  isClearable
                  size="sm"
                />
                <p className="mt-1.5 flex items-center justify-end gap-1 text-[9px] text-text-muted font-medium italic">
                  <Info size={10} className="text-rose-pastel-400" />
                  Conversion rates are approximate
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Trip-wide Summary */}
              <div className="mb-10">
                <h4 className="text-[10px] uppercase tracking-widest font-black text-rose-pastel-600 mb-4 px-1">
                  Trip-wide Summary
                </h4>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-rose-pastel-100 pb-3 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-pastel-100 dark:bg-rose-pastel-900/30 flex items-center justify-center">
                        <PiggyBank size={18} className="text-rose-pastel-600" />
                      </div>
                      <span className="text-sm font-semibold text-text-muted italic">
                        Total Potential Costs
                      </span>
                    </div>
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="font-black text-2xl sm:text-3xl text-text-primary">
                        {formatCurrency(globalTotals.total, trip.baseCurrency)}
                      </span>
                      {displayCurrency !== trip.baseCurrency && (
                        <span className="text-xs font-bold text-rose-pastel-600/80 mt-1">
                          ~{" "}
                          {formatCurrency(
                            convertCurrency(globalTotals.total, trip.baseCurrency, displayCurrency),
                            displayCurrency,
                          )}
                        </span>
                      )}
                      <div className="flex flex-col items-start sm:items-end mt-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-sage-600 uppercase">
                            Confirmed:{" "}
                            {formatCurrency(globalTotals.confirmedTotal, trip.baseCurrency)}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 uppercase">
                            Planned:{" "}
                            {formatCurrency(globalTotals.unconfirmedTotal, trip.baseCurrency)}
                          </span>
                        </div>
                        {displayCurrency !== trip.baseCurrency && (
                          <div className="flex items-center gap-3 mt-0.5 opacity-70 origin-left sm:origin-right scale-95 sm:scale-100">
                            <span className="text-[9px] font-bold text-sage-600 uppercase">
                              ~{" "}
                              {formatCurrency(
                                convertCurrency(
                                  globalTotals.confirmedTotal,
                                  trip.baseCurrency,
                                  displayCurrency,
                                ),
                                displayCurrency,
                              )}
                            </span>
                            <span className="text-[9px] font-bold text-amber-600 uppercase">
                              ~{" "}
                              {formatCurrency(
                                convertCurrency(
                                  globalTotals.unconfirmedTotal,
                                  trip.baseCurrency,
                                  displayCurrency,
                                ),
                                displayCurrency,
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-sky-pastel-50/50 dark:bg-sky-pastel-900/5 border border-sky-pastel-100/50 dark:border-sky-pastel-900/10">
                      <p className="text-[10px] font-bold text-sky-pastel-600 uppercase mb-1">
                        Flights
                      </p>
                      <p className="text-base font-bold text-text-primary">
                        {formatCurrency(globalTotals.flights, trip.baseCurrency)}
                      </p>
                      <p className="text-[9px] text-text-muted mt-1 font-medium">
                        {formatCurrency(globalTotals.confirmedFlights, trip.baseCurrency)} Confirmed
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/5 border border-slate-100/50 dark:border-slate-900/10">
                      <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Stays</p>
                      <p className="text-base font-bold text-text-primary">
                        {formatCurrency(globalTotals.stays, trip.baseCurrency)}
                      </p>
                      <p className="text-[9px] text-text-muted mt-1 font-medium">
                        {formatCurrency(globalTotals.confirmedStays, trip.baseCurrency)} Confirmed
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-teal-pastel-50/50 dark:bg-teal-pastel-900/5 border border-teal-pastel-100/50 dark:border-teal-pastel-900/10">
                      <p className="text-[10px] font-bold text-teal-pastel-600 uppercase mb-1">
                        Activities
                      </p>
                      <p className="text-base font-bold text-text-primary">
                        {formatCurrency(globalTotals.activities, trip.baseCurrency)}
                      </p>
                      <p className="text-[9px] text-text-muted mt-1 font-medium">
                        {formatCurrency(globalTotals.confirmedActivities, trip.baseCurrency)}{" "}
                        Confirmed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-Country Breakdown */}
              {countryBreakdowns.length > 0 && (
                <div className="mt-12 sm:mt-16 space-y-8">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-rose-pastel-600 px-1 border-b border-rose-pastel-100 pb-2">
                    Detailed Breakdown per Country
                  </h4>
                  <div className="grid grid-cols-1 gap-12">
                    {countryBreakdowns.map((country) => (
                      <div key={country.id} className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-border pb-3 gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-surface-3 rounded text-[10px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                              <span>{getFlagEmoji(country.countryCode)}</span>
                              <span>{country.countryName}</span>
                            </span>
                            <span className="text-sm font-semibold text-text-muted italic">
                              Total
                            </span>
                          </div>
                          <div className="flex flex-col items-start sm:items-end">
                            <span className="font-bold text-xl sm:text-2xl text-text-primary">
                              {formatCurrency(country.total, trip.baseCurrency)}
                            </span>
                            {displayCurrency !== trip.baseCurrency && (
                              <span className="text-[10px] font-bold text-rose-pastel-600/80 mt-1">
                                ~{" "}
                                {formatCurrency(
                                  convertCurrency(
                                    country.total,
                                    trip.baseCurrency,
                                    displayCurrency,
                                  ),
                                  displayCurrency,
                                )}
                              </span>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] font-bold text-sage-600 uppercase">
                                Confirmed:{" "}
                                {formatCurrency(country.confirmedTotal, trip.baseCurrency)}
                              </span>
                              <span className="text-[10px] font-bold text-amber-600 uppercase">
                                Planned:{" "}
                                {formatCurrency(country.unconfirmedTotal, trip.baseCurrency)}
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
                              {formatCurrency(country.flights, trip.baseCurrency)}
                            </p>
                            <p className="text-[9px] text-text-muted mt-1 font-medium">
                              {formatCurrency(country.confirmedFlights, trip.baseCurrency)}{" "}
                              Confirmed
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/5 border border-slate-100/50 dark:border-slate-900/10">
                            <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">
                              Stays
                            </p>
                            <p className="text-base font-bold text-text-primary">
                              {formatCurrency(country.stays, trip.baseCurrency)}
                            </p>
                            <p className="text-[9px] text-text-muted mt-1 font-medium">
                              {formatCurrency(country.confirmedStays, trip.baseCurrency)} Confirmed
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-teal-pastel-50/50 dark:bg-teal-pastel-900/5 border border-teal-pastel-100/50 dark:border-teal-pastel-900/10">
                            <p className="text-[10px] font-bold text-teal-pastel-600 uppercase mb-1">
                              Activities
                            </p>
                            <p className="text-base font-bold text-text-primary">
                              {formatCurrency(country.activities, trip.baseCurrency)}
                            </p>
                            <p className="text-[9px] text-text-muted mt-1 font-medium">
                              {formatCurrency(country.confirmedActivities, trip.baseCurrency)}{" "}
                              Confirmed
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {countryBreakdowns.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10">
                  <PiggyBank size={40} className="text-slate-200 mb-2" />
                  <p className="text-sm text-text-muted">No expenses recorded yet.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BudgetBreakdownTab;
