"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

export type SelectedRange = {
  from?: Date;
  to?: Date;
};

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: SelectedRange | Date;
  setDate?: (date: SelectedRange | Date | undefined) => void;
  dateFormat?: string;
  placeholderText?: string;
  enableRange?: boolean;
  enableDateFilter?: boolean;
  setEnableDateFilter?: (enable: boolean) => void;
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
  dateFormat = "LLL dd, y",
  placeholderText = "Selecione o período",
  enableRange = true,
  enableDateFilter = true,
  setEnableDateFilter,
}: DatePickerWithRangeProps) {
  // Converte SelectedRange do estado para DateRange do react-day-picker
  const selectedRange: DateRange | undefined =
    enableRange && date && "from" in date ? { from: date.from, to: date.to } : undefined;

  const handleSingleDateChange = (selected: Date | undefined) => {
    setDate?.(selected);
    if (selected && setEnableDateFilter) setEnableDateFilter(true);
  };

  const handleRangeDateChange = (selected: DateRange | undefined) => {
    if (!selected) return;
    setDate?.({ from: selected.from, to: selected.to });
    if (setEnableDateFilter) setEnableDateFilter(true);
  };

  const clearDates = () => {
    setDate?.(enableRange ? { from: undefined, to: undefined } : undefined);
    setEnableDateFilter?.(false);
  };

  const fromDate =
    enableRange && selectedRange?.from ? format(selectedRange.from, dateFormat) : null;
  const toDate =
    enableRange && selectedRange?.to ? format(selectedRange.to, dateFormat) : null;
  const singleDate = !enableRange && date instanceof Date ? format(date, dateFormat) : null;

  const displayText = enableDateFilter
    ? enableRange
      ? fromDate
        ? toDate
          ? `${fromDate} - ${toDate}`
          : fromDate
        : placeholderText
      : singleDate
      ? singleDate
      : placeholderText
    : placeholderText;

  return (
    <div className={cn("grid gap-2 w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {enableDateFilter && (
            <>
              {enableRange ? (
                <Calendar
                  mode="range"
                  selected={selectedRange}
                  onSelect={handleRangeDateChange}
                  numberOfMonths={2}
                  initialFocus
                  defaultMonth={selectedRange?.from ?? new Date()}
                  className="w-full"
                />
              ) : (
                <Calendar
                  mode="single"
                  selected={date as Date | undefined}
                  onSelect={handleSingleDateChange}
                  numberOfMonths={1}
                  initialFocus
                  defaultMonth={(date as Date) ?? new Date()}
                  className="w-full"
                />
              )}
            </>
          )}
          <Button variant="outline" className="w-full mt-2" onClick={clearDates}>
            Limpar Datas
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
