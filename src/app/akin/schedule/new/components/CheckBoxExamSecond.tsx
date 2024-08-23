import { Calendar } from "primereact/calendar";
import { useState } from "react";

export default function CheckBoxSecond()
{
    const [date,setDate] = useState<Date|null>()
    return(
        <div className="flex flex-col gap-2">
            <h1 className="font-semibold">Agenda</h1>
            <div className="flex flex-col gap-4">
                <Calendar  value={date} onChange={(e) => setDate(e.value)} showIcon/>
                <Calendar timeOnly value={date} onChange={(e) => setDate(e.value)} showIcon/>
            </div>
          
        </div>
        
    )    
}