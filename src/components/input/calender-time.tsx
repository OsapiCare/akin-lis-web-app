"use client";

import { Calendar, CalendarBaseProps } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import { useState } from "react";

interface ICalenderTime {
  // data: { id: number; value: string }[];
}

export default function CalenderTime({ ...rest }: CalendarBaseProps) {
  //   const [selectedGender, setSelectedGender] = useState<any>(null);
  //   function onChangeGender(data: { value: string }) {
  //     console.log(data.value);
  //     // setSelectedGender(data.value);
  //   }
  //   return <PrimeDropdown className="border-2 border-akin-yellow-light  rounded-lg bg-akin-yellow-light/20 ring-0" value={selectedGender} options={data} onChange={onChangeGender} optionLabel="value"  {...rest } />;
  // }
  const [time, setTime] = useState<Nullable<Date>>(new Date());
  return (
    // <div className="card gap-3 p-fluid">
    <div className="card gap-3 ">
      {/* <div className="flex-auto"> */}
      <label htmlFor="buttondisplay" className="font-bold block mb-2">
        Hora
      </label>
      <Calendar id="buttondisplay" className="border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0 w-full" value={time} onChange={(e) => setTime(e.value)} showIcon  timeOnly hourFormat="24" {...rest} />
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
