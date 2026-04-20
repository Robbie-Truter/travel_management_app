import { AlertCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface TripErrorStateProps {
  message?: string;
  onRetry: () => void;
}

function TripErrorState({ message, onRetry }: TripErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex justify-center py-12 px-4"
    >
      <Card className="max-w-md w-full p-8 border-rose-pastel-100 dark:border-rose-pastel-900 bg-linear-to-b from-surface to-rose-pastel-50/10 dark:to-rose-pastel-900/10 shadow-xl overflow-hidden relative">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-pastel-500" />

        <div className="flex flex-col items-center text-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-pastel-500/20 blur-xl rounded-full" />
            <div className="relative w-16 h-16 rounded-2xl bg-rose-pastel-50 dark:bg-rose-pastel-900/30 flex items-center justify-center text-rose-pastel-500 border border-rose-pastel-200 dark:border-rose-pastel-800">
              <AlertCircle size={32} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-text-primary tracking-tight">
              Failed to load trips
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto font-medium">
              {message ||
                "We encountered an error while fetching your journey data. This could be due to a connection issue or a server error."}
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={onRetry}
            className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold"
          >
            <RefreshCcw size={18} />
            Try Again
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export default TripErrorState;
