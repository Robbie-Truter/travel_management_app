import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function DestSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-white dark:bg-slate-900/50">
      <div className="flex flex-col sm:flex-row h-full">
        {/* Image Skeleton */}
        <div className="sm:w-48 h-48 sm:h-40 shrink-0 bg-slate-100 dark:bg-slate-800 relative border-b sm:border-b-0 sm:border-r border-border overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-1/2 bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </div>
            <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </div>
          </div>

          <div className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function DestRefetchingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <RefreshCw size={12} className="text-rose-500" />
      </motion.div>
      <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
        Updating Destinations
      </span>
    </motion.div>
  );
}
