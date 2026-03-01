import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/Calendar";
import { motion } from "framer-motion";

interface DateRangePickerProps {
  className?: string;
  label?: string;
  value?: { from?: Date; to?: Date };
  onChange: (range: { from?: Date; to?: Date }) => void;
  error?: string;
}

export function DateRangePicker({
  className,
  label,
  value,
  onChange,
  error,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const range: DateRange | undefined = value?.from
    ? {
        from: value.from,
        to: value.to,
      }
    : undefined;

  const displayValue = (() => {
    if (!value?.from) return "Pick a date range";
    const start = format(value.from, "LLL dd, y");
    if (!value.to) return start;
    const end = format(value.to, "LLL dd, y");
    return `${start} - ${end}`;
  })();

  return (
    <div className={cn("grid gap-1.5", className)}>
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            id="date"
            type="button"
            className={cn(
              "flex h-9 w-full items-center justify-start rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm font-normal text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-lavender-400 focus:border-transparent",
              !value?.from && "text-text-muted",
              error && "border-rose-pastel-400 focus:ring-rose-pastel-400",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
            <span className="truncate">{displayValue}</span>
          </button>
        </Popover.Trigger>
        <Popover.Content
          className="z-50 w-auto rounded-xl border border-border bg-surface p-0 shadow-lg animate-in fade-in zoom-in duration-200"
          align="start"
        >
          <motion.div>
            <Calendar
              mode="range"
              defaultMonth={value?.from}
              selected={range}
              onSelect={(newRange) => {
                if (newRange) {
                  onChange({ from: newRange.from, to: newRange.to });
                }
              }}
              numberOfMonths={1}
            />
          </motion.div>
        </Popover.Content>
      </Popover.Root>
      {error && <p className="text-xs text-rose-pastel-500">{error}</p>}
    </div>
  );
}
