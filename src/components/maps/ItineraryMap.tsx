import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Sphere,
  Graticule,
  ZoomableGroup,
  useMapContext,
} from "react-simple-maps";
import { getPointForDestination, type GeoPoint, loadAirportCoordinates } from "@/lib/geoData";
import type { Flight, Trip } from "@/db/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Plane,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronDown,
  X,
  Route,
} from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ROUTE_COLORS = [
  "#8b5cf6", // violet
  "#0ea5e9", // sky
  "#f43f5e", // rose
  "#10b981", // emerald
  "#f59e0b", // amber
  "#6366f1", // indigo
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
];

// Haversine formula to calculate km between two lat/lon points
function haversineKm(from: [number, number], to: [number, number]): number {
  const R = 6371;
  const [lon1, lat1] = from;
  const [lon2, lat2] = to;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface ConnectionData {
  from: [number, number];
  to: [number, number];
  fromName: string;
  toName: string;
  flightIndex: number;
  flightDesc?: string;
  distanceKm: number;
  isRoundTrip?: boolean;
}

function AnimatedConnection({
  from,
  to,
  index,
  isActive,
  isDimmed,
  onClick,
  isRoundTrip = false,
}: {
  from: [number, number];
  to: [number, number];
  index: number;
  isActive: boolean;
  isDimmed: boolean;
  onClick: () => void;
  isRoundTrip?: boolean;
}) {
  const { path, projection } = useMapContext();

  const p1 = projection ? projection(from) : null;
  const p2 = projection ? projection(to) : null;

  if (!p1 || !p2 || !path) return null;

  const d = path({ type: "LineString", coordinates: [from, to] });
  const color = ROUTE_COLORS[index % ROUTE_COLORS.length];

  // Midpoint for the icon
  const midX = (p1[0] + p2[0]) / 2;
  const midY = (p1[1] + p2[1]) / 2;

  return (
    <g onClick={onClick} className="cursor-pointer">
      {/* Wider invisible hit area */}
      <motion.path
        d={d || ""}
        fill="transparent"
        stroke="transparent"
        strokeWidth={12}
        className="pointer-events-auto"
      />

      {/* Main Path */}
      <motion.path
        d={d || ""}
        fill="transparent"
        stroke={color}
        strokeWidth={isActive ? 2.5 : 1.5}
        strokeLinecap="round"
        strokeDasharray={isActive ? "none" : "4 4"}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isDimmed ? 0.15 : isActive ? 1 : 0.7,
          filter: isActive ? `drop-shadow(0 0 4px ${color})` : "none",
        }}
        transition={{ duration: 1 }}
        className="transition-all pointer-events-none"
      />

      {/* Round Trip Indicator */}
      {isRoundTrip && (
        <foreignObject
          x={midX - 10}
          y={midY - 10}
          width={20}
          height={20}
          className="pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: isDimmed ? 0.2 : 1 }}
            className="w-5 h-5 bg-surface border border-border rounded-full flex items-center justify-center shadow-sm"
          >
            <div className="flex flex-col gap-0.5 rotate-90">
              <div className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
              <div
                className="w-2.5 h-0.5 rounded-full opacity-50"
                style={{ backgroundColor: color }}
              />
            </div>
          </motion.div>
        </foreignObject>
      )}

      {/* Direction Arrow (only for non-round trips or subtle indicator) */}
      {!isRoundTrip && (
        <Marker coordinates={to}>
          <motion.path
            d="M -2 -2 L 2 0 L -2 2 Z"
            fill={color}
            initial={{ opacity: 0 }}
            animate={{ opacity: isDimmed ? 0.15 : 1 }}
            style={{
              transform: `rotate(${Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * (180 / Math.PI)}deg)`,
            }}
          />
        </Marker>
      )}
    </g>
  );
}

interface ItineraryMapProps {
  flights: Flight[];
  trips: Trip[];
}

export function ItineraryMap({ flights, trips }: ItineraryMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");
  const [coordsLoaded, setCoordsLoaded] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | "all">("all");
  const [activeConnectionIndex, setActiveConnectionIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([10, 0]);
  const [isDark, setIsDark] = useState(false);
  const [tripDropdownOpen, setTripDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAirportCoordinates().then(() => setCoordsLoaded(true));
  }, []);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTripDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredFlights = useMemo(() => {
    if (selectedTripId === "all") return flights;
    return flights.filter((f) => f.tripId === selectedTripId);
  }, [flights, selectedTripId]);

  const mapData = useMemo(() => {
    if (!coordsLoaded) {
      const fallback = {
        coordinates: [24.6727, -28.4793] as [number, number],
        name: "Origin",
        countryCode: "ZAF",
      };
      return {
        displayPoints: [] as GeoPoint[],
        visitedCountryCodes: new Set([fallback.countryCode]),
        connections: [] as ConnectionData[],
        finalConnections: [] as ConnectionData[],
        totalDistanceKm: 0,
      };
    }

    const connections: ConnectionData[] = [];
    const points: Record<string, GeoPoint> = {};
    let totalDistanceKm = 0;

    filteredFlights.forEach((flight, flightIdx) => {
      flight.segments.forEach((seg) => {
        const from = getPointForDestination(seg.departureAirport);
        const to = getPointForDestination(seg.arrivalAirport);
        if (from && to) {
          const distKm = haversineKm(from.coordinates, to.coordinates);
          totalDistanceKm += distKm;
          connections.push({
            from: from.coordinates,
            to: to.coordinates,
            fromName: seg.departureAirport,
            toName: seg.arrivalAirport,
            flightIndex: flightIdx,
            flightDesc: flight.description,
            distanceKm: distKm,
          });
          points[seg.departureAirport] = from;
          points[seg.arrivalAirport] = to;
        }
      });
    });

    const displayPoints = Object.values(points);

    // Detect round trips
    const rawConnections = connections;
    const finalConnections: ConnectionData[] = [];
    const processedIndices = new Set<number>();

    rawConnections.forEach((conn, i) => {
      if (processedIndices.has(i)) return;

      // Find if there's a reverse connection
      const reverseIdx = rawConnections.findIndex(
        (other, j) =>
          !processedIndices.has(j) &&
          i !== j &&
          other.fromName === conn.toName &&
          other.toName === conn.fromName,
      );

      if (reverseIdx !== -1) {
        finalConnections.push({
          ...conn,
          isRoundTrip: true,
        });
        processedIndices.add(i);
        processedIndices.add(reverseIdx);
      } else {
        finalConnections.push(conn);
        processedIndices.add(i);
      }
    });

    const visitedCountryCodes = new Set<string>();
    displayPoints.forEach((p) => {
      if (p.countryCode) visitedCountryCodes.add(p.countryCode);
    });

    return {
      displayPoints,
      visitedCountryCodes,
      connections,
      finalConnections,
      totalDistanceKm: Math.round(totalDistanceKm),
    };
  }, [filteredFlights, coordsLoaded]);

  const { displayPoints, visitedCountryCodes, connections, finalConnections, totalDistanceKm } =
    mapData;

  const activeConnection =
    activeConnectionIndex !== null ? finalConnections[activeConnectionIndex] : null;

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  const geoFill = isDark
    ? (isVisited: boolean) => (isVisited ? "#3b1f6e" : "#1e293b")
    : (isVisited: boolean) => (isVisited ? "#fda4af" : "#f1f5f9");

  const geoStroke = isDark
    ? (isVisited: boolean) => (isVisited ? "#4c1d95" : "#334155")
    : (isVisited: boolean) => (isVisited ? "#ffffff" : "#D1D5DB");

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface flex-wrap">
        {/* Trip filter */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setTripDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-sm font-semibold text-text-primary hover:bg-surface-2 transition-colors min-w-[160px]"
          >
            <Globe size={14} className="text-lavender-500 shrink-0" />
            <span className="truncate flex-1 text-left">
              {selectedTripId === "all" ? "All Trips" : (selectedTrip?.name ?? "All Trips")}
            </span>
            <ChevronDown size={14} className="opacity-50 shrink-0" />
          </button>
          <AnimatePresence>
            {tripDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-xl overflow-hidden min-w-[200px]"
              >
                {[{ id: "all" as const, name: "All Trips" }, ...trips].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTripId(t.id as number | "all");
                      setActiveConnectionIndex(null);
                      setTripDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-lavender-50 dark:hover:bg-lavender-900/20 ${
                      selectedTripId === t.id
                        ? "bg-lavender-50 dark:bg-lavender-900/20 font-bold text-lavender-600"
                        : "text-text-primary"
                    }`}
                  >
                    <Plane size={12} className="text-lavender-400 shrink-0" />
                    {t.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 ml-auto text-xs font-bold text-text-secondary uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Globe size={12} className="text-lavender-400" />
            <span>{visitedCountryCodes.size} countries</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Route size={12} className="text-sky-pastel-500" />
            <span>{connections.length} routes</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <Plane size={12} className="text-emerald-500" />
            <span>{(totalDistanceKm / 1000).toFixed(1)}k km flown</span>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setZoom((z) => Math.min(z * 1.5, 8))}
            className="p-1.5 hover:bg-surface-2 transition-colors text-text-secondary hover:text-lavender-600"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <div className="w-px h-5 bg-border" />
          <button
            onClick={() => setZoom((z) => Math.max(z / 1.5, 0.8))}
            className="p-1.5 hover:bg-surface-2 transition-colors text-text-secondary hover:text-lavender-600"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <div className="w-px h-5 bg-border" />
          <button
            onClick={() => {
              setZoom(1);
              setCenter([10, 0]);
              setActiveConnectionIndex(null);
            }}
            className="p-1.5 hover:bg-surface-2 transition-colors text-text-secondary hover:text-lavender-600"
            title="Reset View"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden bg-sky-pastel-50/20 dark:bg-slate-900/50">
        <ComposableMap
          projectionConfig={{ rotate: [-10, 0, 0], scale: 160 }}
          className="w-full h-full"
        >
          <ZoomableGroup
            center={center}
            zoom={zoom}
            onMoveEnd={({ coordinates, zoom: z }) => {
              setCenter(coordinates as [number, number]);
              setZoom(z);
            }}
          >
            <Sphere
              stroke={isDark ? "#334155" : "#E4E7EB"}
              strokeWidth={0.5}
              id="sphere"
              fill={isDark ? "#0f172a" : "#f0f4ff"}
            />
            <Graticule stroke={isDark ? "#1e293b" : "#E4E7EB"} strokeWidth={0.5} />
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isVisited =
                    visitedCountryCodes.has(geo.id) ||
                    visitedCountryCodes.has(geo.properties.name) ||
                    visitedCountryCodes.has(geo.properties.iso_a3);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={geoFill(isVisited)}
                      stroke={geoStroke(isVisited)}
                      strokeWidth={1}
                      className="outline-none transition-colors hover:fill-lavender-200 dark:hover:fill-lavender-800 cursor-pointer"
                      onMouseEnter={() => setTooltipContent(geo.properties.name)}
                      onMouseLeave={() => setTooltipContent("")}
                    />
                  );
                })
              }
            </Geographies>

            {/* Connections */}
            {finalConnections.map((link, i) => (
              <AnimatedConnection
                key={`connection-${i}`}
                from={link.from}
                to={link.to}
                index={link.flightIndex}
                isActive={activeConnectionIndex === i}
                isDimmed={activeConnectionIndex !== null && activeConnectionIndex !== i}
                isRoundTrip={link.isRoundTrip}
                onClick={() => setActiveConnectionIndex((prev) => (prev === i ? null : i))}
              />
            ))}

            {/* Airport Markers */}
            {displayPoints.map((point, i) => {
              const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
              return (
                <Marker key={i} coordinates={point.coordinates}>
                  <circle r={3.5} fill={color} stroke="#fff" strokeWidth={1.5} />
                  <text
                    textAnchor="middle"
                    y={10}
                    style={{
                      fontFamily: "system-ui",
                      fill: color,
                      fontSize: "7px",
                      fontWeight: "700",
                      stroke: isDark ? "#0f172a" : "#fff",
                      strokeWidth: "1.5px",
                      paintOrder: "stroke",
                    }}
                  >
                    {point.name}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Country tooltip */}
        <AnimatePresence>
          {tooltipContent && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.1 }}
              className="absolute top-3 left-3 px-3 py-1.5 bg-surface/90 backdrop-blur-md border border-border rounded-lg shadow-lg pointer-events-none"
            >
              <p className="text-xs font-bold text-text-primary">{tooltipContent}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active route info card */}
        <AnimatePresence>
          {activeConnection && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="absolute bottom-4 right-4 bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-xl p-4 w-64 pointer-events-auto"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        ROUTE_COLORS[activeConnection.flightIndex % ROUTE_COLORS.length],
                    }}
                  />
                  <p className="text-xs font-black uppercase tracking-wider text-text-muted">
                    Route Details
                  </p>
                </div>
                <button
                  onClick={() => setActiveConnectionIndex(null)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              {activeConnection.flightDesc && (
                <p className="text-xs text-lavender-600 dark:text-lavender-400 font-bold mb-2 truncate">
                  {activeConnection.flightDesc}
                </p>
              )}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <MapPin size={12} className="text-emerald-500" />
                  <div className="w-px h-5 border-l-2 border-dashed border-border" />
                  <MapPin size={12} className="text-rose-pastel-500" />
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div>
                    <p className="text-xs font-black text-text-primary truncate">
                      {activeConnection.fromName}
                    </p>
                    <p className="text-[10px] text-text-muted">Departure</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-text-primary truncate">
                      {activeConnection.toName}
                    </p>
                    <p className="text-[10px] text-text-muted">Arrival</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                  Distance
                </span>
                <span className="text-xs font-black text-lavender-600">
                  ~{activeConnection.distanceKm.toLocaleString()} km
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll hint */}
        {!activeConnection && (
          <div className="absolute bottom-4 left-4 bg-surface/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-lg text-[10px] font-bold text-text-secondary uppercase tracking-wider pointer-events-none">
            Scroll to Zoom • Drag to Pan • Click Route for Details
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 items-center px-5 py-3 border-t border-border bg-surface text-xs font-bold uppercase tracking-widest flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-lavender-500" />
          <span className="text-text-secondary">Home</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-pastel-300" />
          <span className="text-text-secondary">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 border-t-2 border-dashed border-sky-pastel-500" />
          <span className="text-text-secondary">Routes</span>
        </div>
        <div className="ml-auto text-text-muted hidden sm:block">
          {visitedCountryCodes.size} {visitedCountryCodes.size === 1 ? "country" : "countries"} •{" "}
          {connections.length} {connections.length === 1 ? "route" : "routes"} • ~
          {totalDistanceKm.toLocaleString()} km total
        </div>
      </div>
    </div>
  );
}
