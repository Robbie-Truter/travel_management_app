import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function AccommodationSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-white dark:bg-slate-900/50 min-h-[400px]">
      <div className="flex flex-col sm:flex-row h-full">
        {/* Image Skeleton */}
        <div className="p-3 shrink-0">
          <div className="w-full sm:w-[400px] h-80 rounded-xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </div>

        <CardContent className="pt-4 flex-1 space-y-6">
          {/* Title & Info */}
          <div className="space-y-3">
            <div className="h-6 w-3/4 bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </div>
            <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0">
                  <motion.div
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                </div>
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export function AccommodationRefetchingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <RefreshCw size={12} className="text-emerald-500" />
      </motion.div>
      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
        Updating Stays
      </span>
    </motion.div>
  );
}
