import { Buffer } from "buffer";
window.Buffer = Buffer;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";
import "./index.css";
import App from "./App.tsx";
import { NotificationProvider } from "./contexts/NotificationContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </NotificationProvider>
    </QueryClientProvider>
  </StrictMode>,
);
