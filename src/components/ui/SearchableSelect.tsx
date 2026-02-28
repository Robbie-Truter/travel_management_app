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
  loading?: boolean;
  displayLimit?: number;
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
  loading: externalLoading = false,
  displayLimit = 100,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isReady, setIsReady] = React.useState(false);

  // Defer rendering of the heavy list until the popover is actually open
  // This prevents the click event from feeling "stuck"
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setIsReady(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [open]);

  const normalizedOptions = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt } as SearchableOption;
      }
      return opt;
    });
  }, [options]);

  const filteredOptions = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query) ||
        opt.sublabel?.toLowerCase().includes(query),
    );
  }, [normalizedOptions, searchQuery]);

  const displayedOptions = React.useMemo(() => {
    return filteredOptions.slice(0, displayLimit);
  }, [filteredOptions, displayLimit]);

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
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
              {selectedOption?.icon && <span>{selectedOption.icon}</span>}
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </Popover.Trigger>
        <Popover.Content
          className="z-50 w-(--radix-popover-trigger-width) min-w-[200px] overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg animate-in fade-in zoom-in duration-200"
          align="start"
        >
          <div className="flex items-center border-b border-border px-3 pb-2 pt-1">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-lavender-400 focus:border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto pt-1">
            {externalLoading || !isReady ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-5 h-5 border-2 border-lavender-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-text-muted italic">Searching airports...</p>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-sm text-text-muted">No options found.</div>
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
