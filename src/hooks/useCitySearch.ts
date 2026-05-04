import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CityLookupRow } from "@/db/types";

/**
 * Searches the city_lookup table for cities matching the search term
 * within the given country (by iso2 code).
 *
 * Query is disabled until both a country iso2 code and a search term
 * of at least 2 characters are provided.
 */
export function useCitySearch(searchTerm: string, iso2: string) {
  const enabled = !!iso2 && searchTerm.trim().length >= 2;

  const { data: cities, isLoading } = useQuery({
    queryKey: ["city_lookup", iso2, searchTerm],
    queryFn: async (): Promise<CityLookupRow[]> => {
      const { data, error } = await supabase
        .from("city_lookup")
        .select("id, city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital")
        .eq("iso2", iso2)
        .ilike("city_ascii", `%${searchTerm.trim()}%`)
        .order("city", { ascending: true })
        .limit(20);

      if (error) throw error;
      return (data ?? []) as CityLookupRow[];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });

  return {
    cities: cities ?? [],
    isLoading: enabled && isLoading,
  };
}
