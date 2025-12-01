import { useAuthRoleStore } from "@/utils/zustand-store/userRoleStore";
import { useState, useMemo } from "react";

export function useCompletedScheduleFilters(schedules: CompletedScheduleType[]) {
  const { role } = useAuthRoleStore();


  const [filters, setFilters] = useState<CompletedScheduleFilters>({
    searchQuery: "",
    examStatus: "TODOS",
    paymentStatus: "TODOS",
    technicianFilter: "TODOS",
  });

  if (role === "CHEFE") {
    delete filters.technicianFilter;
  }

  const filteredSchedules = useMemo(() => {
    if (!schedules) return [];

    return schedules.filter((schedule) => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const patient = schedule.Paciente;
        const matchesName = patient?.nome_completo?.toLowerCase().includes(query);
        const matchesBI = patient?.numero_identificacao?.toLowerCase().includes(query);
        const matchesPhone = patient?.contacto_telefonico?.toLowerCase().includes(query);

        if (!matchesName && !matchesBI && !matchesPhone) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateFrom && schedule.Exame && schedule.Exame.length > 0) {
        const hasDateInRange = schedule.Exame.some(exam => {
          const examDate = new Date(exam.data_agendamento);
          return examDate >= filters.dateFrom!;
        });
        if (!hasDateInRange) {
          return false;
        }
      }

      if (filters.dateTo && schedule.Exame && schedule.Exame.length > 0) {
        const hasDateInRange = schedule.Exame.some(exam => {
          const examDate = new Date(exam.data_agendamento);
          return examDate <= filters.dateTo!;
        });
        if (!hasDateInRange) {
          return false;
        }
      }

      // Exam status filter
      if (filters.examStatus && filters.examStatus !== "TODOS") {
        const hasMatchingStatus = schedule.Exame?.some(exam =>
          exam.status === filters.examStatus
        );
        if (!hasMatchingStatus) {
          return false;
        }
      }

      // Payment status filter
      if (filters.paymentStatus && filters.paymentStatus !== "TODOS") {
        const hasMatchingPaymentStatus = schedule.Exame?.some(exam =>
          exam.status_pagamento === filters.paymentStatus
        );
        if (!hasMatchingPaymentStatus) {
          return false;
        }
      }

      // Technician filter
      if (filters.technicianFilter && filters.technicianFilter !== "TODOS") {
        if (filters.technicianFilter === "ALOCADO") {
          const hasAllocatedTechnician = schedule.Exame?.some(exam =>
            exam.id_tecnico_alocado !== null
          );
          if (!hasAllocatedTechnician) {
            return false;
          }
        } else if (filters.technicianFilter === "NAO_ALOCADO") {
          const hasUnallocatedExam = schedule.Exame?.some(exam =>
            exam.id_tecnico_alocado === null
          );
          if (!hasUnallocatedExam) {
            return false;
          }
        }
      }

      return true;
    });
  }, [schedules, filters]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleFilterChange = (newFilters: Partial<CompletedScheduleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      examStatus: "TODOS",
      paymentStatus: "TODOS",
      technicianFilter: "TODOS",
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
