import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function DocumentSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-white dark:bg-slate-900/50 min-h-[500px] flex flex-col">
      {/* Visual Preview Skeleton */}
      <div className="h-64 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700/50" />
      </div>

      <CardContent className="p-6 flex flex-col flex-1">
        <div className="space-y-3">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4">
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </div>
          </div>

          {/* Type/Metadata row */}
          <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>

          {/* Description row */}
          <div className="space-y-2 pt-4">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </div>
            <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </div>
          </div>
        </div>

        {/* Footer actions skeleton */}
        <div className="mt-auto pt-6 flex items-center justify-between">
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 relative overflow-hidden" />
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 relative overflow-hidden" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DocumentRefetchingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-lavender-50 dark:bg-lavender-900/20 border border-lavender-100 dark:border-lavender-800"
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
