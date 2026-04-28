export interface GeoPoint {
  coordinates: [number, number]; // [longitude, latitude]
  name: string;
  countryCode: string; // ISO 3166-1 alpha-3
  timezone?: string;
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

let AIRPORT_DATA: Record<string, { lat: number; lng: number; tz?: string; country: string }> = {};
const NAME_TO_IATA: Record<string, { iata: string; country: string }> = {};
const COUNTRY_COORDS: Record<string, [number, number]> = { ...COUNTRY_FALLBACKS };

export async function loadAirportCoordinates() {
  if (Object.keys(AIRPORT_DATA).length > 0) return;
  try {
    const [airportRes, countryRes] = await Promise.all([
      fetch("/data/airports.json"),
      fetch("/data/countries-coordinates.json"),
    ]);

    const airportData = (await airportRes.json()) as {
      iata: string;
      name: string;
      city: string;
      country: string;
      lat?: number;
      lng?: number;
      tz?: string;
    }[];
    const countryData = (await countryRes.json()) as {
      alpha2: string;
      alpha3: string;
      latitude: number;
      longitude: number;
      name: string;
    }[];

    // Build smart lookups
    airportData.forEach((ap) => {
      const lowerCity = ap.city.toLowerCase();
      const lowerName = ap.name.toLowerCase();
      const lowerIata = ap.iata.toLowerCase();
      const countryCode = ap.country;

      if (ap.lat !== undefined && ap.lng !== undefined) {
        AIRPORT_DATA[ap.iata] = {
          lat: ap.lat,
          lng: ap.lng,
          tz: ap.tz,
          country: ap.country,
        };
      }

      // 1. Name to IATA mapping
      if (!NAME_TO_IATA[lowerCity])
        NAME_TO_IATA[lowerCity] = { iata: ap.iata, country: countryCode };
      if (!NAME_TO_IATA[lowerName])
        NAME_TO_IATA[lowerName] = { iata: ap.iata, country: countryCode };
      if (!NAME_TO_IATA[lowerIata])
        NAME_TO_IATA[lowerIata] = { iata: ap.iata, country: countryCode };

      // 2. Initial Country Coordinate fallback (using airport)
      if (!COUNTRY_COORDS[countryCode] && ap.lat !== undefined && ap.lng !== undefined) {
        COUNTRY_COORDS[countryCode] = [ap.lng, ap.lat]; // Standardize to [lon, lat]
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
  if (normalized.length === 3 && AIRPORT_DATA[normalized.toUpperCase()]) {
    const iata = normalized.toUpperCase();
    const info = AIRPORT_DATA[iata];
    return {
      coordinates: [info.lng, info.lat],
      name: iata,
      countryCode: info.country,
      timezone: info.tz,
    };
  }

  // 2. City or Airport Name match
  if (NAME_TO_IATA[lower]) {
    const info = NAME_TO_IATA[lower];
    const data = AIRPORT_DATA[info.iata];
    if (data) {
      return {
        coordinates: [data.lng, data.lat],
        name: normalized,
        countryCode: info.country,
        timezone: data.tz,
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
