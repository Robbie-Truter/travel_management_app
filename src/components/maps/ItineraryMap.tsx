import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  Sphere,
  Graticule,
} from "react-simple-maps";
import { getPointForDestination, type GeoPoint } from "@/lib/geoData";
import type { Trip } from "@/db/types";
import { useMemo, useState } from "react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface ItineraryMapProps {
  trips: Trip[];
}

export function ItineraryMap({ trips }: ItineraryMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");

  const mapData = useMemo(() => {
    // Determine "Home" point (default to ZAF for Robbie)
    const homePoint = getPointForDestination("South Africa")!;

    // Extract destinations from trips and get coordinates
    const tripPoints: GeoPoint[] = trips
      .map((trip) => getPointForDestination(trip.destination))
      .filter((p): p is GeoPoint => !!p);

    // Create unique list of visited country codes
    const visitedCountryCodes = new Set([
      homePoint.countryCode,
      ...tripPoints.map((p) => p.countryCode),
    ]);

    // Create lines from home to visits
    const connections = tripPoints.map((point) => ({
      from: homePoint.coordinates,
      to: point.coordinates,
    }));

    return { homePoint, tripPoints, visitedCountryCodes, connections };
  }, [trips]);

  const { homePoint, tripPoints, visitedCountryCodes, connections } = mapData;

  return (
    <div className="w-full h-full bg-sky-pastel-50/20 dark:bg-slate-900/50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl aspect-video relative">
        <ComposableMap
          projectionConfig={{
            rotate: [-10, 0, 0],
            scale: 147,
          }}
          className="w-full h-full"
        >
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
                  geo.id === homePoint.countryCode ||
                  geo.properties.iso_a3 === homePoint.countryCode;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isHome ? "#8b5cf6" : isVisited ? "#fda4af" : "#f1f5f9"}
                    stroke={isVisited ? "#ffffff" : "#D1D5DB"}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: isVisited ? "#fb7185" : "#e2e8f0" },
                      pressed: { outline: "none" },
                    }}
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
            <Line
              key={i}
              from={link.from}
              to={link.to}
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="4 4"
            />
          ))}

          {/* Home Marker */}
          <Marker coordinates={homePoint.coordinates}>
            <circle r={4} fill="#8b5cf6" stroke="#fff" strokeWidth={2} />
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

          {/* Trip Markers */}
          {tripPoints.map((point, i) => (
            <Marker key={i} coordinates={point.coordinates}>
              <circle r={3} fill="#f43f5e" stroke="#fff" strokeWidth={1.5} />
              <text
                textAnchor="middle"
                y={10}
                style={{
                  fontFamily: "system-ui",
                  fill: "#be123c",
                  fontSize: "7px",
                  fontWeight: "600",
                }}
              >
                {point.name}
              </text>
            </Marker>
          ))}
        </ComposableMap>

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
          <div className="w-6 h-0.5 border-t-2 border-dashed border-lavender-500" />
          <span className="text-text-secondary font-black">Routes</span>
        </div>
      </div>
    </div>
  );
}
