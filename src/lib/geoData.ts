export interface GeoPoint {
  coordinates: [number, number]; // [longitude, latitude]
  name: string;
  countryCode: string; // ISO 3166-1 alpha-3
}

// Minimal hardcoded country-level fallbacks (since airports are specific points)
const COUNTRY_FALLBACKS: Record<string, [number, number]> = {
  "South Africa": [24.6727, -28.4793],
  Japan: [138.2529, 36.2048],
  USA: [-95.7129, 37.0902],
  UK: [-3.436, 55.3781],
  France: [2.2137, 46.2276],
  Italy: [12.5674, 41.8719],
  Germany: [10.4515, 51.1657],
  Spain: [-3.7492, 40.4637],
  Australia: [133.7751, -25.2744],
  Thailand: [100.9925, 15.87],
};

let AIRPORT_COORDINATES: Record<string, [number, number]> = {};
const NAME_TO_IATA: Record<string, { iata: string; country: string }> = {};
const COUNTRY_COORDS: Record<string, [number, number]> = { ...COUNTRY_FALLBACKS };

export async function loadAirportCoordinates() {
  if (Object.keys(AIRPORT_COORDINATES).length > 0) return;
  try {
    const [coordRes, searchRes, countryRes] = await Promise.all([
      fetch("/data/airports-coordinates.json"),
      fetch("/data/airports-search.json"),
      fetch("/data/countries-coordinates.json"),
    ]);

    AIRPORT_COORDINATES = await coordRes.json();
    const searchData = (await searchRes.json()) as {
      iata: string;
      name: string;
      city: string;
      country: string;
    }[];
    const countryData = (await countryRes.json()) as {
      alpha2: string;
      alpha3: string;
      latitude: number;
      longitude: number;
      name: string;
    }[];

    // Build smart lookups
    searchData.forEach((ap) => {
      const lowerCity = ap.city.toLowerCase();
      const lowerName = ap.name.toLowerCase();
      const lowerIata = ap.iata.toLowerCase();
      const countryCode = ap.country;

      // 1. Name to IATA mapping
      if (!NAME_TO_IATA[lowerCity])
        NAME_TO_IATA[lowerCity] = { iata: ap.iata, country: countryCode };
      if (!NAME_TO_IATA[lowerName])
        NAME_TO_IATA[lowerName] = { iata: ap.iata, country: countryCode };
      if (!NAME_TO_IATA[lowerIata])
        NAME_TO_IATA[lowerIata] = { iata: ap.iata, country: countryCode };

      // 2. Initial Country Coordinate fallback (using airport)
      if (!COUNTRY_COORDS[countryCode] && AIRPORT_COORDINATES[ap.iata]) {
        const [lat, lon] = AIRPORT_COORDINATES[ap.iata];
        COUNTRY_COORDS[countryCode] = [lon, lat]; // Standardize to [lon, lat] for COUNTRY_COORDS
      }
    });

    // 3. Overwrite with better Country Centroids
    countryData.forEach((c) => {
      COUNTRY_COORDS[c.alpha3] = [c.longitude, c.latitude];
      COUNTRY_COORDS[c.alpha2] = [c.longitude, c.latitude];
      COUNTRY_COORDS[c.name.toLowerCase()] = [c.longitude, c.latitude];
    });
  } catch (err) {
    console.error("Failed to load geo data:", err);
  }
}

export function getPointForDestination(dest: string): GeoPoint | undefined {
  if (!dest) return undefined;

  let normalized = dest.trim();
  
  // Try to extract IATA code from brackets if present (e.g. "London (LHR)")
  const iataMatch = normalized.match(/\(([A-Z]{3})\)/);
  if (iataMatch) {
    normalized = iataMatch[1];
  } else if (normalized.length > 3 && normalized.includes("-")) {
    // Handle "LHR - London" format
    const parts = normalized.split("-");
    const possibleIata = parts[0].trim();
    if (possibleIata.length === 3) normalized = possibleIata;
  }

  const lower = normalized.toLowerCase();

  // 1. Direct IATA code match (fastest)
  if (normalized.length === 3 && AIRPORT_COORDINATES[normalized.toUpperCase()]) {
    const iata = normalized.toUpperCase();
    const [lat, lon] = AIRPORT_COORDINATES[iata];
    const country = NAME_TO_IATA[iata.toLowerCase()]?.country || "";
    return {
      coordinates: [lon, lat],
      name: iata,
      countryCode: country,
    };
  }

  // 2. City or Airport Name match
  if (NAME_TO_IATA[lower]) {
    const info = NAME_TO_IATA[lower];
    const coords = AIRPORT_COORDINATES[info.iata];
    if (coords) {
      return {
        coordinates: [coords[1], coords[0]],
        name: normalized,
        countryCode: info.country,
      };
    }
  }

  // 3. Country-level lookup (from our new centroid data)
  if (COUNTRY_COORDS[normalized.toUpperCase()]) {
    const coords = COUNTRY_COORDS[normalized.toUpperCase()];
    return {
      coordinates: [coords[0], coords[1]],
      name: normalized,
      countryCode: normalized.toUpperCase(),
    };
  }

  if (COUNTRY_COORDS[lower]) {
    const coords = COUNTRY_COORDS[lower];
    return {
      coordinates: [coords[0], coords[1]],
      name: normalized,
      countryCode: "", 
    };
  }

  // Partial match for country names
  for (const [key, coords] of Object.entries(COUNTRY_COORDS)) {
    if (key.length > 3 && (lower.includes(key) || key.includes(lower))) {
      return {
        coordinates: [coords[0], coords[1]],
        name: normalized,
        countryCode: "",
      };
    }
  }

  return undefined;
}
