import { Provider, Root, Title, Description, Viewport, Close } from "@radix-ui/react-toast";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationProps {
  title: string;
  description?: string;
  type: NotificationType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const icons = {
  success: <CheckCircle2 className="text-emerald-600" size={20} />,
  error: <AlertCircle className="text-rose-600" size={20} />,
  warning: <AlertTriangle className="text-amber-600" size={20} />,
  info: <Info className="text-sky-600" size={20} />,
};

const Notification = ({
  title,
  description,
  type = "info",
  open,
  onOpenChange,
}: NotificationProps) => {
  return (
    <Provider swipeDirection="right">
      <AnimatePresence>
        {open && (
          <Root forceMount open={open} onOpenChange={onOpenChange} duration={4000} asChild>
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20, scale: 0.95, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                scale: 0.95,
                filter: "blur(4px)",
                transition: { duration: 0.15 },
              }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className={cn(
                "group relative flex w-full max-w-[383px] flex-col gap-3.5 overflow-hidden rounded-xl border-2 bg-surface p-5 shadow-modal",
                type === "success" && "border-emerald-100 bg-sage-50 dark:bg-sage-900",
                type === "error" &&
                  "border-rose-pastel-100 bg-rose-pastel-50 dark:bg-rose-pastel-900",
                type === "warning" &&
                  "border-amber-pastel-100 bg-amber-pastel-50 dark:bg-amber-pastel-900",
                type === "info" && "border-sky-pastel-100 bg-sky-pastel-50 dark:bg-sky-pastel-900",
              )}
            >
              {/* Vertical accent bar for stronger type distinction */}
              <div
                className={cn(
                  "absolute left-0 top-0 h-full w-1.5",
                  type === "success" && "bg-emerald-500",
                  type === "error" && "bg-rose-pastel-500",
                  type === "warning" && "bg-amber-pastel-500",
                  type === "info" && "bg-sky-pastel-500",
                )}
              />

              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-0.5">{icons[type]}</div>
                <div className="flex flex-col gap-1.5 pr-8">
                  <Title className="text-base font-bold text-text-primary leading-tight">
                    {title}
                  </Title>
                  {description && (
                    <Description className="text-sm font-medium text-text-secondary leading-relaxed">
                      {description}
                    </Description>
                  )}
                </div>

                <Close
                  className={cn(
                    "absolute right-3 top-3 rounded-lg p-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-lavender-400/50 cursor-pointer",
                    "text-text-muted hover:bg-surface-2 hover:text-text-primary",
                  )}
                  aria-label="Close"
                >
                  <X size={16} strokeWidth={2.5} />
                </Close>
              </div>

              {/* Animated Progress Bar */}
              <div className="absolute bottom-0 left-0 h-1 w-full bg-border/20">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  className={cn(
                    "h-full",
                    type === "success" && "bg-emerald-500",
                    type === "error" && "bg-rose-pastel-500",
                    type === "warning" && "bg-amber-pastel-500",
                    type === "info" && "bg-sky-pastel-500",
                  )}
                />
              </div>
            </motion.div>
          </Root>
        )}
      </AnimatePresence>

      <Viewport className="fixed top-0 right-0 z-200 m-0 flex max-w-[100vw] list-none flex-col gap-2 p-6 outline-none" />
    </Provider>
  );
};

export default Notification;
