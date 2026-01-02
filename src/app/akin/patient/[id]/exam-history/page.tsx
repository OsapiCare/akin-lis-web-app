"use client";

import { useParams } from "next/navigation";
import { View } from "@/components/view";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isWithinInterval, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { _axios } from "@/Api/axios.config";
import { IExamProps } from "@/module/types";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Combobox } from "@/components/combobox/comboboxExam";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Filter, Search, User, CheckCircle, XCircle, Clock, AlertCircle, DollarSign, CalendarDays, FileText } from "lucide-react";
import { ExamCard } from "@/app/akin/patient/[id]/utils/exam-history/exam-card";
import { PatientByIdProfileSkeleton } from "@/app/akin/patient/[id]/utils/exam-history/patientByIdProfileSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Types ---
type DateRange = { from?: Date; to?: Date };

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
    id: number;
  };
  Agendamento: { 
    id: number;
    id_unidade_de_saude: number; 
    id_chefe_alocado?: string | null;
    id_tecnico_alocado?: string | null;
    Paciente?: {
      nome_completo: string;
      numero_identificacao: string;
      contacto_telefonico: string;
    }
  };
  observacoes?: string;
  id_tecnico_alocado?: string | null;
}

interface ExamHistoryFilters {
  statusFilter: string | null;
  selectedExam: IExamProps | null;
  selectedDateRange: DateRange | undefined;
  isDateFilterEnabled: boolean;
  searchTerm: string;
}

// --- Helper Functions ---
const getStatusBadge = (status: string) => {
  switch (status.toUpperCase()) {
    case "CONCLUIDO":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Concluído
        </Badge>
      );
    case "CANCELADO":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelado
        </Badge>
      );
    case "PENDENTE":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pendente
        </Badge>
      );
    case "EM_ANDAMENTO":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Em Andamento
        </Badge>
      );
    case "POR_REAGENDAR":
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <CalendarDays className="w-3 h-3 mr-1" />
          Por Reagendar
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentBadge = (status: string) => {
  switch (status.toUpperCase()) {
    case "PAGO":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Pago</Badge>;
    case "PENDENTE":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
    case "PARCIAL":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Parcial</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// --- Component ---
export default function ExamsHistory() {
  const { id } = useParams<{ id: string }>();
  const [namePatient, setNamePatient] = useState<string>("");
  const [exams, setExams] = useState<IExamProps[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filters, setFilters] = useState<ExamHistoryFilters>({
    statusFilter: null,
    selectedExam: null,
    selectedDateRange: undefined,
    isDateFilterEnabled: false,
    searchTerm: "",
  });
  const [filteredExams, setFilteredExams] = useState<ExamData[]>([]);

  // --- Fetch history ---
  const historyExams = useQuery({
    queryKey: ["exams-history", id],
    queryFn: async () => {
      const response = await _axios.get(`/exams/history/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // --- Fetch patient & exam types ---
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [patientData, examTypes] = await Promise.all([
          _axios.get(`/pacients/${id}`),
          _axios.get("/exam-types")
        ]);
        setNamePatient(patientData.data.nome_completo);
        setExams(examTypes.data.data);
      } catch (err) {
        console.error("Error fetching patient or exam types:", err);
      }
    };

    fetchData();
  }, [id]);

  // --- Filter exams ---
  useEffect(() => {
    if (!historyExams.data) return;

    // Garantir que temos um array
    const examsArray: ExamData[] = Array.isArray(historyExams.data.data) 
      ? historyExams.data.data 
      : [];

    // Filtrar por tab ativa primeiro
    let tabFilteredExams = examsArray;
    
    if (activeTab === "completed") {
      tabFilteredExams = examsArray.filter(exam => 
        exam.status.toUpperCase() === "CONCLUIDO"
      );
    } else if (activeTab === "cancelled") {
      tabFilteredExams = examsArray.filter(exam => 
        exam.status.toUpperCase() === "CANCELADO"
      );
    } else if (activeTab === "pending") {
      tabFilteredExams = examsArray.filter(exam => 
        exam.status.toUpperCase() === "PENDENTE"
      );
    }

    // Aplicar outros filtros
    const filtered = tabFilteredExams.filter((exam) => {
      // Filtro de data
      const isWithinDateRange =
        !filters.isDateFilterEnabled ||
        !filters.selectedDateRange?.from ||
        !filters.selectedDateRange?.to ||
        (filters.selectedDateRange?.from &&
          filters.selectedDateRange?.to &&
          isWithinInterval(new Date(exam.data_agendamento), {
            start: filters.selectedDateRange.from,
            end: new Date(filters.selectedDateRange.to.setHours(23, 59, 59, 999)),
          }));

      // Filtro por tipo de exame
      const matchesType = !filters.selectedExam || 
        exam.Tipo_Exame.nome === filters.selectedExam.nome;

      // Filtro por status (se ainda não filtrado por tab)
      const matchesStatus = !filters.statusFilter || 
        exam.status.toLowerCase() === filters.statusFilter.toLowerCase();

      // Filtro de busca
      const matchesSearch = !filters.searchTerm || 
        exam.Tipo_Exame.nome.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
        exam.status.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (exam.Agendamento?.Paciente?.nome_completo || "").toLowerCase().includes(filters.searchTerm.toLowerCase());

      return isWithinDateRange && matchesType && matchesStatus && matchesSearch;
    });

    setFilteredExams(filtered);
  }, [filters, historyExams.data, activeTab]);

  // --- Handlers ---
  const handleDateChange = (date: Date | DateRange | undefined) => {
    if (!date) return;
    if ((date as DateRange).from && (date as DateRange).to) {
      const range = date as DateRange;
      setFilters((prev) => ({ ...prev, selectedDateRange: range }));
    } else if (date instanceof Date) {
      setFilters((prev) => ({ ...prev, selectedDateRange: { from: date, to: date } }));
    }
  };

  const handleExamSelect = (exam: IExamProps | null) => 
    setFilters((prev) => ({ ...prev, selectedExam: exam }));
  
  const handleStatusChange = (status: string | null) => 
    setFilters((prev) => ({ ...prev, statusFilter: status }));
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
  
  const clearAllFilters = () => {
    setFilters({ 
      statusFilter: null, 
      selectedExam: null, 
      selectedDateRange: undefined, 
      isDateFilterEnabled: false, 
      searchTerm: "" 
    });
    setActiveTab("all");
  };

  const statusOptions = [
    { label: "Todos", value: null },
    { label: "Pendente", value: "PENDENTE" },
    { label: "Concluído", value: "CONCLUIDO" },
    { label: "Cancelado", value: "CANCELADO" },
    { label: "Em Andamento", value: "EM_ANDAMENTO" },
    { label: "Por Reagendar", value: "POR_REAGENDAR" },
  ];

  // --- Loading & Error States ---
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
            <CardDescription>
              Ocorreu um erro ao carregar os dados do histórico de exames.
            </CardDescription>
          </CardHeader>
        </Card>
      </View.Vertical>
    );
  }

  // Contadores para as tabs
  const completedCount = historyExams.data?.data?.filter((exam: ExamData) => 
    exam.status.toUpperCase() === "CONCLUIDO"
  ).length || 0;
  
  const cancelledCount = historyExams.data?.data?.filter((exam: ExamData) => 
    exam.status.toUpperCase() === "CANCELADO"
  ).length || 0;
  
  const pendingCount = historyExams.data?.data?.filter((exam: ExamData) => 
    exam.status.toUpperCase() === "PENDENTE"
  ).length || 0;
  
  const totalCount = historyExams.data?.data?.length || 0;

  // --- Render ---
  return (
    <View.Vertical className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      {/* Header */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="h-6 w-6" />
                Histórico de Exames
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <span className="font-medium">Paciente:</span>
                <Badge variant="outline" className="text-sm font-normal">
                  {namePatient}
                </Badge>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  Total de exames: {totalCount}
                </span>
              </CardDescription>
            </div>
            
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <FileText className="w-4 h-4 mr-2" />
              ID: {id}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs de Status */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Todos
                <Badge variant="outline" className="ml-1 text-xs">
                  {totalCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Concluídos
                <Badge variant="outline" className="ml-1 text-xs">
                  {completedCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Cancelados
                <Badge variant="outline" className="ml-1 text-xs">
                  {cancelledCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Pendentes
                <Badge variant="outline" className="ml-1 text-xs">
                  {pendingCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="others" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Outros
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="search" 
                  placeholder="Buscar por exame, status..." 
                  value={filters.searchTerm} 
                  onChange={handleSearchChange} 
                  className="pl-9" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <DatePickerWithRange 
                enableRange={true} 
                enableDateFilter={true} 
                onDateChange={handleDateChange} 
                setEnableDateFilter={(enable) => 
                  setFilters((prev) => ({ ...prev, isDateFilterEnabled: enable }))
                } 
                placeholderText="Selecionar período" 
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Combobox 
                data={statusOptions} 
                displayKey="label" 
                onSelect={(item) => handleStatusChange(item?.value || null)} 
                selectedValue={statusOptions.find((opt) => opt.value === filters.statusFilter) || null} 
                placeholder="Filtrar por status" 
                clearLabel="Limpar" 
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Exame</Label>
              <Combobox 
                data={exams} 
                displayKey="nome" 
                onSelect={handleExamSelect} 
                selectedValue={filters.selectedExam} 
                placeholder="Selecionar exame" 
                clearLabel="Limpar" 
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredExams.length}</span> de{" "}
              <span className="font-medium">{totalCount}</span> exames encontrados
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={clearAllFilters} 
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" /> 
                Limpar Todos Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> 
              {activeTab === "completed" ? "Exames Concluídos" :
               activeTab === "cancelled" ? "Exames Cancelados" :
               activeTab === "pending" ? "Exames Pendentes" :
               activeTab === "others" ? "Outros Exames" :
               "Todos os Exames"}
            </span>
            <Badge variant="secondary" className="text-sm">
              {filteredExams.length} resultado(s)
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {filteredExams.length > 0 ? (
            <div className="space-y-4">
              {filteredExams.map((exam) => (
                <Card key={exam.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Informações do Exame */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {exam.Tipo_Exame.nome}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {exam.Tipo_Exame.descricao || "Sem descrição disponível"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(exam.status)}
                            {getPaymentBadge(exam.status_pagamento)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-500">Data</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <CalendarDays className="w-3 h-3 text-gray-500" />
                              <span className="font-medium">
                                {format(new Date(exam.data_agendamento), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-gray-500">Hora</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="font-medium">{exam.hora_agendamento}</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-gray-500">Valor</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <DollarSign className="w-3 h-3 text-gray-500" />
                              <span className="font-medium text-green-600">
                                {new Intl.NumberFormat("pt-AO", {
                                  style: "currency",
                                  currency: "AOA"
                                }).format(exam.Tipo_Exame.preco)}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-gray-500">ID Agendamento</Label>
                            <Badge variant="outline" className="mt-1">
                              #{exam.Agendamento?.id || "N/A"}
                            </Badge>
                          </div>
                        </div>
                        
                        {exam.observacoes && (
                          <div>
                            <Label className="text-xs text-gray-500">Observações</Label>
                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded border">
                              {exam.observacoes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Informações do Agendamento */}
                      <div className="space-y-3 border-l lg:border-l-0 lg:border-t lg:pt-4 lg:col-span-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Informações do Agendamento</Label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-500">Unidade de Saúde</Label>
                            <p className="text-sm font-medium">
                              {exam.Agendamento?.id_unidade_de_saude 
                                ? `Unidade #${exam.Agendamento.id_unidade_de_saude}`
                                : "Não informada"}
                            </p>
                          </div>
                          
                          {exam.id_tecnico_alocado && (
                            <div>
                              <Label className="text-xs text-gray-500">Técnico Alocado</Label>
                              <p className="text-sm font-medium">
                                {exam.id_tecnico_alocado}
                              </p>
                            </div>
                          )}
                          
                          {exam.Agendamento?.id_chefe_alocado && (
                            <div>
                              <Label className="text-xs text-gray-500">Chefe Alocado</Label>
                              <p className="text-sm font-medium">
                                {exam.Agendamento.id_chefe_alocado}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Aqui você pode abrir um modal com mais detalhes
                              console.log("Ver mais detalhes do exame:", exam.id);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Detalhes Completos
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Nenhum exame encontrado</p>
              <p className="text-gray-500 text-sm mt-2">
                {activeTab !== "all" 
                  ? `Não há exames ${activeTab === "completed" ? "concluídos" : activeTab === "cancelled" ? "cancelados" : "pendentes"} para este paciente`
                  : "Ajuste os filtros para encontrar os exames desejados"}
              </p>
              {activeTab !== "all" && (
                <Button 
                  variant="link" 
                  onClick={() => setActiveTab("all")}
                  className="mt-4"
                >
                  Ver todos os exames
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </View.Vertical>
  );
}