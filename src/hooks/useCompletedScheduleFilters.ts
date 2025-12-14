import { useAuthRoleStore } from "@/utils/zustand-store/userRoleStore";
import { useState, useMemo } from "react";

export interface CompletedScheduleFilters {
  searchQuery: string;
  examStatus: string;
  paymentStatus: string;
  technicianFilter: string; // <- sempre existe
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

export function useCompletedScheduleFilters(schedules: CompletedScheduleType[]) {
  const { role } = useAuthRoleStore();

  const [filters, setFilters] = useState<CompletedScheduleFilters>({
    searchQuery: "",
    examStatus: "TODOS",
    paymentStatus: "TODOS",
    technicianFilter: "TODOS",
    dateFrom: null,
    dateTo: null,
  });

  /** Aplicar filtros */
  const filteredSchedules = useMemo(() => {
    if (!schedules) return [];

    return schedules.filter(schedule => {
      const patient = schedule.Paciente;

      // 🔍 SEARCH
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();

        const matchName = patient?.nome_completo?.toLowerCase().includes(q);
        const matchBI = patient?.numero_identificacao?.toLowerCase().includes(q);
        const matchPhone = patient?.contacto_telefonico?.toLowerCase().includes(q);

        if (!matchName && !matchBI && !matchPhone) return false;
      }

      // 📅 DATE FROM
      if (filters.dateFrom) {
        const match = schedule.Exame?.some(exam => {
          const d = new Date(exam.data_agendamento);
          return d >= filters.dateFrom!;
        });
        if (!match) return false;
      }

      // 📅 DATE TO
      if (filters.dateTo) {
        const match = schedule.Exame?.some(exam => {
          const d = new Date(exam.data_agendamento);
          return d <= filters.dateTo!;
        });
        if (!match) return false;
      }

      // 📌 EXAM STATUS
      if (filters.examStatus !== "TODOS") {
        const match = schedule.Exame?.some(exam =>
          exam.status === filters.examStatus
        );
        if (!match) return false;
      }

      // 💰 PAYMENT STATUS
      if (filters.paymentStatus !== "TODOS") {
        const match = schedule.Exame?.some(exam =>
          exam.status_pagamento === filters.paymentStatus
        );
        if (!match) return false;
      }

      // 👨‍🔧 TECHNICIAN FILTER (apenas se role !== CHEFE)
      if (role !== "CHEFE") {
        if (filters.technicianFilter === "ALOCADO") {
          if (!schedule.id_chefe_alocado) return false;
        }

        if (filters.technicianFilter === "NAO_ALOCADO") {
          if (schedule.id_chefe_alocado) return false;
        }
      }

      return true;
    });

  }, [schedules, filters, role]);


  /** SETTERS */
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleFilterChange = (newFilters: Partial<CompletedScheduleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = (key?: keyof CompletedScheduleFilters) => {
    if (!key) {
      setFilters({
        searchQuery: "",
        examStatus: "TODOS",
        paymentStatus: "TODOS",
        technicianFilter: "TODOS",
        dateFrom: null,
        dateTo: null,
      });
      return;
    }

    setFilters(prev => {
      const updated = { ...prev };
      switch (key) {
        case "examStatus":
        case "paymentStatus":
        case "technicianFilter":
          updated[key] = "TODOS";
          break;
        case "dateFrom":
        case "dateTo":
          updated[key] = null;
          break;
        case "searchQuery":
          updated[key] = "";
          break;
      }
      return updated;
    });
  };

  return {
    filteredSchedules,
    filters,
    handleSearch,
    handleFilterChange,
    clearFilters,
  };
}
