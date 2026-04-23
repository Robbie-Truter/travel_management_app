import type { TripCountry } from "@/db/types";
import { Compass, Files, Hotel, Plane, SquareChartGantt } from "lucide-react";
import { Responsive, useContainerWidth } from "react-grid-layout";
import Widget from "../ui/Widget";
import DestinationsWidget from "./DestinationWidget";
import ActivitiesWidget from "./ActivitiesWidget";
import FlightsWidget from "./FlightsWidget";
import StaysWidget from "./StaysWidget";
import BudgetWidget from "./BudgetWidget";

interface TripOverviewProps {
  tripId: number;
  tripCountries: TripCountry[];
}

export function OverviewTab({ tripId, tripCountries }: TripOverviewProps) {
  const { width, containerRef, mounted } = useContainerWidth();

  const layouts = {
    lg: [
      { i: "routeExplorer", x: 0, y: 0, w: 8, h: 6 },
      { i: "destinations", x: 8, y: 0, w: 3, h: 4 },
      { i: "activities", x: 0, y: 0, w: 4, h: 5 },
      { i: "flights", x: 4, y: 0, w: 4, h: 6 },
      { i: "activity", x: 8, y: 0, w: 4, h: 5.5 },
      { i: "stats", x: 0, y: 0, w: 4, h: 4 },
      { i: "stays", x: 4, y: 11, w: 4, h: 4 },
      { i: "docs", x: 8, y: 0, w: 3, h: 4 },
    ],
    md: [
      { i: "routeExplorer", x: 0, y: 0, w: 10, h: 8 },
      { i: "stats", x: 0, y: 8, w: 5, h: 4 },
      { i: "flights", x: 5, y: 8, w: 5, h: 4 },
      { i: "activity", x: 0, y: 12, w: 6, h: 6 },
      { i: "stays", x: 6, y: 12, w: 4, h: 4 },
      { i: "activities", x: 0, y: 18, w: 5, h: 5 },
      { i: "destinations", x: 5, y: 18, w: 5, h: 5 },
      { i: "docs", x: 0, y: 23, w: 10, h: 4 },
    ],
    sm: [
      { i: "routeExplorer", x: 0, y: 0, w: 6, h: 8 },
      { i: "stats", x: 0, y: 8, w: 3, h: 4 },
      { i: "flights", x: 3, y: 8, w: 3, h: 4 },
      { i: "activity", x: 0, y: 12, w: 6, h: 6 },
      { i: "stays", x: 0, y: 18, w: 6, h: 4 },
      { i: "activities", x: 0, y: 22, w: 6, h: 5 },
      { i: "destinations", x: 0, y: 27, w: 6, h: 5 },
      { i: "docs", x: 0, y: 32, w: 6, h: 4 },
    ],
    xs: [
      { i: "routeExplorer", x: 0, y: 0, w: 4, h: 8 },
      { i: "stats", x: 0, y: 8, w: 4, h: 4 },
      { i: "flights", x: 0, y: 12, w: 4, h: 4 },
      { i: "activity", x: 0, y: 16, w: 4, h: 6 },
      { i: "stays", x: 0, y: 22, w: 4, h: 4 },
      { i: "activities", x: 0, y: 26, w: 4, h: 5 },
      { i: "destinations", x: 0, y: 31, w: 4, h: 5 },
      { i: "docs", x: 0, y: 36, w: 4, h: 4 },
    ],
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
                <Responsive
                  layouts={layouts}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                  width={width}
                  rowHeight={40}
                  dragConfig={{ handle: ".cursor-grab" }}
                  containerPadding={[10, 10]}
                  className="transition-all"
                >
                  <div key="routeExplorer">
                    <Widget title="Route Explorer">
                      <div className="space-y-0 relative">
                        {[
                          {
                            city: "London",
                            code: "LHR",
                            time: "10:30 AM",
                            type: "Departure",
                            icon: "🇬🇧",
                          },
                          {
                            city: "Dubai",
                            code: "DXB",
                            time: "9:15 PM",
                            type: "Layover",
                            icon: "🇦🇪",
                            dur: "7h 45m",
                          },
                          {
                            city: "Tokyo",
                            code: "HND",
                            time: "3:40 PM",
                            type: "Arrival",
                            icon: "🇯🇵",
                            dur: "9h 25m",
                          },
                        ].map((stop, i, arr) => (
                          <div key={i} className="relative pb-6 last:pb-0">
                            {/* Connection Line */}
                            {i < arr.length - 1 && (
                              <div className="absolute left-[15px] top-[30px] bottom-0 w-0.5 border-l-2 border-dashed border-lavender-200" />
                            )}

                            <div className="flex gap-4 items-start relative z-10">
                              <div className="w-8 h-8 rounded-full bg-surface-3 border border-border flex items-center justify-center text-sm shadow-sm shrink-0">
                                {stop.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h5 className="font-bold text-text-primary text-xs truncate">
                                    {stop.city}
                                  </h5>
                                  <span className="text-[10px] font-mono text-lavender-600 bg-lavender-50 px-1.5 rounded">
                                    {stop.code}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                  <p className="text-[10px] text-text-muted capitalize">
                                    {stop.type}
                                  </p>
                                  <p className="text-[10px] font-medium text-text-secondary">
                                    {stop.time}
                                  </p>
                                </div>

                                {stop.dur && (
                                  <div className="mt-3 py-1 px-3 bg-surface-3/50 rounded-lg border border-border/40 inline-flex items-center gap-2">
                                    <span className="text-[9px] text-text-muted">
                                      Flight Duration
                                    </span>
                                    <span className="text-[9px] font-bold text-lavender-600 underline decoration-lavender-200 underline-offset-2">
                                      {stop.dur}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Widget>
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

                  <div key="activity">
                    <Widget title="Mini Planner">
                      <div className="space-y-4">
                        {[
                          {
                            type: "flight",
                            title: "LHR ➔ DXB",
                            sub: "EK008 • 10:30 AM",
                            icon: <Plane size={12} className="text-sky-500" />,
                          },
                          {
                            type: "stay",
                            title: "Check-in: Address Dubai Mall",
                            sub: "Confirmation: #AX921",
                            icon: <Hotel size={12} className="text-rose-500" />,
                          },
                          {
                            type: "activity",
                            title: "Burj Khalifa Sunset Visit",
                            sub: "Entry: 17:45",
                            icon: <Compass size={12} className="text-emerald-500" />,
                          },
                          {
                            type: "flight",
                            title: "DXB ➔ HND",
                            sub: "EK312 • 09:15 PM",
                            icon: <Plane size={12} className="text-sky-500" />,
                          },
                        ].map((item, i) => (
                          <div key={i} className="flex gap-3 items-start group/item">
                            <div className="w-6 h-6 rounded-lg bg-surface-3 flex items-center justify-center shrink-0 border border-border/50 group-hover/item:border-lavender-200 transition-colors">
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold text-text-primary leading-none mb-1">
                                {item.title}
                              </div>
                              <div className="text-[10px] text-text-muted truncate">{item.sub}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Widget>
                  </div>

                  <div key="stats">
                    <BudgetWidget tripId={tripId} />
                  </div>

                  <div key="stays">
                    <StaysWidget tripId={tripId} />
                  </div>

                  <div key="docs">
                    <Widget title="Documents">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "Passport", sub: "PDF • 2.4 MB" },
                          { name: "Visa UAE", sub: "PDF • 1.1 MB" },
                          { name: "Insurance", sub: "DOCX • 0.5 MB" },
                          { name: "Flight Tix", sub: "PDF • 3.8 MB" },
                        ].map((doc, i) => (
                          <div
                            key={i}
                            className="p-2 bg-surface-3/30 border border-border/40 rounded-xl hover:border-lavender-200 transition-colors cursor-pointer group/doc"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Files
                                size={12}
                                className="text-text-muted group-hover/doc:text-lavender-500"
                              />
                              <span className="text-[10px] font-bold text-text-secondary truncate">
                                {doc.name}
                              </span>
                            </div>
                            <div className="text-[8px] text-text-muted font-mono uppercase tracking-tighter">
                              {doc.sub}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Widget>
                  </div>
                </Responsive>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
