import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";

/** A single card-height shimmer skeleton — used by each individual overview card. */
export function CardSkeleton() {
  return (
    <Card className="h-110 overflow-hidden relative border-border/50 bg-surface/50 backdrop-blur-sm">
      {/* Header Shimmer */}
      <div className="bg-lavender-50 dark:bg-lavender-900/10 p-5 border-b border-lavender-100 dark:border-lavender-900/20 flex items-center gap-2 relative overflow-hidden">
        <div className="p-1.5 bg-white dark:bg-surface-2 rounded-lg shadow-sm w-8 h-8 flex items-center justify-center">
          <div className="w-5 h-5 bg-lavender-100 dark:bg-lavender-800/50 rounded animate-pulse" />
        </div>
        <div className="h-5 w-24 bg-lavender-200/50 dark:bg-lavender-800/50 rounded relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent dark:via-white/10"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>
      </div>

      <div className="p-5 space-y-6">
        <div className="space-y-2">
          <div className="h-10 w-20 bg-slate-100 dark:bg-slate-800/50 rounded-lg relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
          <div className="h-3 w-28 bg-slate-100/50 dark:bg-slate-800/30 rounded relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/40">
          {[1, 2].map((j) => (
            <div key={j} className="space-y-2">
              <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/50 rounded relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                />
              </div>
              <div className="h-3 w-1/2 bg-slate-50 dark:bg-slate-900/40 rounded relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent dark:via-white/5"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/** Full-grid skeleton — renders 6 CardSkeletons. */
export function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OverviewRefetchingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 px-2 py-1 rounded-full bg-lavender-50 dark:bg-lavender-900/20 border border-lavender-100 dark:border-lavender-800 shadow-lg backdrop-blur-sm"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <RefreshCw size={12} className="text-lavender-500" />
      </motion.div>
    </motion.div>
  );
}
