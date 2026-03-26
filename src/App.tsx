import { useState, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { TripPage } from "@/pages/TripPage";
import { MapsPage } from "@/pages/MapsPage";
import { BrochurePage } from "@/pages/BrochurePage";
import { AuthPage } from "@/pages/AuthPage";
import { TripForm } from "@/components/trips/TripForm";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useTrips } from "@/hooks/useTrips";
import { importTripFromJSON } from "@/lib/export";
import { queryClient } from "@/lib/queryClient";
import type { Trip } from "@/db/types";

function AppContent() {
  const { addTrip } = useTrips();
  const [newTripOpen, setNewTripOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const handleNewTrip = async (data: Omit<Trip, "id" | "createdAt" | "updatedAt">) => {
    await addTrip(data);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importTripFromJSON(file);
    } catch (err) {
      console.error("Import failed", err);
    }
    e.target.value = "";
  };

  return (
    <AppShell onNewTrip={() => setNewTripOpen(true)} onImport={() => importRef.current?.click()}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/trips/:tripId" element={<TripPage />} />
        <Route path="/maps" element={<MapsPage />} />
        <Route path="/brochure" element={<BrochurePage />} />
      </Routes>

      <TripForm open={newTripOpen} onClose={() => setNewTripOpen(false)} onSave={handleNewTrip} />

      <input
        ref={importRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </AppShell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <AppContent />
                </AuthGuard>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
