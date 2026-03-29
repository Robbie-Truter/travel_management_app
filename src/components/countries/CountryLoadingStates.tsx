import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function CountrySkeleton() {
  return (
    <Card className="overflow-hidden h-64 border-border/50 bg-white dark:bg-slate-900/50">
      <div className="h-14 bg-slate-50 dark:bg-slate-800/50 border-b border-border flex items-center px-4">
        <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 animate-pulse mr-3 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>
        <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>
      </div>
      <CardContent className="p-5 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-4 w-full bg-slate-50 dark:bg-slate-800/50 rounded animate-pulse relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CountryRefetchingIndicator() {
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
        Updating Countries
      </span>
    </motion.div>
  );
}
