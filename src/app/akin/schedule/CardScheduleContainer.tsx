"use client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import CardSchedule from "./CardSchedule";
import { isWithinInterval } from "date-fns";
import { SelectedRange } from "@/components/ui/date-picker"; // importar o tipo correto
import { DatePickerWithRange } from "@/components/ui/date-picker";

interface ICardScheduleContainer {
  schedule: ScheduleType[];
  title: string;
  isLoading: boolean;
  showOnlyPending?: boolean;
}

const ITEMS_PER_PAGE = 9;
const all = "all";
const allocated = "allocated";
const notAllocated = "notAllocated";

export default function CardScheduleContainer({ schedule, title, isLoading, showOnlyPending = true }: ICardScheduleContainer) {
  const [filteredSchedule, setFilteredSchedule] = useState<ScheduleType[]>(
    schedule.map((s) => ({
      ...s,
      Exame: showOnlyPending ? s.Exame?.filter((exame) => exame.status === "PENDENTE") : s.Exame,
    })).filter((s) => s.Exame && s.Exame.length > 0)
  );
  const [isSearching, setIsSearching] = useState(false);
  const [filterByTechnician, setFilterByTechnician] = useState<typeof all | typeof allocated | typeof notAllocated>(all);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDateRange, setSelectedDateRange] = useState<SelectedRange | undefined>(undefined);
  const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(false);

  const totalItems = filteredSchedule.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handleSearch = (searchText: string) => {
    setIsSearching(!!searchText);
    if (schedule) {
      const filtered = schedule.filter((s) =>
        s.Paciente?.nome_completo?.toLowerCase().includes(searchText.toLowerCase())
      );
      applyFilters(filtered);
    }
  };

  const handleDateChange = (date: SelectedRange | Date | undefined) => {
    if (date && !(date instanceof Date)) {
      setSelectedDateRange(date);
    }
  };

  const applyFilters = useCallback((baseSchedule: ScheduleType[]) => {
    let filtered = baseSchedule.map((s) => ({
      ...s,
      Exame: showOnlyPending ? s.Exame?.filter((exame) => exame.status === "PENDENTE") : s.Exame,
    })).filter((s) => s.Exame && s.Exame.length > 0);

    if (filterByTechnician === allocated) {
      filtered = filtered.filter((s) => s.Exame?.some((exame) => exame.id_tecnico_alocado !== null));
    } else if (filterByTechnician === notAllocated) {
      filtered = filtered.filter((s) => s.Exame?.some((exame) => exame.id_tecnico_alocado === null));
    }

    if (isDateFilterEnabled && selectedDateRange) {
      filtered = filtered.filter((s) =>
        s.Exame?.some((exame) =>
          isWithinInterval(new Date(exame.data_agendamento), {
            start: selectedDateRange.from!,
            end: selectedDateRange.to!,
          })
        )
      );
    }

    setFilteredSchedule(filtered);
  }, [filterByTechnician, isDateFilterEnabled, selectedDateRange, showOnlyPending]);

  useEffect(() => {
    applyFilters(schedule);
  }, [schedule, filterByTechnician, isDateFilterEnabled, selectedDateRange, applyFilters]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredSchedule.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-4 mt-1">
          <Input
            className="w-full max-w-xs ring-0 focus:ring-0 focus-visible:ring-0"
            placeholder="Procurar por paciente"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="flex flex-col md:flex-row items-center gap-2 w-full">
            <DatePickerWithRange
              enableRange={true}
              enableDateFilter={true}
              defaultDate={undefined}
              placeholderText="Selecionar intervalo de datas"
              onDateChange={handleDateChange}
              setEnableDateFilter={setIsDateFilterEnabled}
            />
          </div>
          <select
            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-base md:text-sm"
            value={filterByTechnician}
            onChange={(e) => setFilterByTechnician(e.target.value as typeof all | typeof allocated | typeof notAllocated)}
          >
            <option value={all}>Todos</option>
            <option value={allocated}>Técnicos Alocados</option>
            <option value={notAllocated}>Técnicos Não Alocados</option>
          </select>
        </div>
      </header>

      {isSearching && <p className="text-sm text-gray-600 italic">Total de agendamentos encontrados: {filteredSchedule.length}</p>}

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="spinner border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      ) : (
        <div>
          {currentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {currentItems.map((data, index) => {
                const filteredExams = data.Exame?.filter((exame) => {
                  if (isDateFilterEnabled && selectedDateRange && !isWithinInterval(new Date(exame.data_agendamento), {
                    start: selectedDateRange.from!,
                    end: selectedDateRange.to!,
                  })) return false;
                  if (filterByTechnician === allocated) return exame.id_tecnico_alocado !== null;
                  if (filterByTechnician === notAllocated) return exame.id_tecnico_alocado === null;
                  return true;
                });

                if ((!filteredExams || filteredExams.length === 0) && isDateFilterEnabled) return null;

                return (
                  <Card key={index} className="p-4 w-full">
                    <CardSchedule data={{ ...data, Exame: filteredExams }} />
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum agendamento encontrado.</p>
          )}

          <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t mt-3">
            <span className="text-sm text-gray-600">
              Exibindo {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} de {totalItems} agendamentos
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  className={`px-3 py-1 text-sm font-medium border rounded ${currentPage === idx + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-100"}`}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
