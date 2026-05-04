import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CountryLookupRow } from "@/db/types";

/**
 * Searches the country_lookup table for countries matching the search term.
 *
 * Query is disabled until a search term of at least 3 characters is provided
 * (to match the > 2 characters instruction). It also caches the results heavily.
 */
export function useCountrySearch(searchTerm: string) {
  const enabled = searchTerm.trim().length > 2;

  const { data: countries, isLoading } = useQuery({
    queryKey: ["country_lookup", searchTerm],
    queryFn: async (): Promise<CountryLookupRow[]> => {
      const { data, error } = await supabase
        .from("country_lookup")
        .select("*")
        .ilike("name", `%${searchTerm.trim()}%`)
        .order("name", { ascending: true })
        .limit(20);

      if (error) throw error;
      return (data ?? []) as CountryLookupRow[];
    },
    enabled,
    staleTime: 1000 * 60 * 60, // Cache results for 1 hour since they don't change
  });

  return {
    countries: countries ?? [],
    isLoading: enabled && isLoading,
  };
}
