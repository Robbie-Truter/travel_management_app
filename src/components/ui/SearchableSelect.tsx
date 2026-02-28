import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  id?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    return options.filter((option) => option.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  return (
    <div className="flex flex-col gap-1.5 w-full">
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
            <span className={cn("truncate", !value && "text-text-muted")}>
              {value || placeholder}
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
          <div className="space-y-2 max-h-60 overflow-y-auto pt-1">
            {filteredOptions.length === 0 ? (
              <div className="text-center text-sm text-text-muted">No options found.</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  className={cn(
                    "relative cursor-pointer flex w-full select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-lavender-50 hover:text-lavender-700 transition-colors",
                    value === option && "bg-lavender-50 text-lavender-700 font-medium",
                  )}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {value === option && <Check className="h-4 w-4" />}
                  </span>
                  {option}
                </button>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Root>
      {error && <p className="text-xs text-rose-pastel-500">{error}</p>}
    </div>
  );
}
