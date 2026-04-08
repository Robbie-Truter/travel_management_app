import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  options: (string | SearchableOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  id?: string;
  className?: string;
  displayLimit?: number;
  includeSearch?: boolean;
  disabled?: boolean;
  /** When provided, search input changes are forwarded to the parent instead of filtering internally. Use for async/server-driven searches. */
  onSearchChange?: (query: string) => void;
  /** Shows a loading spinner in the dropdown list when true */
  isSearchLoading?: boolean;
  /** Text shown as a hint inside the trigger button when no country/context is selected yet */
  searchHint?: string;
  /** An option to ensure is always in the list (e.g. the currently saved value) */
  selectedOption?: SearchableOption;
  /** Whether to show an "Add manually" option when the search query doesn't match */
  allowManual?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  id,
  className,
  displayLimit = 100,
  includeSearch = true,
  disabled = false,
  onSearchChange,
  isSearchLoading = false,
  searchHint,
  selectedOption: activeOption,
  allowManual = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const sourceOptions = React.useMemo(() => {
    const list = options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt } as SearchableOption;
      }
      return opt;
    });

    // If we have an active selection that isn't in the provided options, add it
    if (activeOption && !list.find((opt) => opt.value === activeOption.value)) {
      list.unshift(activeOption);
    }

    return list;
  }, [options, activeOption]);

  // When onSearchChange is provided, options are already server-filtered — skip internal filtering
  const filteredOptions = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    let list = sourceOptions;
    if (!onSearchChange && query) {
      list = sourceOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(query) ||
          opt.value.toLowerCase().includes(query) ||
          opt.sublabel?.toLowerCase().includes(query),
      );
    }

    // Add manual option if allowed and no exact match exists
    if (allowManual && query.length >= 2) {
      const hasExactMatch = list.some((opt) => opt.label.toLowerCase() === query);
      const isSelectedManual = value.startsWith("__manual__") && value.toLowerCase().replace("__manual__", "") === query;

      if (!hasExactMatch && !isSelectedManual) {
        list = [
          ...list,
          {
            value: `__manual__${searchQuery.trim()}`,
            label: `Add manually: "${searchQuery.trim()}"`,
          },
        ];
      }
    }

    return list;
  }, [sourceOptions, searchQuery, onSearchChange, allowManual, value]);

  const displayedOptions = React.useMemo(() => {
    return filteredOptions.slice(0, displayLimit);
  }, [filteredOptions, displayLimit]);

  const displayOption = sourceOptions.find((opt) => opt.value === value) || activeOption;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <Popover.Root open={disabled ? false : open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-lavender-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-rose-pastel-400 focus:ring-rose-pastel-400",
            )}
          >
            <span className={cn("truncate flex items-center gap-2", !value && "text-text-muted")}>
              {displayOption?.icon && <span>{displayOption.icon}</span>}
              {displayOption ? displayOption.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </Popover.Trigger>
        <Popover.Content
          className="z-50 w-(--radix-popover-trigger-width) min-w-[200px] overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg animate-in fade-in zoom-in duration-200"
          align="start"
        >
          {includeSearch && (
            <div className="flex items-center border-b border-border px-3 pb-2 pt-1">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-8 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-lavender-400 focus:border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearchChange?.(e.target.value);
                }}
                autoFocus
              />
            </div>
          )}
          <div className="space-y-1 max-h-60 overflow-y-auto pt-1">
            {isSearchLoading ? (
              <div className="text-center py-4 text-sm text-text-muted">Searching...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-sm text-text-muted">{searchHint ?? "No options found."}</div>
            ) : (
              <>
                {displayedOptions.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "relative cursor-pointer flex w-full select-none flex-col rounded-lg py-2 pl-8 pr-2 text-sm outline-none hover:bg-lavender-50 hover:text-lavender-700 transition-colors text-left",
                      value === option.value && "bg-lavender-50 text-lavender-700 font-medium",
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <span className="absolute left-2 top-3 flex h-3.5 w-3.5 items-center justify-center">
                      {value === option.value && <Check className="h-4 w-4" />}
                    </span>
                    <div className="flex items-center gap-2">
                      {option.icon && <span>{option.icon}</span>}
                      <span className="truncate font-semibold">{option.label}</span>
                    </div>
                    {option.sublabel && (
                      <span className="text-xs opacity-70 ml-0">{option.sublabel}</span>
                    )}
                  </button>
                ))}
                {filteredOptions.length > displayLimit && (
                  <div className="py-2 px-3 text-center border-t border-border mt-1">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                      Keep typing to narrow down {filteredOptions.length - displayLimit} more
                      results
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </Popover.Content>
      </Popover.Root>
      {error && <p className="text-xs text-rose-pastel-500">{error}</p>}
    </div>
  );
}
