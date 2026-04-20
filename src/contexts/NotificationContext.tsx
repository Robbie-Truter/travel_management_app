import { useCallback, useState, type ReactNode } from "react";
import { NotificationContext } from "./NotificationContextInstance";
import Notification from "@/components/ui/Notification";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationState {
  open: boolean;
  message: string;
  type: NotificationType;
  description: string;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<NotificationState>({
    open: false,
    message: "",
    type: "info",
    description: "",
  });

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" | "warning", description?: string) => {
      setToast({
        open: true,
        message,
        type,
        description: description ?? "",
      });
    },
    [setToast],
  );

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setToast({
        open: false,
        message: "",
        type: "info",
        description: "",
      });
    } else {
      setToast((prev) => ({ ...prev, open }));
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <Notification
        open={toast.open}
        onOpenChange={onOpenChange}
        title={toast.message}
        description={toast.description}
        type={toast.type}
      />
    </NotificationContext.Provider>
  );
}
