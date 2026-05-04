import { createContext } from "react";

export interface NotificationContextType {
  showToast: (
    message: string,
    type: "success" | "error" | "info" | "warning",
    description?: string,
  ) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
