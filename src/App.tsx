import { useState, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { TripPage } from "@/pages/TripPage";
import { MapsPage } from "@/pages/MapsPage";
import { TripForm } from "@/components/trips/TripForm";
import { useTrips } from "@/hooks/useTrips";
import { importTripFromJSON } from "@/lib/export";
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
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
