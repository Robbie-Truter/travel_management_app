import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
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
          "day-range-start bg-lavender-500 text-white hover:bg-lavender-500 hover:text-white rounded-l-md",
        range_end:
          "day-range-end bg-lavender-500 text-white hover:bg-lavender-500 hover:text-white rounded-r-md",
        selected:
          "bg-lavender-500 text-white hover:bg-lavender-600 hover:text-white focus:bg-lavender-500 focus:text-white",
        today: "bg-slate-100 dark:bg-slate-800 text-text-primary font-bold",
        outside:
          "text-text-muted opacity-50 aria-selected:bg-lavender-50/50 aria-selected:text-text-muted aria-selected:opacity-30",
        disabled: "text-text-muted opacity-50",
        range_middle: "aria-selected:bg-lavender-50 aria-selected:text-lavender-900",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
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
