import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  Sphere,
  Graticule,
  ZoomableGroup,
  useMapContext,
} from "react-simple-maps";
import { getPointForDestination, type GeoPoint, loadAirportCoordinates } from "@/lib/geoData";
import type { Flight } from "@/db/types";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ROUTE_COLORS = [
  "#0ea5e9", // sky-500
  "#f43f5e", // rose-500
  "#8b5cf6", // violet-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#6366f1", // indigo-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
];

interface ItineraryMapProps {
  flights: Flight[];
  homeCountry: string | null;
}

function AnimatedConnection({
  from,
  to,
  index,
}: {
  from: [number, number];
  to: [number, number];
  index: number;
}) {
  const { projection } = useMapContext();

  if (!projection) return null;

  const p1 = projection(from);
  const p2 = projection(to);

  if (!p1 || !p2) return null;

  const [x1, y1] = p1;
  const [x2, y2] = p2;

  // Calculate angle for the plane icon
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  // Calculate duration based on distance
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const duration = Math.max(3, distance / 20);

  const color = ROUTE_COLORS[index % ROUTE_COLORS.length];

  return (
    <g>
      <Line
        from={from}
        to={to}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeDasharray="4 4"
        className="transition-colors cursor-pointer"
      />
      <motion.g
        animate={{
          transform: [
            `translate(${x1}px, ${y1}px)`,
            `translate(${(x1 + x2) / 2}px, ${(y1 + y2) / 2 - 20}px)`,
            `translate(${x2}px, ${y2}px)`,
          ],
        }}
        transition={{
          duration,
          ease: "linear",
          delay: index * 2,
        }}
      >
        <text
          fontSize={10}
          textAnchor="middle"
          alignmentBaseline="middle"
          transform={`rotate(${angle + 45})`}
          className="select-none pointer-events-none drop-shadow-sm"
        >
          ✈️
        </text>
      </motion.g>
    </g>
  );
}

export function ItineraryMap({ flights, homeCountry }: ItineraryMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");
  const [coordsLoaded, setCoordsLoaded] = useState(false);

  useEffect(() => {
    loadAirportCoordinates().then(() => setCoordsLoaded(true));
  }, []);

  const mapData = useMemo(() => {
    // Determine "Home" point (default to ZAF if not set)
    const homePoint = getPointForDestination(homeCountry || "South Africa");

    if (!coordsLoaded) {
      const fallback = homePoint || {
        coordinates: [24.6727, -28.4793] as [number, number],
        name: "Origin",
        countryCode: "ZAF",
      };
      return {
        homePoint: fallback,
        displayPoints: [],
        visitedCountryCodes: new Set([fallback.countryCode]),
        connections: [],
      };
    }

    // 1. Flight Connections and Airport Points
    const flightConnections: { from: [number, number]; to: [number, number] }[] = [];
    const points: Record<string, GeoPoint> = {};

    // 2. Resolve Flight segments (Airports)
    flights.forEach((flight) => {
      flight.segments.forEach((seg) => {
        const from = getPointForDestination(seg.departureAirport);
        const to = getPointForDestination(seg.arrivalAirport);
        if (from && to) {
          flightConnections.push({ from: from.coordinates, to: to.coordinates });
          points[seg.departureAirport] = from;
          points[seg.arrivalAirport] = to;
        }
      });
    });

    const displayPoints = Object.values(points);

    // Create unique list of visited country codes
    const visitedCountryCodes = new Set<string>();
    if (homePoint) visitedCountryCodes.add(homePoint.countryCode);
    displayPoints.forEach((p) => {
      if (p.countryCode) visitedCountryCodes.add(p.countryCode);
    });

    return {
      homePoint,
      displayPoints,
      visitedCountryCodes,
      connections: flightConnections,
    };
  }, [flights, coordsLoaded, homeCountry]);

  const { homePoint, displayPoints, visitedCountryCodes, connections } = mapData;

  return (
    <div className="w-full h-full bg-sky-pastel-50/20 dark:bg-slate-900/50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-7xl h-[700px] relative bg-surface dark:bg-slate-900 rounded-3xl overflow-hidden border border-border shadow-2xl group">
        <ComposableMap
          projectionConfig={{
            rotate: [-10, 0, 0],
            scale: 160,
          }}
          className="w-full h-full"
        >
          <ZoomableGroup center={[10, 0]} zoom={1}>
            <Sphere stroke="#E4E7EB" strokeWidth={0.5} id="sphere" fill="transparent" />
            <Graticule stroke="#E4E7EB" strokeWidth={0.5} />
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isVisited =
                    visitedCountryCodes.has(geo.id) ||
                    visitedCountryCodes.has(geo.properties.name) ||
                    visitedCountryCodes.has(geo.properties.iso_a3);

                  const isHome =
                    geo.id === homePoint?.countryCode ||
                    geo.properties.iso_a3 === homePoint?.countryCode;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isHome ? "#8b5cf6" : isVisited ? "#fda4af" : "#f1f5f9"}
                      stroke={isVisited ? "#ffffff" : "#D1D5DB"}
                      strokeWidth={1}
                      className="outline-none transition-colors hover:fill-lavender-200 cursor-pointer"
                      onMouseEnter={() => {
                        setTooltipContent(geo.properties.name);
                      }}
                      onMouseLeave={() => {
                        setTooltipContent("");
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Connections */}
            {connections.map((link, i) => (
              <AnimatedConnection key={`connection-${i}`} from={link.from} to={link.to} index={i} />
            ))}

            {/* Home Marker */}
            {homePoint && (
              <Marker coordinates={homePoint.coordinates}>
                <circle
                  r={4}
                  fill="#8b5cf6"
                  stroke="#fff"
                  strokeWidth={2}
                  className="animate-pulse"
                />
                <text
                  textAnchor="middle"
                  y={-10}
                  style={{
                    fontFamily: "system-ui",
                    fill: "#5d21b6",
                    fontSize: "8px",
                    fontWeight: "bold",
                  }}
                >
                  HOME
                </text>
              </Marker>
            )}

            {/* Trip Markers */}
            {displayPoints.map((point, i) => {
              const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
              return (
                <Marker key={i} coordinates={point.coordinates}>
                  <circle r={3} fill={color} stroke="#fff" strokeWidth={1.5} />
                  <text
                    textAnchor="middle"
                    y={10}
                    style={{
                      fontFamily: "system-ui",
                      fill: color,
                      fontSize: "7px",
                      fontWeight: "700",
                      stroke: "#fff",
                      strokeWidth: "1px",
                      paintOrder: "stroke",
                    }}
                  >
                    {point.countryCode}-{point.name}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom Instructions */}
        <div className="absolute bottom-4 right-4 bg-surface/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-lg text-[10px] font-bold text-text-secondary uppercase tracking-wider pointer-events-none">
          Scroll to Zoom • Click & Drag to Pan
        </div>

        {tooltipContent && (
          <div className="absolute top-2 left-2 px-3 py-1.5 bg-surface/90 backdrop-blur-md border border-border rounded-lg shadow-lg pointer-events-none">
            <p className="text-xs font-bold text-text-primary">{tooltipContent}</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-6 items-center px-6 py-3 bg-surface border border-border rounded-full shadow-sm text-xs font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-lavender-500" />
          <span className="text-text-secondary font-black">Origins</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-pastel-300" />
          <span className="text-text-secondary font-black">Visits</span>
        </div>
        <div className="h-4 w-px bg-border mx-2" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 border-t-2 border-dashed border-sky-pastel-500" />
          <span className="text-text-secondary font-black">Routes</span>
        </div>
      </div>
    </div>
  );
}
