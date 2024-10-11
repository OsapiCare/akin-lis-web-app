"use client";

import { Calendar, CalendarProps, CalendarBaseProps } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import { useState } from "react";

interface ICalenderDate extends CalendarBaseProps {
  // data: { id: number; value: string }[];
  minDateToBeToday?: boolean;
  noUseLabel?: boolean;
}

export default function CalenderDate({ minDateToBeToday, noUseLabel, ...rest }: ICalenderDate) {
  //   const [selectedGender, setSelectedGender] = useState<any>(null);
  //   function onChangeGender(data: { value: string }) {
  //     console.log(data.value);
  //     // setSelectedGender(data.value);
  //   }
  //   return <PrimeDropdown className="border-2 border-akin-yellow-light  rounded-lg bg-akin-yellow-light/20 ring-0" value={selectedGender} options={data} onChange={onChangeGender} optionLabel="value"  {...rest } />;
  // }
  const [date, setDate] = useState<Nullable<Date>>(minDateToBeToday ? new Date() : null);
  return (
    // <div className="card gap-3 p-fluid">
    <div className="card gap-3 ">
      {/* <div className="flex-auto"> */}
      {!noUseLabel && (
        <label htmlFor="buttondisplay" className="font-bold block mb-2">
          Data
        </label>
      )}

      <Calendar id="buttondisplay" className="border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0 w-full" value={date} onChange={(e) => setDate(e.value)} showIcon  {...rest} dateFormat="yy/m/d"/>
      {/* </div> */}
    </div>
  );
}

/**
   * 
   *  <div className="flex-auto">
                <label htmlFor="buttondisplay" className="font-bold block mb-2">
                    Icon Display
                </label>

                <Calendar value={date} onChange={(e) => setDate(e.value)} showIcon  />
            </div> 

          <div className="flex-auto">
                <label htmlFor="buttondisplay" className="font-bold block mb-2">
                    Icon Template
                </label>

                <Calendar value={date} onChange={(e) => setDate(e.value)} showIcon timeOnly  icon={() => <i className="pi pi-clock" />} />
            </div> */
