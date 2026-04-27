import * as React from "react";
import { DayButton, DayPicker, type DayButtonProps } from "react-day-picker";
import { ChevronLeft, ChevronRight, Plane, Bed, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTripAvailability } from "@/hooks/useTripAvailability";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

type CalendarComponentProps = {
  tripId?: number;
} & CalendarProps;

function CustomDay(props: DayButtonProps) {
  const { day, modifiers, ...buttonProps } = props;

  const hasFlight = modifiers.flight;
  const hasAccommodation = modifiers.accommodation;
  const hasActivity = modifiers.activity;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <DayButton {...buttonProps} day={day} modifiers={modifiers} />
      <div className="absolute bottom-0 flex gap-0.5 pointer-events-none items-center justify-center w-full">
        {hasFlight && <Plane size={9} className="text-sky-500" />}
        {hasAccommodation && <Bed size={9} className="text-emerald-500" />}
        {hasActivity && <MapPin size={9} className="text-amber-500" />}
      </div>
    </div>
  );
}
function Calendar({
  tripId,
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarComponentProps) {
  const { isDateInOccupiedRangeWithType } = useTripAvailability(tripId ?? 0);

  const modifiers = React.useMemo(() => {
    return {
      flight: (date: Date) => isDateInOccupiedRangeWithType(date, "flight"),
      accommodation: (date: Date) => isDateInOccupiedRangeWithType(date, "accommodation"),
      activity: (date: Date) => isDateInOccupiedRangeWithType(date, "activity"),
    };
  }, [isDateInOccupiedRangeWithType]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      modifiers={modifiers}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center h-9",
        caption_label: "text-sm font-medium",
        nav: "flex items-center justify-between absolute inset-x-0 w-full px-2 z-10 pointer-events-none",
        button_previous: cn(
          "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity rounded-md flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 pointer-events-auto cursor-pointer",
        ),
        button_next: cn(
          "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity rounded-md flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 pointer-events-auto cursor-pointer",
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex w-full",
        weekday:
          "text-text-muted rounded-md w-9 font-normal text-[0.8rem] flex justify-center items-center",
        weeks: "w-full mt-2",
        week: "flex w-full mt-2",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-lavender-100 dark:hover:bg-lavender-900/30 rounded-md transition-colors flex items-center justify-center",
        ),
        day_button: "h-9 w-9 flex items-center justify-center p-0",
        range_start:
          "day-range-start bg-lavender-600 text-white hover:bg-lavender-600 hover:text-white rounded-l-md",
        range_end:
          "day-range-end bg-lavender-600 text-white hover:bg-lavender-600 hover:text-white rounded-r-md",
        selected:
          "bg-lavender-600 text-white hover:bg-lavender-700 hover:text-white focus:bg-lavender-600 focus:text-white",
        today: "bg-rose-pastel-200 dark:bg-rose-pastel-900/30 text-text-primary font-bold",
        outside:
          "text-text-muted opacity-50 aria-selected:bg-lavender-50/50 aria-selected:text-text-muted aria-selected:opacity-30",
        disabled: "text-text-muted opacity-50",
        range_middle: "aria-selected:bg-lavender-100 aria-selected:text-lavender-900",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        DayButton: CustomDay,
        Chevron: ({ ...props }) => {
          if (props.orientation === "left") return <ChevronLeft className="h-4 w-4" />;
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
