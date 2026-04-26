import { useState } from "react";
import type { TripCountry } from "@/db/types";
import { SquareChartGantt } from "lucide-react";
import { Responsive, useContainerWidth, type Layout } from "react-grid-layout";
import DestinationsWidget from "./DestinationWidget";
import ActivitiesWidget from "./ActivitiesWidget";
import FlightsWidget from "./FlightsWidget";
import StaysWidget from "./StaysWidget";
import BudgetWidget from "./BudgetWidget";
import PlannerWidget from "./PlannerWidget";
import NotesWidget from "./NotesWidget";
import CountdownWidget from "./CountdownWidget";
import { TripSetupChecklist } from "./TripSetupChecklist";

interface TripOverviewProps {
  tripId: number;
  tripCountries: TripCountry[];
  onNavigate: (tab: string) => void;
}

const OverviewTab = ({ tripId, tripCountries, onNavigate }: TripOverviewProps) => {
  const { width, containerRef, mounted } = useContainerWidth();

  const [activeLayouts, setActiveLayouts] = useState(() => {
    const saved = localStorage.getItem("overviewLayout");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved layout", e);
        return null;
      }
    }
    return null;
  });

  const layouts = {
    lg: [
      { i: "countdown", x: 0, y: 0, w: 4, h: 5 },
      { i: "stats", x: 4, y: 0, w: 4, h: 5 },
      { i: "notes", x: 8, y: 0, w: 4, h: 5 },
      { i: "flights", x: 0, y: 5, w: 7, h: 6 },
      { i: "planner", x: 7, y: 5, w: 5, h: 11 },
      { i: "stays", x: 0, y: 11, w: 7, h: 5 },
      { i: "destinations", x: 0, y: 16, w: 6, h: 6 },
      { i: "activities", x: 6, y: 16, w: 6, h: 6 },
    ],
    md: [
      { i: "countdown", x: 0, y: 0, w: 4, h: 5 },
      { i: "stats", x: 4, y: 0, w: 6, h: 5 },
      { i: "flights", x: 0, y: 5, w: 6, h: 6 },
      { i: "planner", x: 6, y: 5, w: 4, h: 11 },
      { i: "stays", x: 0, y: 11, w: 6, h: 5 },
      { i: "destinations", x: 0, y: 16, w: 5, h: 6 },
      { i: "activities", x: 5, y: 16, w: 5, h: 6 },
      { i: "notes", x: 0, y: 22, w: 10, h: 4 },
    ],
    sm: [
      { i: "countdown", x: 0, y: 0, w: 6, h: 5 },
      { i: "stats", x: 0, y: 5, w: 6, h: 5 },
      { i: "planner", x: 0, y: 10, w: 6, h: 8 },
      { i: "flights", x: 0, y: 18, w: 6, h: 6 },
      { i: "stays", x: 0, y: 24, w: 6, h: 5 },
      { i: "activities", x: 0, y: 29, w: 6, h: 6 },
      { i: "destinations", x: 0, y: 35, w: 6, h: 6 },
      { i: "notes", x: 0, y: 41, w: 6, h: 4 },
    ],
    xs: [
      { i: "countdown", x: 0, y: 0, w: 4, h: 5 },
      { i: "stats", x: 0, y: 5, w: 4, h: 5 },
      { i: "planner", x: 0, y: 10, w: 4, h: 8 },
      { i: "flights", x: 0, y: 18, w: 4, h: 6 },
      { i: "stays", x: 0, y: 24, w: 4, h: 5 },
      { i: "activities", x: 0, y: 29, w: 4, h: 6 },
      { i: "destinations", x: 0, y: 35, w: 4, h: 6 },
      { i: "notes", x: 0, y: 41, w: 4, h: 4 },
    ],
  };

  const onLayoutChange = (_currentLayout: Layout, allLayouts: Partial<Record<string, Layout>>) => {
    localStorage.setItem("overviewLayout", JSON.stringify(allLayouts));
    setActiveLayouts(allLayouts);
  };

  return (
    <div className="relative">
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div>
          <div className="bg-indigo-pastel-50 dark:bg-indigo-pastel-900/10 p-4 border-b border-indigo-pastel-100 dark:border-indigo-pastel-900/20">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg flex items-center gap-2 text-indigo-pastel-700 dark:text-indigo-pastel-400">
                <SquareChartGantt size={20} className="text-indigo-pastel-500" />
                Overview
              </h2>
              <div className="px-2 py-0.5 bg-indigo-pastel-100/50 dark:bg-indigo-pastel-900/30 border border-indigo-pastel-200/50 dark:border-indigo-pastel-800/50 rounded-full flex items-center gap-1.5 shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-pastel-500 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-pastel-600 dark:text-indigo-pastel-400 uppercase tracking-tight">
                  Draggable Layout
                </span>
              </div>
            </div>
          </div>

          <div className="py-4 bg-surface-1">
            <div ref={containerRef} className="max-w-7xl mx-auto space-y-4">
              <header className="flex items-end justify-between px-2">
                <div>
                  <h1 className="text-xl font-bold text-text-primary tracking-tight">
                    Dashboard Workspace
                  </h1>
                  <p className="text-[11px] text-text-muted">
                    Drag your trip modules to reorganize your workspace
                  </p>
                </div>
              </header>

              {mounted && (
                <>
                  <TripSetupChecklist
                    tripId={tripId}
                    tripCountries={tripCountries}
                    onNavigate={onNavigate}
                  />
                  <Responsive
                  layouts={activeLayouts || layouts}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                  width={width}
                  rowHeight={40}
                  dragConfig={{ handle: ".cursor-grab" }}
                  containerPadding={[10, 10]}
                  className="transition-all"
                  onLayoutChange={onLayoutChange}
                >
                  <div key="countdown">
                    <CountdownWidget tripId={tripId} />
                  </div>

                  <div key="destinations">
                    <DestinationsWidget tripId={tripId} tripCountries={tripCountries} />
                  </div>

                  <div key="activities">
                    <ActivitiesWidget tripId={tripId} />
                  </div>

                  <div key="flights">
                    <FlightsWidget tripId={tripId} />
                  </div>

                  <div key="planner">
                    <PlannerWidget tripId={tripId} />
                  </div>

                  <div key="stats">
                    <BudgetWidget tripId={tripId} />
                  </div>

                  <div key="stays">
                    <StaysWidget tripId={tripId} />
                  </div>

                  <div key="notes">
                    <NotesWidget tripId={tripId} />
                  </div>
                  </Responsive>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
