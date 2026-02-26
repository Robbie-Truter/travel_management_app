export interface GeoPoint {
  coordinates: [number, number]; // [longitude, latitude]
  name: string;
  countryCode: string; // ISO 3166-1 alpha-3
}

export const GEO_MAPPING: Record<string, GeoPoint> = {
  // Common home locations
  "South Africa": { coordinates: [24.6727, -28.4793], name: "South Africa", countryCode: "ZAF" },
  "Cape Town": { coordinates: [18.4241, -33.9249], name: "Cape Town", countryCode: "ZAF" },
  Johannesburg: { coordinates: [28.0473, -26.2041], name: "Johannesburg", countryCode: "ZAF" },
  ZAR: { coordinates: [24.6727, -28.4793], name: "South Africa", countryCode: "ZAF" },

  // Popular destinations
  Japan: { coordinates: [138.2529, 36.2048], name: "Japan", countryCode: "JPN" },
  Tokyo: { coordinates: [139.6503, 35.6762], name: "Tokyo", countryCode: "JPN" },
  Kyoto: { coordinates: [135.7681, 35.0116], name: "Kyoto", countryCode: "JPN" },
  Osaka: { coordinates: [135.5023, 34.6937], name: "Osaka", countryCode: "JPN" },

  USA: { coordinates: [-95.7129, 37.0902], name: "USA", countryCode: "USA" },
  "New York": { coordinates: [-74.006, 40.7128], name: "New York", countryCode: "USA" },
  "Los Angeles": { coordinates: [-118.2437, 34.0522], name: "Los Angeles", countryCode: "USA" },

  UK: { coordinates: [-3.436, 55.3781], name: "UK", countryCode: "GBR" },
  London: { coordinates: [-0.1278, 51.5074], name: "London", countryCode: "GBR" },

  France: { coordinates: [2.2137, 46.2276], name: "France", countryCode: "FRA" },
  Paris: { coordinates: [2.3522, 48.8566], name: "Paris", countryCode: "FRA" },

  Italy: { coordinates: [12.5674, 41.8719], name: "Italy", countryCode: "ITA" },
  Rome: { coordinates: [12.4964, 41.9028], name: "Rome", countryCode: "ITA" },

  Germany: { coordinates: [10.4515, 51.1657], name: "Germany", countryCode: "DEU" },
  Berlin: { coordinates: [13.405, 52.52], name: "Berlin", countryCode: "DEU" },

  Spain: { coordinates: [-3.7492, 40.4637], name: "Spain", countryCode: "ESP" },
  Madrid: { coordinates: [-3.7038, 40.4168], name: "Madrid", countryCode: "ESP" },

  Australia: { coordinates: [133.7751, -25.2744], name: "Australia", countryCode: "AUS" },
  Sydney: { coordinates: [151.2093, -33.8688], name: "Sydney", countryCode: "AUS" },

  Thailand: { coordinates: [100.9925, 15.87], name: "Thailand", countryCode: "THA" },
  Bangkok: { coordinates: [100.5018, 13.7563], name: "Bangkok", countryCode: "THA" },
};

export function getPointForDestination(dest: string): GeoPoint | undefined {
  if (!dest) return undefined;

  // Try exact match
  if (GEO_MAPPING[dest]) return GEO_MAPPING[dest];

  // Try case-insensitive search
  const lowerDest = dest.toLowerCase();
  for (const key in GEO_MAPPING) {
    if (key.toLowerCase() === lowerDest) return GEO_MAPPING[key];
    if (lowerDest.includes(key.toLowerCase())) return GEO_MAPPING[key];
  }

  return undefined;
}
