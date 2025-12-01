"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Tipo para intervalo de datas
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
  const handleDateChange = (selected: SelectedRange | Date | undefined) => {
    setDate?.(selected);

    // Ativa o filtro quando seleciona uma data
    if (selected && setEnableDateFilter) {
      setEnableDateFilter(true);
    }
  };

  const clearDates = () => {
    const empty = enableRange ? { from: undefined, to: undefined } : undefined;
    setDate?.(empty);
    setEnableDateFilter?.(false);
  };

  // Preparar datas formatadas para exibição
  const fromDate = enableRange && (date as SelectedRange)?.from ? format((date as SelectedRange).from!, dateFormat) : null;
  const toDate = enableRange && (date as SelectedRange)?.to ? format((date as SelectedRange).to!, dateFormat) : null;
  const singleDate = !enableRange && date instanceof Date ? format(date, dateFormat) : null;

  return (
    <div className={cn("grid gap-2 w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {enableDateFilter
              ? enableRange
                ? fromDate
                  ? toDate
                    ? `${fromDate} - ${toDate}`
                    : fromDate
                  : placeholderText
                : singleDate
                ? singleDate
                : placeholderText
              : placeholderText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {enableDateFilter && (
            <Calendar
              mode={enableRange ? "range" : "single"}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={enableRange ? 2 : 1}
              initialFocus
              defaultMonth={enableRange ? (date as SelectedRange)?.from : (date as Date)}
              className="w-full"
            />
          )}
          <Button variant="outline" className="w-full mt-2" onClick={clearDates}>
            Limpar Datas
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
