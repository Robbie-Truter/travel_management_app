import { useMemo, useState, useCallback } from "react";
import type { Trip, TripCountry } from "@/db/types";
import { Card } from "@/components/ui/Card";
import { PiggyBank, RefreshCw, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { CURRENCIES } from "@/constants/currencies";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { OverviewFlightsCard } from "./OverviewFlightsCard";
import { OverviewAccommodationsCard } from "./OverviewAccommodationsCard";
import { OverviewActivitiesCard } from "./OverviewActivitiesCard";
import { OverviewCountriesCard } from "./OverviewCountriesCard";
import { OverviewPlannerCard } from "./OverviewPlannerCard";
import { OverviewNotesCard } from "./OverviewNotesCard";

interface TripOverviewProps {
  trip: Trip;
  tripCountries: TripCountry[];
}

export function OverviewTab({ trip, tripCountries }: TripOverviewProps) {
  const { flights } = useFlights(trip.id!);
  const { accommodations } = useAccommodations(trip.id!);
  const { activities } = useActivities(trip.id!);

  const { data: currencyRates } = useExchangeRates();
  const [displayCurrency, setDisplayCurrency] = useState(trip.baseCurrency);

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

  const countryMap = useMemo(() => {
    const map: Record<number, string> = {};
    tripCountries.forEach((tc) => {
      if (tc.id) map[tc.id] = tc.countryName;
    });
    return map;
  }, [tripCountries]);

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

    const baseCurrency = trip.baseCurrency.toUpperCase();

    const addItemToBreakdown = (
      amount: number,
      currency: string,
      type: "flights" | "stays" | "activities",
      isConfirmed: boolean,
    ) => {
      const c = (currency || baseCurrency).toUpperCase();
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

      breakdown[c][type] += amount;
      breakdown[c].total += amount;

      const costInBase = convertCurrency(amount, c, baseCurrency);

      if (isConfirmed) {
        breakdown[c].confirmedTotal += amount;
        breakdown[c][
          `confirmed${(type.charAt(0).toUpperCase() + type.slice(1)) as "Flights" | "Stays" | "Activities"}`
        ] += amount;
        confirmedTotalCost += costInBase;
      } else {
        breakdown[c].unconfirmedTotal += amount;
      }
      totalCost += costInBase;
    };

    flights.forEach((f) => addItemToBreakdown(f.price, f.currency, "flights", f.isConfirmed));
    accommodations.forEach((a) => addItemToBreakdown(a.price, a.currency, "stays", a.isConfirmed));
    activities.forEach((a) =>
      addItemToBreakdown(a.cost || 0, a.currency, "activities", a.isConfirmed),
    );

    return {
      budgetBreakdown: breakdown,
      totalInBase: totalCost,
      confirmedTotalInBase: confirmedTotalCost,
    };
  }, [flights, accommodations, activities, trip.baseCurrency, convertCurrency]);

  const currencies = useMemo(() => Object.keys(budgetBreakdown), [budgetBreakdown]);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Countries Card */}
        <OverviewCountriesCard tripCountries={tripCountries} />

        {/* Flights Card */}
        <OverviewFlightsCard tripId={trip.id!} />

        {/* Accommodations Card */}
        <OverviewAccommodationsCard tripId={trip.id!} countryMap={countryMap} />

        {/* Activities Card */}
        <OverviewActivitiesCard tripId={trip.id!} countryMap={countryMap} />

        {/* Planner Card */}
        <OverviewPlannerCard
          plannedItemsCount={flights.length + accommodations.length + activities.length}
        />

        {/* Notes Card */}
        <OverviewNotesCard tripId={trip.id!} />
      </div>

      {/* Budget Breakdown Summary */}
      <Card className="mt-10 p-0 overflow-hidden shadow-md border-rose-pastel-100/50">
        <div className="bg-rose-pastel-50 dark:bg-rose-pastel-900/10 p-4 sm:p-6 border-b border-rose-pastel-100 dark:border-rose-pastel-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-xl flex items-center gap-2 text-rose-pastel-700 dark:text-rose-pastel-400">
            <div className="p-2 bg-white dark:bg-surface-2 rounded-xl shadow-sm">
              <PiggyBank size={22} className="text-rose-pastel-500" />
            </div>
            Budget Breakdown
          </h3>

          {totalInBase > 0 && (
            <div className="flex flex-col items-start sm:items-end gap-1">
              <div className="flex flex-col items-start sm:items-end">
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
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="font-black text-2xl sm:text-3xl text-text-primary">
                          {formatCurrency(data.total, curr)}
                        </span>
                        {displayCurrency !== curr && (
                          <span className="text-xs font-bold text-rose-pastel-600/80 mt-1">
                            ~{" "}
                            {formatCurrency(
                              convertCurrency(data.total, curr, displayCurrency),
                              displayCurrency,
                            )}
                          </span>
                        )}
                        <div className="flex flex-col items-end mt-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-sage-600 uppercase">
                              Confirmed: {formatCurrency(data.confirmedTotal, curr)}
                            </span>
                            <span className="text-[10px] font-bold text-amber-600 uppercase">
                              Planned: {formatCurrency(data.unconfirmedTotal, curr)}
                            </span>
                          </div>
                          {displayCurrency !== curr && (
                            <div className="flex items-center gap-3 mt-0.5 opacity-70">
                              <span className="text-[9px] font-bold text-sage-600 uppercase">
                                ~{" "}
                                {formatCurrency(
                                  convertCurrency(data.confirmedTotal, curr, displayCurrency),
                                  displayCurrency,
                                )}
                              </span>
                              <span className="text-[9px] font-bold text-amber-600 uppercase">
                                ~{" "}
                                {formatCurrency(
                                  convertCurrency(data.unconfirmedTotal, curr, displayCurrency),
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
                          {formatCurrency(data.flights, curr)}
                        </p>
                        <p className="text-[9px] text-text-muted mt-1 font-medium">
                          {formatCurrency(data.confirmedFlights, curr)} Confirmed
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/5 border border-slate-100/50 dark:border-slate-900/10">
                        <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Stays</p>
                        <p className="text-base font-bold text-text-primary">
                          {formatCurrency(data.stays, curr)}
                        </p>
                        <p className="text-[9px] text-text-muted mt-1 font-medium">
                          {formatCurrency(data.confirmedStays, curr)} Confirmed
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-teal-pastel-50/50 dark:bg-teal-pastel-900/5 border border-teal-pastel-100/50 dark:border-teal-pastel-900/10">
                        <p className="text-[10px] font-bold text-teal-pastel-600 uppercase mb-1">
                          Activities
                        </p>
                        <p className="text-base font-bold text-text-primary">
                          {formatCurrency(data.activities, curr)}
                        </p>
                        <p className="text-[9px] text-text-muted mt-1 font-medium">
                          {formatCurrency(data.confirmedActivities, curr)} Confirmed
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
