import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function BudgetBreakdownSkeleton() {
  return (
    <Card className="mt-10 overflow-hidden border-border/50 bg-white dark:bg-slate-900/50 shadow-md">
      {/* Header Skeleton */}
      <div className="bg-rose-pastel-50 dark:bg-rose-pastel-900/10 p-4 sm:p-6 border-b border-rose-pastel-100 dark:border-rose-pastel-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white dark:bg-surface-2 rounded-xl shadow-sm h-10 w-10 animate-pulse relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 sm:p-6 space-y-12">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-border pb-3 gap-3">
              <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-10 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-border/30 animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function BudgetBreakdownRefetchingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-pastel-50 dark:bg-rose-pastel-900/20 border border-rose-pastel-100 dark:border-rose-pastel-800"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <RefreshCw size={12} className="text-rose-pastel-500" />
      </motion.div>
    </motion.div>
  );
}
