import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, MapPin, Navigation, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TripCountry } from "@/db/types";
import { useDestinations } from "@/hooks/useDestinations";

interface TripSetupChecklistProps {
  tripId: number;
  tripCountries: TripCountry[];
  onNavigate: (tab: string) => void;
}

interface ChecklistStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  done: boolean;
  navigateTo: string;
  cta: string;
}

export function TripSetupChecklist({ tripId, tripCountries, onNavigate }: TripSetupChecklistProps) {
  const { destinations } = useDestinations(tripId);

  const steps: ChecklistStep[] = useMemo(
    () => [
      {
        id: "countries",
        label: "Add a country",
        description: "Choose the countries you'll be visiting",
        icon: MapPin,
        done: tripCountries.length > 0,
        navigateTo: "countries",
        cta: "Add Country",
      },
      {
        id: "destinations",
        label: "Add a destination",
        description: "Add at least one city or town within your countries",
        icon: Navigation,
        done: destinations.length > 0,
        navigateTo: "destinations",
        cta: "Add Destination",
      },
    ],
    [tripCountries, destinations],
  );

  const allDone = steps.every((s) => s.done);
  const completedCount = steps.filter((s) => s.done).length;

  // Once fully complete, don't render anything
  if (allDone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mb-5 rounded-2xl border border-lavender-200 dark:border-lavender-800/60 bg-linear-to-br from-lavender-50/80 to-indigo-pastel-50/60 dark:from-lavender-900/20 dark:to-indigo-pastel-900/10 overflow-hidden shadow-sm"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lavender-100 dark:bg-lavender-900/40 flex items-center justify-center shrink-0">
              <Sparkles size={17} className="text-lavender-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-primary">Set up your trip</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Complete these steps to start planning flights, stays, and activities.
              </p>
            </div>
          </div>

          {/* Progress pill */}
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lavender-100 dark:bg-lavender-900/40 border border-lavender-200 dark:border-lavender-800">
            <span className="text-xs font-bold text-lavender-600 dark:text-lavender-400">
              {completedCount}/{steps.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-5 mb-3 h-1 rounded-full bg-lavender-100 dark:bg-lavender-900/40 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-lavender-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Steps */}
        <div className="px-5 pb-5 space-y-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLocked = i > 0 && !steps[i - 1].done;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                  step.done
                    ? "bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-200/60 dark:border-emerald-800/30"
                    : isLocked
                      ? "bg-surface/50 border-border/40 opacity-50 cursor-not-allowed"
                      : "bg-white/70 dark:bg-surface-2/60 border-lavender-200/80 dark:border-lavender-800/40 cursor-pointer hover:border-lavender-400 hover:shadow-sm group",
                )}
                onClick={() => !step.done && !isLocked && onNavigate(step.navigateTo)}
              >
                {/* Status icon */}
                <div className="shrink-0">
                  {step.done ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <Circle
                      size={18}
                      className={cn(
                        isLocked
                          ? "text-text-muted"
                          : "text-lavender-400 group-hover:text-lavender-500",
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon
                      size={13}
                      className={cn(
                        step.done
                          ? "text-emerald-500"
                          : isLocked
                            ? "text-text-muted"
                            : "text-lavender-500",
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        step.done
                          ? "text-emerald-700 dark:text-emerald-400 line-through opacity-70"
                          : isLocked
                            ? "text-text-muted"
                            : "text-text-primary",
                      )}
                    >
                      {step.label}
                    </span>
                    {isLocked && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface border border-border text-text-muted font-medium">
                        Locked
                      </span>
                    )}
                  </div>
                  {!step.done && (
                    <p
                      className={cn(
                        "text-xs mt-0.5",
                        isLocked ? "text-text-muted" : "text-text-secondary",
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                </div>

                {/* CTA arrow */}
                {!step.done && !isLocked && (
                  <div className="shrink-0 flex items-center gap-1 text-lavender-500 group-hover:translate-x-0.5 transition-transform">
                    <span className="text-xs font-semibold hidden sm:block">{step.cta}</span>
                    <ChevronRight size={15} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
