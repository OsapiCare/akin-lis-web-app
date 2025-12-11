"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultDate?: Date | DateRange;
  dateFormat?: string;
  placeholderText?: string;
  enableRange?: boolean;
  onDateChange?: (date:Date | DateRange | undefined) => void;
  enableDateFilter?: boolean;
  setEnableDateFilter?: (enable: boolean) => void;
  showClearButton?: boolean;
  value?: DateRange; // Nova prop para controle externo
}

export type SelectedRange = {
  from?: Date;
  to?: Date;
};

export function DatePickerWithRange({
  className,
  defaultDate,
  dateFormat = "LLL dd, y",
  placeholderText = "Selecione uma data",
  enableRange = true,
  onDateChange,
  enableDateFilter = true,
  setEnableDateFilter,
  showClearButton = true,
  value, // Nova prop
}: DatePickerWithRangeProps) {
  // Se value for fornecido, use-o; caso contrário, use estado interno
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(!enableRange && defaultDate instanceof Date ? defaultDate : undefined);

  const [internalRangeDate, setInternalRangeDate] = React.useState<DateRange | undefined>(enableRange && defaultDate && "from" in (defaultDate as DateRange) ? (defaultDate as DateRange) : undefined);

  // Usar valor externo se fornecido, caso contrário usar estado interno
  const singleDate = value && "from" in value ? undefined : (value as any) || internalDate;
  const rangeDate = value && "from" in value ? (value as DateRange) : internalRangeDate;

  const handleSingleDateChange = (date: Date | undefined) => {
    if (!value) {
      setInternalDate(date);
    }
    onDateChange?.(date);
    if (date && setEnableDateFilter) setEnableDateFilter(true);
  };

  const handleRangeDateChange = (range: DateRange | undefined) => {
    if (!value) {
      setInternalRangeDate(range);
    }
    onDateChange?.(range);
    if (setEnableDateFilter) setEnableDateFilter(!!range);
  };

  const clearDates = () => {
    if (!value) {
      setInternalDate(undefined);
      setInternalRangeDate(undefined);
    }
    onDateChange?.(undefined);
    if (setEnableDateFilter) setEnableDateFilter(false);
  };

  const displayText = enableRange
    ? rangeDate && rangeDate.from && rangeDate.to
      ? format(rangeDate.from, dateFormat) === format(rangeDate.to, dateFormat)
        ? format(rangeDate.from, dateFormat)
        : `${format(rangeDate.from, dateFormat)} - ${format(rangeDate.to, dateFormat)}`
      : placeholderText
    : singleDate
    ? format(singleDate, dateFormat)
    : placeholderText;

  return (
    <div className={cn("grid gap-2 w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !singleDate && !rangeDate && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          {enableDateFilter && (
            <>
              {enableRange ? (
                <Calendar initialFocus mode="range" defaultMonth={rangeDate?.from || new Date()} selected={rangeDate} onSelect={handleRangeDateChange} numberOfMonths={2} className="w-full" />
              ) : (
                <Calendar initialFocus mode="single" defaultMonth={singleDate || new Date()} selected={singleDate} onSelect={handleSingleDateChange} numberOfMonths={1} className="w-full" />
              )}
            </>
          )}
          {showClearButton && (
            <Button variant="outline" className="w-full mt-2" onClick={clearDates}>
              Limpar Datas
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
