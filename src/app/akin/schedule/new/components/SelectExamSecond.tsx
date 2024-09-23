import { Calendar } from "primereact/calendar";
import { useState } from "react";

export default function CheckBoxSecond() {
  const [date, setDate] = useState<Date | null>();
  return (
    <div className="flex flex-col gap-4">
      {/* <div className="space-y-2 model p-4  h-[18.9rem] "> */}
      <h1 className="font-bold text-xl pt-4">Definir Data</h1>
      <Calendar value={date} onChange={(e) => setDate(e.value)} showIcon />
      <Calendar timeOnly value={date} onChange={(e) => setDate(e.value)} showIcon />
    </div>
  );
}
