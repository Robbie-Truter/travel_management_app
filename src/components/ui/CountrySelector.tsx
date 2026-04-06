import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SearchableSelect } from "./SearchableSelect";
import { useCountrySearch } from "@/hooks/useCountrySearch";
import { useDebounce } from "@/hooks/useDebounce";
import { getFlagEmoji } from "@/lib/utils";

interface CountrySelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  isCollapsed?: boolean;
}

export function CountrySelector({ value, onChange, isCollapsed }: CountrySelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { countries, isLoading } = useCountrySearch(debouncedSearch);

  const { data: homeCountryObj } = useQuery({
    queryKey: ["country_lookup", "name", value],
    queryFn: async () => {
      if (!value) return null;
      const { data } = await supabase
        .from("country_lookup")
        .select("name, iso2")
        .ilike("name", value)
        .maybeSingle();
      return data;
    },
    enabled: !!value,
    staleTime: 1000 * 60 * 60,
  });

  const options = React.useMemo(() => {
    const list = countries.map((c) => ({
      value: c.name,
      label: c.name,
      icon: <span className="text-base">{getFlagEmoji(c.iso2)}</span>,
    }));

    if (value && !list.some((opt) => opt.value === value)) {
      list.unshift({
        value: value,
        label: homeCountryObj?.name || value,
        icon: (
          <span className="text-base">
            {homeCountryObj ? getFlagEmoji(homeCountryObj.iso2) : "🌍"}
          </span>
        ),
      });
    }

    return list;
  }, [countries, homeCountryObj, value]);

  const flag = homeCountryObj ? getFlagEmoji(homeCountryObj.iso2) : "🌍";

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center justify-center py-2">
        <div
          className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center cursor-pointer hover:bg-surface-4 transition-colors"
          title={`Home: ${value || "Not set"}`}
        >
          <span className="text-xl">{flag}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-1.5">
      <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted px-1">
        Country of Origin
      </label>
      <SearchableSelect
        options={options}
        value={value || ""}
        onChange={(val) => {
          onChange(val);
          setSearchQuery("");
        }}
        onSearchChange={setSearchQuery}
        isSearchLoading={isLoading}
        searchHint="Type at least 3 characters to search countries..."
        placeholder="Select country..."
        className="w-full"
      />
    </div>
  );
}
