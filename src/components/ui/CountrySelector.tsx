import * as React from "react";
import { SearchableSelect } from "./SearchableSelect";
import { COUNTRIES } from "@/lib/countries";

interface CountrySelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  isCollapsed?: boolean;
}

import { getFlagEmoji } from "@/lib/utils";

export function CountrySelector({ value, onChange, isCollapsed }: CountrySelectorProps) {
  const options = React.useMemo(() => {
    return COUNTRIES.map((c) => ({
      value: c.name,
      label: c.name,
      icon: <span className="text-base">{getFlagEmoji(c.code)}</span>,
    }));
  }, []);

  const selectedCountry = COUNTRIES.find((c) => c.name === value);
  const flag = selectedCountry ? getFlagEmoji(selectedCountry.code) : "🌍";

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
        onChange={onChange}
        placeholder="Select country..."
        className="w-full"
      />
    </div>
  );
}
