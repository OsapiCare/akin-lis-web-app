"use client";
import { Combobox } from "@/components/combobox/comboboxExam";
import { Skeleton } from "@/components/ui/skeleton";
import { _axios } from "@/Api/axios.config";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Calendar } from "primereact/calendar";
import TimePicker from "@/components/ui/timepicker";
import { IExamProps } from "@/module/types";

export type ScheduleItem = {
  exam: IExamProps | null;
  date: Date | null;
  time: string;
};

export function ScheduleDetails({ isLoading, exams, schedules, onChange }: { isLoading: boolean; exams: IExamProps[]; schedules: ScheduleItem[]; onChange: (schedules: ScheduleItem[]) => void }) {
  const handleScheduleChange = (index: number, key: keyof ScheduleItem, value: any) => {
    const updatedSchedules = [...schedules];

    if (key === "date") {
      updatedSchedules[index].date = value instanceof Date ? value : null;
    } else if (key === "exam") {
      updatedSchedules[index].exam = value;
    } else if (key === "time") {
      updatedSchedules[index].time = value instanceof Date ? value.toTimeString().slice(0, 5) : value;
    }

    onChange(updatedSchedules);
  };

  const handleAddSchedule = () => {
    onChange([...schedules, { exam: null, date: null, time: "" }]);
  };

  const handleRemoveSchedule = (index: number) => {
    onChange(schedules.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <Skeleton className="w-full h-12 rounded-md" />;
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule, index) => (
        <div key={index} className="flex flex-col flex-wrap lg:flex-nowrap md:flex-row gap-4 justify-between">
          <div className="flex flex-col justify-between w-full ">
            <label className="font-bold block mb-2">Exames Disponíveis</label>
            <Combobox 
            data={exams} 
            displayKey="nome" 
            selectedValue={schedule.exam} 
            onSelect={(exam) => handleScheduleChange(index, "exam", exam)} 
            placeholder="Selecionar exame" 
            clearLabel="Limpar"
            />
          </div>
          <div className="card gap-3 w-full">
            <label htmlFor={`calendar-${index}`} className="font-bold block mb-2">
              Data
            </label>
            <Calendar id={`calendar-${index}`} value={schedule.date} onChange={(e) => handleScheduleChange(index, "date", e.value)} showIcon dateFormat="yy/m/d" readOnlyInput className="w-full h-10 px-2  bg-white rounded-md shadow-sm border-gray-300 focus:border-none" />
          </div>

          <div className="flex items-end gap-0 w-full md:gap-2 flex-wrap md:flex-nowrap ">
            <div className="card gap-3 w-full">
              <label htmlFor={`time-${index}`} className="font-bold block mb-2">
                Hora
              </label>
              <TimePicker value={schedule.time} onChange={(time) => handleScheduleChange(index, "time", time)} />
            </div>
            <Button type="button" variant="ghost" onClick={() => handleRemoveSchedule(index)}>
              <Trash2 size={45} className="text-red-600" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" onClick={handleAddSchedule} className=" py-2  px-4 bg-green-600 hover:bg-green-500  text-white shadow-md">
        <Plus />
        Adicionar
      </Button>
    </div>
  );
}
