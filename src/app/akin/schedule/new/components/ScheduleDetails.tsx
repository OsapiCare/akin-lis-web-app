"use client";
import { Combobox } from "@/components/combobox/comboboxExam";
import { Skeleton } from "@/components/ui/skeleton";
import { _axios } from "@/Api/axios.config";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Stethoscope, Microscope } from "lucide-react";
import { Calendar } from "primereact/calendar";
import TimePicker from "@/components/ui/timepicker";
import { IItemTipoProps } from "@/module/types";

enum TipoItem {
  EXAME = "EXAME",
  CONSULTA = "CONSULTA"
}

export type ScheduleItem = {
  item: IItemTipoProps | null;
  tipo: "EXAME" | "CONSULTA";
  date: Date | null;
  time: string;
};

export function ScheduleDetails({ 
  isLoading, 
  items, 
  schedules, 
  onChange,
  selectedTipo 
}: { 
  isLoading: boolean; 
  items: IItemTipoProps[]; 
  schedules: ScheduleItem[]; 
  onChange: (schedules: ScheduleItem[]) => void;
  selectedTipo: TipoItem;
}) {
  
  const handleScheduleChange = (index: number, key: keyof ScheduleItem, value: any) => {
    const updatedSchedules = [...schedules];

    if (key === "date") {
      updatedSchedules[index].date = value instanceof Date ? value : null;
    } else if (key === "item") {
      updatedSchedules[index].item = value;
    } else if (key === "time") {
      updatedSchedules[index].time = value instanceof Date ? value.toTimeString().slice(0, 5) : value;
    } else if (key === "tipo") {
      updatedSchedules[index].tipo = value;
      // Quando mudar o tipo, limpar o item selecionado
      updatedSchedules[index].item = null;
    }

    onChange(updatedSchedules);
  };

  const handleAddSchedule = () => {
    onChange([...schedules, { item: null, tipo: selectedTipo, date: null, time: "" }]);
  };

  const handleRemoveSchedule = (index: number) => {
    onChange(schedules.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <Skeleton className="w-full h-12 rounded-md" />;
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho informativo */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-md">
        {selectedTipo === TipoItem.EXAME ? (
          <>
            <Microscope className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-700">Agendando Exames Laboratoriais</span>
          </>
        ) : (
          <>
            <Stethoscope className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700">Agendando Consultas Clínicas</span>
          </>
        )}
      </div>

      {schedules.map((schedule, index) => (
        <div key={index} className="flex flex-col flex-wrap lg:flex-nowrap md:flex-row gap-4 justify-between p-4 bg-white rounded-lg border">
          
          {/* Seletor de Item (Exame ou Consulta) */}
          <div className="flex flex-col justify-between w-full">
            <label className="font-bold  mb-2 flex items-center gap-2">
              {schedule.tipo === TipoItem.EXAME ? (
                <>
                  <Microscope className="h-4 w-4" />
                  Exame
                </>
              ) : (
                <>
                  <Stethoscope className="h-4 w-4" />
                  Consulta
                </>
              )}
            </label>
            
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                size="sm"
                variant={schedule.tipo === TipoItem.EXAME ? "default" : "outline"}
                onClick={() => handleScheduleChange(index, "tipo", TipoItem.EXAME)}
                className="text-xs"
              >
                Exame
              </Button>
              <Button
                type="button"
                size="sm"
                variant={schedule.tipo === TipoItem.CONSULTA ? "default" : "outline"}
                onClick={() => handleScheduleChange(index, "tipo", TipoItem.CONSULTA)}
                className="text-xs"
              >
                Consulta
              </Button>
            </div>
            
            <Combobox 
              data={items.filter(item => item.tipo === schedule.tipo)} 
              displayKey="nome" 
              selectedValue={schedule.item} 
              onSelect={(item) => handleScheduleChange(index, "item", item)} 
              placeholder={`Selecionar ${schedule.tipo === TipoItem.EXAME ? "exame" : "consulta"}`}
              clearLabel="Limpar"
            />
            
            {/* Informações do item selecionado */}
            {schedule.item && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Preço:</span>
                  <span className="text-green-600 font-bold">
                    {new Intl.NumberFormat("pt-AO", {
                      style: "currency",
                      currency: "AOA"
                    }).format(schedule.item.preco)}
                  </span>
                </div>
                {schedule.item.descricao && (
                  <p className="text-gray-600 mt-1">{schedule.item.descricao}</p>
                )}
              </div>
            )}
          </div>

          {/* Data */}
          <div className="card gap-3 w-full">
            <label htmlFor={`calendar-${index}`} className="font-bold block mb-2">
              Data
            </label>
            <Calendar 
              id={`calendar-${index}`} 
              value={schedule.date} 
              onChange={(e) => handleScheduleChange(index, "date", e.value)} 
              showIcon 
              dateFormat="yy/m/d" 
              readOnlyInput 
              className="w-full h-10 px-2 bg-white rounded-md shadow-sm border-gray-300 focus:border-none" 
            />
          </div>

          {/* Hora e Botão de Remover */}
          <div className="flex items-end gap-0 w-full md:gap-2 flex-wrap md:flex-nowrap">
            <div className="card gap-3 w-full">
              <label htmlFor={`time-${index}`} className="font-bold block mb-2">
                Hora
              </label>
              <TimePicker 
                value={schedule.time} 
                onChange={(time) => handleScheduleChange(index, "time", time)} 
              />
            </div>
            
            {schedules.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => handleRemoveSchedule(index)}
                className="h-10"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Botão para adicionar novo item */}
      <div className="flex justify-between items-center">
        <Button 
          type="button" 
          onClick={handleAddSchedule} 
          className="py-2 px-4 bg-green-600 hover:bg-green-500 text-white shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar {selectedTipo === TipoItem.EXAME ? "Exame" : "Consulta"}
        </Button>
        
        {/* Resumo */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">
            Total de itens: {schedules.length}
          </span>
          <span className="mx-2">•</span>
          <span className="font-medium">
            Valor total: {new Intl.NumberFormat("pt-AO", {
              style: "currency",
              currency: "AOA"
            }).format(schedules.reduce((sum, s) => sum + (s.item?.preco || 0), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}