import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card
          key={i}
          className="h-110 overflow-hidden relative border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm"
        >
          {/* Header Shimmer */}
          <div className="h-16 bg-slate-50/80 dark:bg-slate-900/40 border-b border-border p-5 flex items-center justify-between relative overflow-hidden">
            <div className="h-6 w-32 bg-slate-200/60 dark:bg-slate-800/60 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent dark:via-white/10"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </div>
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </div>

          <div className="p-5 space-y-6">
            {/* Main Stats Shimmer */}
            <div className="space-y-2">
              <div className="h-10 w-24 bg-slate-200/60 dark:bg-slate-800/60 rounded relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent dark:via-white/10"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </div>
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/40 rounded relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </div>
            </div>

            {/* List Items Shimmer */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
              {[1, 2].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/40 rounded relative overflow-hidden">
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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md overflow-hidden group border border-white/20 dark:border-black/10"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="text-sky-400 dark:text-sky-600"
      >
        <RefreshCw size={16} />
      </motion.div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-0.5">
          Live Syncing
        </span>
        <span className="text-[9px] font-medium opacity-70 leading-none">
          Updating Trip Overview
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-sky-500/30 overflow-hidden">
        <motion.div
          className="h-full bg-sky-500"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
