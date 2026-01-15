import { useState, useMemo } from "react";
import { ConsultaFilters, ScheduleFilters } from "@/components/schedule/ScheduleFilters";

export function useConsultaFilters(consultas: ConsultasType[]) {
  const [filters, setFilters] = useState<ConsultaFilters>({
    searchQuery: "",
  });

  const filteredConsultas = useMemo(() => {
    if (!consultas) return [];

    return Array.isArray(consultas) ? consultas.filter((consulta): [] => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const patient = consulta.Paciente;
        const matchesName = patient?.nome_completo?.toLowerCase().includes(query);
        const matchesBI = patient?.numero_identificacao?.toLowerCase().includes(query);
        const matchesPhone = patient?.contacto_telefonico?.toLowerCase().includes(query);

        if (!matchesName && !matchesBI && !matchesPhone) {
          return false || [];
        }
      }

      // Date range filter
      if (filters.dateFrom && consulta.Consulta && consulta.Consulta.length > 0) {
        const hasDateInRange = consulta.Consulta.some(exam => {
          const examDate = new Date(exam.data_agendamento);
          return examDate >= filters.dateFrom!;
        });
        if (!hasDateInRange) {
          return false || [];
        }
      }

      if (filters.dateTo && consulta.Consulta && consulta.Consulta.length > 0) {
        const hasDateInRange = consulta.Consulta.some(exam => {
          const examDate = new Date(exam.data_agendamento);
          return examDate <= filters.dateTo!;
        });
        if (!hasDateInRange) {
          return false || [];
        }
      }

      // Gender filter
      if (filters.gender) {
        const genderId = parseInt(filters.gender);
        if (consulta.Paciente?.id_sexo !== genderId) {
          return false || [];
        }
      }

      // Exam type filter
      if (filters.consultaType) {
        const hasExamType = consulta.Exame?.some(exam =>
          exam.Tipo_Exame?.nome?.toLowerCase().includes(filters.consultaType!.toLowerCase())
        );
        if (!hasExamType) {
          return false || [];
        }
      }

      // Price range filter
      if (filters.priceRange) {
        const totalPrice = consulta.Consulta?.reduce((total, exam) => total + Number((exam.Exame.map((e) => e.Tipo_Exame?.preco)) || 0), 0) || 0;

        if (filters.priceRange.min && totalPrice < filters.priceRange.min) {
          return false || [];
        }

        if (filters.priceRange.max && totalPrice > filters.priceRange.max) {
          return false || [];
        }
      }

      return [];
    }) : [];
  }, [consultas, filters]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleFilterChange = (newFilters: ConsultaFilters) => {
    setFilters(newFilters);
  };

  return {
    filteredConsultas,
    filters,
    handleSearch,
    handleFilterChange,
  };
}

export function useScheduleFilters(exames: ExamsType[]) {
  const [filters, setFilters] = useState<ScheduleFilters>({
    searchQuery: "",
  });



  const filteredExames = useMemo(() => {
    if (!exames) return [];

    return exames.filter((exame) => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const patient = exame?.Agendamento?.Paciente;
        const matchesName = patient?.nome_completo?.toLowerCase().includes(query);
        const matchesBI = patient?.numero_identificacao?.toLowerCase().includes(query);
        const matchesPhone = patient?.contacto_telefonico?.toLowerCase().includes(query);

        if (!matchesName && !matchesBI && !matchesPhone) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateFrom && exame?.Exame && exame?.Exame.length > 0) {
        const hasDateInRange = exame.Exame.some(exam => {
          const examDate = new Date(exam.data_agendamento);
          return examDate >= filters.dateFrom!;
        });
        if (!hasDateInRange) {
          return false;
        }
      }

      if (filters.dateTo && exame.Exame && exame.Exame.length > 0) {
        const hasDateInRange = exame.Exame.some(exam => {
          const examDate = new Date(exam.data_agendamento);
          return examDate <= filters.dateTo!;
        });
        if (!hasDateInRange) {
          return false;
        }
      }

      // Gender filter
      if (filters.gender) {
        const genderId = parseInt(filters.gender);
        if (exame.Agendamento?.Paciente?.id_sexo !== genderId) {
          return false;
        }
      }

      // Exam type filter
      if (filters.examType) {
        const hasExamType = exame.Exame?.some(exam =>
          exam.Tipo_Exame?.nome?.toLowerCase().includes(filters.examType!.toLowerCase())
        );
        if (!hasExamType) {
          return false;
        }
      }

      // Price range filter
      if (filters.priceRange) {
        const totalPrice = exame.Exame?.reduce((total, exam) => total + (exam.Tipo_Exame?.preco || 0), 0) || 0;

        if (filters.priceRange.min && totalPrice < filters.priceRange.min) {
          return false;
        }

        if (filters.priceRange.max && totalPrice > filters.priceRange.max) {
          return false;
        }
      }

      return true;
    });
  }, [exames, filters]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleFilterChange = (newFilters: ScheduleFilters) => {
    setFilters(newFilters);
  };

  return {
    filteredExames,
    filters,
    handleSearch,
    handleFilterChange,
  };
}
