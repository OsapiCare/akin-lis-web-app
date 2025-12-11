"use client";

import { useParams } from "next/navigation";
import { View } from "@/components/view";
import { Exam } from "./useExamHookData";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Combobox } from "@/components/combobox/comboboxExam";
import { ExamCard } from "@/app/akin/patient/[id]/utils/exam-history/exam-card";
import { PatientByIdProfileSkeleton } from "@/app/akin/patient/[id]/utils/exam-history/patientByIdProfileSkeleton";
import { useQuery } from "@tanstack/react-query";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { isWithinInterval } from "date-fns";
import "react-day-picker/dist/style.css";
import { _axios } from "@/Api/axios.config";
import { IExamProps } from "@/module/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Types

type DateRange = {
  from?: Date;
  to?: Date;
};

interface ExamData {
  id: number;
  data_agendamento: string;
  hora_agendamento: string;
  status: string;
  status_pagamento: string;
  Tipo_Exame: {
    nome: string;
    descricao: string;
    preco: number;
  };
  Agendamento: {
    id_unidade_de_saude: number;
    id_tecnico_alocado: string | null;
  };
}

interface ExamHistoryFilters {
  statusFilter: string | null;
  selectedExam: IExamProps | null;
  selectedDateRange: DateRange | undefined;
  isDateFilterEnabled: boolean;
  searchTerm: string;
}

export default function ExamsHistory() {
  const { id } = useParams<{ id: string }>();
  const [namePatient, setNamePatient] = useState<string>("");
  const [exams, setExams] = useState<IExamProps[]>([]);
  const [filters, setFilters] = useState<ExamHistoryFilters>({
    statusFilter: null,
    selectedExam: null,
    selectedDateRange: undefined,
    isDateFilterEnabled: false,
    searchTerm: "",
  });
  const [filteredExams, setFilteredExams] = useState<ExamData[]>([]);

  const historyExams = useQuery({
    queryKey: ["exams-history", id],
    queryFn: async () => {
      const response = await _axios.get<Exam>(`/exams/history/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch patient and exam types data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [patientData, examTypes] = await Promise.all([_axios.get(`/pacients/${id}`), _axios.get("/exam-types")]);

        setNamePatient(patientData.data.nome_completo);
        setExams(examTypes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  // Filter exams based on criteria
  useEffect(() => {
    if (!historyExams.data?.data) return;

    const filtered = historyExams.data.data.filter((exam) => {
      const isWithinDateRange =
        !filters.isDateFilterEnabled ||
        (filters.selectedDateRange &&
          filters.selectedDateRange.from &&
          filters.selectedDateRange.to &&
          isWithinInterval(new Date(exam.data_agendamento), {
            start: filters.selectedDateRange.from,
            end: new Date(filters.selectedDateRange.to.setHours(23, 59, 59, 999)),
          }));

      const matchesType = !filters.selectedExam || exam.Tipo_Exame.nome === filters.selectedExam.nome;

      const matchesStatus = !filters.statusFilter || exam.status.toLowerCase() === filters.statusFilter.toLowerCase();

      const matchesSearch = !filters.searchTerm || exam.Tipo_Exame.nome.toLowerCase().includes(filters.searchTerm.toLowerCase()) || exam.status.toLowerCase().includes(filters.searchTerm.toLowerCase());

      return isWithinDateRange && matchesType && matchesStatus && matchesSearch;
    });

    setFilteredExams(filtered);
  }, [filters, historyExams.data]);

  // Filter handlers
  const handleDateChange = (date: Date | DateRange | undefined) => {
    if (!date) return;

    if ((date as DateRange).from && (date as DateRange).to) {
      const range = date as DateRange;
      setFilters((prev) => ({
        ...prev,
        startDate: range.from,
        endDate: range.to,
      }));
    }

    if (date instanceof Date) {
      setFilters((prev) => ({
        ...prev,
        startDate: date,
        endDate: date,
      }));
    }
  };

  const handleExamSelect = (exam: IExamProps | null) => {
    setFilters((prev) => ({ ...prev, selectedExam: exam }));
  };

  const handleStatusChange = (status: string | null) => {
    setFilters((prev) => ({ ...prev, statusFilter: status }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const clearAllFilters = () => {
    setFilters({
      statusFilter: null,
      selectedExam: null,
      selectedDateRange: undefined,
      isDateFilterEnabled: false,
      searchTerm: "",
    });
  };

  const statusOptions = [
    { label: "Todos", value: null },
    { label: "Pendente", value: "pendente" },
    { label: "Concluído", value: "concluido" },
    { label: "Cancelado", value: "cancelado" },
  ];

  if (historyExams.isLoading || !namePatient) {
    return (
      <View.Vertical className="min-h-screen bg-gray-50">
        <PatientByIdProfileSkeleton />
      </View.Vertical>
    );
  }

  if (historyExams.isError) {
    return (
      <View.Vertical className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
            <CardDescription>Ocorreu um erro ao carregar os dados do histórico de exames.</CardDescription>
          </CardHeader>
        </Card>
      </View.Vertical>
    );
  }

  return (
    <View.Vertical className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Header Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Histórico de Exames
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span className="font-medium">Paciente:</span>
            <Badge variant="outline" className="text-sm">
              {namePatient}
            </Badge>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="search" placeholder="Buscar por exame ou status..." value={filters.searchTerm} onChange={handleSearchChange} className="pl-9" />
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Data</Label>
              <DatePickerWithRange enableRange={true} enableDateFilter={true} onDateChange={handleDateChange} setEnableDateFilter={(enable) => setFilters((prev) => ({ ...prev, isDateFilterEnabled: enable }))} placeholderText="Selecionar período" />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Combobox data={statusOptions} displayKey="label" onSelect={(item) => handleStatusChange(item?.value || null)} selectedValue={statusOptions.find((opt) => opt.value === filters.statusFilter) || null} placeholder="Filtrar por status" clearLabel="Limpar" />
            </div>

            {/* Exam Type Filter */}
            <div className="space-y-2">
              <Label>Tipo de Exame</Label>
              <Combobox data={exams} displayKey="nome" onSelect={handleExamSelect} selectedValue={filters.selectedExam} placeholder="Selecionar exame" clearLabel="Limpar" />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={clearAllFilters} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Exames Realizados
            </span>
            <Badge variant="secondary" className="text-sm">
              {filteredExams.length} resultado(s)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExams && filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ExamCard data={filteredExams} />
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Nenhum exame encontrado</p>
              <p className="text-gray-500 text-sm mt-2">Ajuste os filtros para encontrar os exames desejados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </View.Vertical>
  );
}
