"use client";

import { Calendar, CalendarProps, CalendarBaseProps } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import { useEffect, useState } from "react";

interface ICalenderDate extends CalendarBaseProps {
  noUseLabel?: boolean;
  valueDate: Date | null;
}

export default function CalenderDate({ noUseLabel, valueDate, ...rest }: ICalenderDate) {
  const [date, setDate] = useState<Nullable<Date>>(valueDate ? valueDate : null);

  useEffect(() => {
    setDate(valueDate ? valueDate : null);
  }, [valueDate]);
  return (
    <div className="card gap-3 ">
      {!noUseLabel && (
        <label htmlFor="buttondisplay" className="font-bold block mb-2">
          Data
        </label>
      )}

      <Calendar id="buttondisplay" className="border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0 w-full" value={date} onChange={(e) => setDate(e.value)} showIcon {...rest} dateFormat="yy/m/d" />
    </div>
  );
}
