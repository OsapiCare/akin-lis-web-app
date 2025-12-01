"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Definir o tipo SelectedRange manualmente
export type SelectedRange = {
  from?: Date;
  to?: Date;
};

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultDate?: SelectedRange | Date;
  dateFormat?: string;
  placeholderText?: string;
  enableRange?: boolean; // Habilita/desabilita intervalo
  onDateChange?: (date: SelectedRange | Date | undefined) => void;
  enableDateFilter?: boolean; // Habilita/desabilita filtragem de data
  setEnableDateFilter?: (enable: boolean) => void; // Função para ativar filtro
}

export function DatePickerWithRange({
  className,
  defaultDate,
  dateFormat = "LLL dd, y",
  placeholderText = "Selecione uma data",
  enableRange = true,
  onDateChange,
  enableDateFilter = true,
  setEnableDateFilter,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<SelectedRange | Date | undefined>(
    defaultDate ? (enableRange ? (defaultDate as SelectedRange) : (defaultDate as Date)) : undefined
  );

  const handleDateChange = (selectedDate: SelectedRange | Date | undefined) => {
    setDate(selectedDate);
    onDateChange?.(selectedDate);
    if (selectedDate && setEnableDateFilter) {
      setEnableDateFilter(true);
    }
  };

  const clearDates = () => {
    const empty = enableRange ? { from: undefined, to: undefined } : undefined;
    setDate(empty);
    onDateChange?.(empty);
    if (setEnableDateFilter) setEnableDateFilter(false);
  };

  // Preparar datas para exibição
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
              initialFocus
              mode={enableRange ? "range" : "single"}
              defaultMonth={enableRange ? (date as SelectedRange)?.from : (date as Date)}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={enableRange ? 2 : 1}
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
