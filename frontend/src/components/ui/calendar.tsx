import * as React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/Buttons";

export type CalendarProps = DayPickerProps & {
  className?: string;
  classNames?: Partial<DayPickerProps["classNames"]>;
};

export const Calendar: React.FC<CalendarProps> = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) => (
  <div
    className={cn(
      "flex justify-center items-center min-h-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-md mx-auto",
      className
    )}
  >
    <DayPicker
      showOutsideDays={showOutsideDays}
      className="w-full"
      classNames={{
        root: "day-picker-modern",
        months: "flex flex-col gap-8 justify-center",
        month: "space-y-4",
        caption: "flex items-center justify-between mb-6",
        caption_label: "text-xl font-bold text-[#39092c]",
        caption_dropdowns: "flex items-center gap-2",
        nav: "flex justify-between items-center gap-2",
        nav_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "rounded-full hover:bg-[#e9e3f5] transition"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full",
        head_row: "grid grid-cols-7",
        head_cell: "text-[#39092c] font-semibold text-sm pb-2 text-center",
        row: "grid grid-cols-7",
        cell: "",
        day:
          "text-center p-2 rounded-xl transition-colors duration-200 cursor-pointer hover:bg-[#e9e3f5] focus:outline-none focus:ring-2 focus:ring-[#39092c] focus:ring-offset-2 aria-selected:bg-[#e9e3f5] aria-selected:text-[#39092c]",
        day_selected:
          "bg-[#39092c] text-white font-bold shadow-lg rounded-xl transition-all duration-200",
        day_today:
          "border-2 border-[#39092c] font-bold text-[#39092c] bg-[#f7f8fa]",
        day_outside:
          "text-gray-300 opacity-60 aria-selected:bg-[#e9e3f5] aria-selected:text-[#39092c] aria-selected:opacity-40",
        day_disabled: "text-gray-200 opacity-50 cursor-not-allowed",
        day_range_middle:
          "bg-[#e9e3f5] text-[#39092c] rounded-xl aria-selected:bg-[#e9e3f5]",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  </div>
);

Calendar.displayName = "Calendar";
