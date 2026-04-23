import Widget from "../ui/Widget";
import { useTrip } from "@/hooks/useTrips";
import { useFlights } from "@/hooks/useFlights";
import { useAccommodations } from "@/hooks/useAccommodations";
import { useActivities } from "@/hooks/useActivities";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface BudgetWidgetProps {
  tripId: number;
}

export default function BudgetWidget({ tripId }: BudgetWidgetProps) {
  const { trip, isLoading: isLoadingTrip } = useTrip(tripId);
  const { flights, isLoading: isLoadingFlights } = useFlights(tripId);
  const { accommodations, loading: isLoadingAcc } = useAccommodations(tripId);
  const { activities, isLoading: isLoadingAct } = useActivities(tripId);

  const isLoading = isLoadingTrip || isLoadingFlights || isLoadingAcc || isLoadingAct;

  const expenses = useMemo(() => {
    let confirmed = 0;
    let pending = 0;

    flights.forEach((f) => {
      if (f.isConfirmed) confirmed += f.price || 0;
      else pending += f.price || 0;
    });

    accommodations.forEach((a) => {
      if (a.isConfirmed) confirmed += a.price || 0;
      else pending += a.price || 0;
    });

    activities.forEach((a) => {
      if (a.isConfirmed) confirmed += a.cost || 0;
      else pending += a.cost || 0;
    });

    return {
      confirmed,
      pending,
      total: confirmed + pending,
    };
  }, [flights, accommodations, activities]);

  const currency = trip?.baseCurrency || "USD";

  // Premium currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const confirmedPercentage = expenses.total > 0 ? (expenses.confirmed / expenses.total) * 100 : 0;

  return (
    <Widget title="Expenses Summary" icon={<Wallet size={14} />}>
      <div className="flex flex-col justify-center h-full pt-1">
        {isLoading ? (
          <div className="animate-pulse space-y-5 opacity-70">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`space-y-2 ${i === 2 ? "border-l border-r border-border/40 px-3" : i === 3 ? "pl-2" : ""}`}
                >
                  <div className="h-2 w-12 bg-border/40 rounded" />
                  <div className="h-5 w-20 bg-border/30 rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-2 w-24 bg-border/40 rounded" />
                <div className="h-2 w-8 bg-border/30 rounded" />
              </div>
              <div className="h-2 w-full bg-border/20 rounded-full" />
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-3 gap-2 items-center">
              <div>
                <div className="text-[9px] uppercase font-bold tracking-widest text-text-muted mb-1">
                  Confirmed
                </div>
                <div
                  className="text-xl font-black text-emerald-500 tracking-tighter truncate"
                  title={formatCurrency(expenses.confirmed)}
                >
                  {formatCurrency(expenses.confirmed)}
                </div>
              </div>

              <div className="border-l border-r border-border/40 px-3">
                <div className="text-[9px] uppercase font-bold tracking-widest text-text-muted mb-1">
                  Pending
                </div>
                <div
                  className="text-xl font-black text-amber-500 tracking-tighter truncate"
                  title={formatCurrency(expenses.pending)}
                >
                  {formatCurrency(expenses.pending)}
                </div>
              </div>

              <div className="pl-2">
                <div className="text-[9px] uppercase font-bold tracking-widest text-text-muted mb-1">
                  Total
                </div>
                <div
                  className="text-xl font-black text-text-primary tracking-tighter truncate"
                  title={formatCurrency(expenses.total)}
                >
                  {formatCurrency(expenses.total)}
                </div>
              </div>
            </div>

            {/* Premium Split Progress Bar */}
            <div className="space-y-2 bg-surface-3/30 p-3 rounded-xl border border-border/40">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                  Confirmed Spend Ratio
                </span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                  {confirmedPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-amber-400/40 dark:bg-amber-500/30 rounded-full overflow-hidden border border-border/30 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confirmedPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="absolute left-0 top-0 bottom-0 rounded-full shadow-sm bg-emerald-500 dark:bg-emerald-400"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Widget>
  );
}
