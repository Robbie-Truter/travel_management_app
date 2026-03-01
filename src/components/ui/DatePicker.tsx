import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/Calendar";
import { motion } from "framer-motion";
import type { Matcher } from "react-day-picker";

interface DatePickerProps {
  className?: string;
  label?: string;
  value?: Date | string;
  onChange: (date?: Date) => void;
  error?: string;
  placeholder?: string;
  id?: string;
  showTime?: boolean;
  disabled?: Matcher | Matcher[];
}

export function DatePicker({
  className,
  label,
  value,
  onChange,
  error,
  placeholder = "Pick a date",
  id,
  showTime = false,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  const displayValue = dateValue ? format(dateValue, showTime ? "PPP HH:mm" : "PPP") : placeholder;

  const handleTimeChange = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const newDate = dateValue ? new Date(dateValue) : new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    onChange(newDate);
  };

  return (
    <div className={cn("grid gap-1.5 w-full", className)}>
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
            className={cn(
              "flex h-9 w-full items-center justify-start rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm font-normal text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-lavender-400 focus:border-transparent",
              !dateValue && "text-text-muted",
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
              mode="single"
              selected={dateValue}
              onSelect={(date) => {
                if (date) {
                  const newDate = new Date(date);
                  if (dateValue) {
                    newDate.setHours(dateValue.getHours());
                    newDate.setMinutes(dateValue.getMinutes());
                  }
                  onChange(newDate);
                  if (!showTime) setOpen(false);
                }
              }}
              disabled={disabled}
              initialFocus
            />
            {showTime && (
              <div className="p-3 border-t border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock size={14} />
                  <span className="text-xs font-medium">Time</span>
                </div>
                <input
                  type="time"
                  className="bg-surface-2 border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-lavender-400"
                  value={dateValue ? format(dateValue, "HH:mm") : "00:00"}
                  onChange={(e) => handleTimeChange(e.target.value)}
                />
              </div>
            )}
          </motion.div>
        </Popover.Content>
      </Popover.Root>
      {error && <p className="text-xs text-rose-pastel-500">{error}</p>}
    </div>
  );
}
