import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function NoteSkeleton() {
  return (
    <Card className="min-h-[400px] overflow-hidden border-border/50 bg-white dark:bg-slate-900/50 p-6">
      <div className="space-y-4">
        {/* Title Shimmer */}
        <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>

        {/* Content Shimmer lines */}
        <div className="space-y-3 pt-2">
          {[95, 80, 90, 75, 85, 95, 70, 85].map((width, i) => (
            <div
              key={i}
              className="h-4 bg-slate-50 dark:bg-slate-800/50 rounded relative overflow-hidden"
              style={{ width: `${width}%` }}
            >
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent dark:via-white/5"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function NoteRefetchingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <RefreshCw size={12} className="text-slate-500" />
      </motion.div>
    </motion.div>
  );
}
