import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Hotel, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DeleteDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  destinationName: string;
  isDeleting: boolean;
  counts: {
    stays: number;
    activities: number;
  };
}

export function DeleteDestinationModal({
  isOpen,
  onClose,
  onConfirm,
  destinationName,
  isDeleting,
  counts,
}: DeleteDestinationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 text-rose-pastel-500 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-pastel-50 dark:bg-rose-pastel-900/20 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Delete Destination?</h3>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                Are you sure you want to remove{" "}
                <span className="font-bold text-text-primary">{destinationName}</span>? This will
                also permanently delete all associated:
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="p-3 bg-surface-2 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                  <Hotel size={16} className="text-rose-pastel-500 mb-1" />
                  <span className="text-xs font-bold text-text-primary">{counts.stays} Stays</span>
                </div>
                <div className="p-3 bg-surface-2 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                  <Compass size={16} className="text-lavender-500 mb-1" />
                  <span className="text-xs font-bold text-text-primary">
                    {counts.activities} Activities
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={onConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
