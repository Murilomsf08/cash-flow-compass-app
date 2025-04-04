
import * as React from "react";
import { format } from "date-fns";
import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateRangePickerProps {
  dateRange: {
    from: Date;
    to: Date | undefined;
  };
  onDateRangeChange: (dateRange: { from: Date; to: Date | undefined }) => void;
  className?: string;
}

export function DateRangePicker({ 
  dateRange, 
  onDateRangeChange, 
  className 
}: DateRangePickerProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarRange className="mr-2 h-4 w-4 shrink-0" />
            {dateRange?.from ? (
              dateRange.to ? (
                <span className="truncate text-xs sm:text-sm">
                  {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                </span>
              ) : (
                <span className="truncate text-xs sm:text-sm">
                  {format(dateRange.from, "dd/MM/yyyy")}
                </span>
              )
            ) : (
              <span className="text-xs sm:text-sm">Selecione período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn(
          "w-auto p-0",
          isMobile ? "max-w-[calc(100vw-24px)]" : ""
        )} align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={isMobile ? 1 : 2}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
