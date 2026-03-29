import { motion } from "framer-motion";
import { MapPin, Calendar, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function TripSkeleton() {
  return (
    <Card className="min-h-80 overflow-hidden border-border/50">
      {/* Skeleton Image */}
      <div className="relative h-40 bg-slate-100 dark:bg-slate-800/50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin size={40} className="text-slate-200 dark:text-slate-700" />
        </div>
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      </div>

      <CardContent className="pt-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-5 w-3/4 bg-slate-100 dark:bg-slate-800/50 rounded-md overflow-hidden relative">
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>

        {/* Destination skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-100 dark:bg-slate-800/50" />
          <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800/50 rounded-md overflow-hidden relative">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </div>

        {/* Date skeleton */}
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-slate-200 dark:text-slate-700" />
          <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800/50 rounded-md overflow-hidden relative">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RefetchingIndicator() {
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
      <span className="text-[10px] font-medium text-lavender-600 dark:text-lavender-400 uppercase tracking-wider">
        Syncing
      </span>
    </motion.div>
  );
}
