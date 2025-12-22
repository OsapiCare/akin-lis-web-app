"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Grid3X3, List, RefreshCw, Calendar, AlertTriangle, CheckCircle, FileText, TrendingUp, MoreHorizontal, Eye, User, CreditCard, DollarSign, CalendarDays, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { CompletedScheduleCard } from "@/components/schedule/CompletedScheduleCard";
import { CompletedScheduleFilters } from "@/components/schedule/CompletedScheduleFilters";
import { CompletedScheduleStats } from "@/components/schedule/CompletedScheduleStats";
import { CompletedScheduleDetailsModal } from "@/components/schedule/CompletedScheduleDetailsModal";

import { useCompletedSchedules } from "@/hooks/useCompletedSchedules";
import { useCompletedScheduleFilters } from "@/hooks/useCompletedScheduleFilters";

import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Helper para obter status dos exames
const getExamStatuses = (exams: any[], maxVisible = 2) => {
  if (!exams || exams.length === 0) return [];

  // Filtra apenas exames ativos (não concluídos)
  const activeExams = exams.filter((exam) => exam.status !== "CONCLUIDO");

  if (activeExams.length === 0) {
    return [{ label: "Concluído", color: "green" }];
  }

  return activeExams.slice(0, maxVisible).map((exam) => {
    switch (exam.status) {
      case "PENDENTE":
        return { label: "Pendente", color: "yellow" };
      case "EM_ANDAMENTO":
        return { label: "Em Andamento", color: "blue" };
      case "POR_REAGENDAR":
        return { label: "Por Reagendar", color: "orange" };
      case "CANCELADO":
        return { label: "Cancelado", color: "red" };
      default:
        return { label: exam.status, color: "gray" };
    }
  });
};

// Helper para verificar status de pagamento do bloco
const getPaymentStatus = (exams: any[]) => {
  if (!exams || exams.length === 0) return { status: "N/A", color: "gray" };

  // Se pelo menos um exame está pendente, o bloco está pendente (regra única de fatura)
  const hasPendingPayment = exams.some((exam) => exam.status_pagamento === "PENDENTE");

  return hasPendingPayment ? { status: "Pendente", color: "yellow" } : { status: "Pago", color: "green" };
};

// Helper para calcular valor total do bloco
const calculateTotalValue = (exams: any[]) => {
  if (!exams || exams.length === 0) return 0;
  return exams.reduce((sum, exam) => sum + (exam.Tipo_Exame?.preco || 0), 0);
};

// Helper para verificar se um agendamento deve ser exibido
const shouldDisplaySchedule = (schedule: CompletedScheduleType): boolean => {
  const exams = schedule.Exame || [];
  if (exams.length === 0) return true; // Mostrar se não há exames
  
  // Verifica se todos os exames estão concluídos
  const allExamsCompleted = exams.every(exam => exam.status === "CONCLUIDO");
  
  // Verifica se todos os exames estão cancelados
  const allExamsCancelled = exams.every(exam => exam.status === "CANCELADO");
  
  // Mostra TODOS os agendamentos, incluindo concluídos e cancelados
  // Se quiser ocultar os concluídos, mude para: return !allExamsCompleted && !allExamsCancelled;
  return true; // Mostra tudo
};

export default function CompletedSchedulesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showStats, setShowStats] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<CompletedScheduleType | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);

  const { schedules, statistics, isLoading, isError, refetch, isRefetching } = useCompletedSchedules();

  const uniqueSchedules = useMemo(() => {
    const map = new Map<number, CompletedScheduleType>();
    schedules.forEach((s) => map.set(s.id, s));
    return Array.from(map.values());
  }, [schedules]);

  // Filtra os agendamentos que devem ser exibidos (incluindo concluídos e cancelados)
  const displayableSchedules = useMemo(() => {
    return uniqueSchedules.filter(shouldDisplaySchedule);
  }, [uniqueSchedules]);

  const { filteredSchedules, filters, handleSearch, handleFilterChange, clearFilters } = useCompletedScheduleFilters(displayableSchedules);

  const totalCount = statistics?.totalSchedules ?? 0;
  const filteredCount = filteredSchedules.length;

  const handleSelectAll = (checked: boolean) => {
    setSelectedSchedules(checked ? filteredSchedules.map((s) => s.id) : []);
  };

  const handleSelectSchedule = (scheduleId: number, checked: boolean) => {
    setSelectedSchedules((prev) => (checked ? [...prev, scheduleId] : prev.filter((id) => id !== scheduleId)));
  };

  const handleViewDetails = (schedule: CompletedScheduleType) => {
    setSelectedSchedule(schedule);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedSchedule(null);
    setIsDetailsModalOpen(false);
  };

  const handleViewReport = (schedule: CompletedScheduleType) => {
    console.log("View report for schedule:", schedule.id);
  };

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar agendamentos. Verifique sua conexão ou contate o suporte.
            <Button variant="link" onClick={() => refetch()} className="ml-2 p-0">
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Agendamentos</h1>
          <p className="text-gray-600 mt-1">Visualize e gerencie todos os agendamentos pendentes e em andamento.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
          </Badge>

          <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
            <CheckCircle className="w-4 h-4 mr-2" />
            {showStats ? "Ocultar" : "Mostrar"} Estatísticas
          </Button>

          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-gray-900">{isLoading ? <Skeleton className="h-8 w-16" /> : statistics.totalSchedules}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Exames</CardTitle>
            <FileText className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-gray-900">{isLoading ? <Skeleton className="h-8 w-16" /> : statistics.totalExams}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              new Intl.NumberFormat("pt-AO", {
                style: "currency",
                currency: "AOA",
                notation: "compact",
              }).format(statistics.totalRevenue)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progresso dos Exames</CardTitle>
            <CheckCircle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : `${statistics.totalExams > 0 ? ((statistics.completedExams / statistics.totalExams) * 100).toFixed(1) : 0}%`}</CardContent>
        </Card>
      </div>

      {showStats && <CompletedScheduleStats statistics={statistics} />}

      <CompletedScheduleFilters onSearch={handleSearch} onFilterChange={handleFilterChange} onClearFilters={clearFilters} filters={filters} totalSchedules={totalCount} filteredCount={filteredCount} />

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="grid">
              <Grid3X3 className="w-4 h-4 mr-2" /> Cards
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="w-4 h-4 mr-2" /> Lista
            </TabsTrigger>
          </TabsList>
          <div className="text-sm text-gray-600">
            {filteredCount} de {displayableSchedules.length} agendamentos
          </div>
        </div>

        <Separator className="my-4" />

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum agendamento encontrado</h3>
            <p className="text-gray-600 mt-2">{displayableSchedules.length === 0 ? "Não há agendamentos disponíveis." : "Ajuste os filtros ou tente novamente."}</p>
            {filters.searchQuery && (
              <Button variant="outline" className="mt-4" onClick={() => handleSearch("")}>
                Limpar busca
              </Button>
            )}
          </Card>
        ) : (
          <>
            <TabsContent value="grid">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchedules.map((schedule) => (
                  <CompletedScheduleCard key={schedule.id} schedule={schedule} onViewDetails={handleViewDetails} onViewReport={handleViewReport} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="border px-2 mx-8 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr className="w-full">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Paciente
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            Data de Criação
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Status dos Exames
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            Pagamento
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Valor a Pagar
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Chefe Alocado
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSchedules.map((schedule) => {
                        // 1. Data de criação do agendamento (coluna vermelha)
                        const creationDate = schedule.criado_aos ? format(new Date(schedule.criado_aos), "dd/MM/yyyy", { locale: ptBR }) : "N/A";

                        // 2. Status individuais dos exames (coluna amarela)
                        const examStatuses = getExamStatuses(schedule.Exame || []);
                        const hasMoreStatuses = (schedule.Exame?.filter((e) => e.status !== "CONCLUIDO").length || 0) > 2;

                        // 3. Status de pagamento do bloco (coluna azul)
                        const paymentStatus = getPaymentStatus(schedule.Exame || []);

                        // 4. Valor total do bloco (coluna verde)
                        const totalValue = calculateTotalValue(schedule.Exame || []);

                        // 5. Chefe de laboratório alocado (coluna rosa)
                        const hasAllocatedChief = !!schedule.id_chefe_alocado;

                        return (
                          <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                            {/* Paciente */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                  <span className="text-xs font-medium text-blue-600">
                                    {(schedule.Paciente?.nome_completo || "")
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{schedule.Paciente?.nome_completo || "N/A"}</div>
                                  <div className="text-xs text-gray-500">{schedule.Paciente?.numero_identificacao || "Sem BI"}</div>
                                </div>
                              </div>
                            </td>

                            {/* Data de Criação (Vermelha) */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">{creationDate}</div>
                              {schedule.criado_aos && <div className="text-xs text-gray-500">{format(new Date(schedule.criado_aos), "HH:mm", { locale: ptBR })}</div>}
                            </td>

                            {/* Status dos Exames (Amarela) */}
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {examStatuses.map((status, index) => (
                                  <Badge key={index} variant="outline" className={`text-xs px-2 py-0.5 border-${status.color}-200 bg-${status.color}-50 text-${status.color}-700`}>
                                    {status.label}
                                  </Badge>
                                ))}
                                {hasMoreStatuses && (
                                  <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-200 bg-gray-50 text-gray-600">
                                    +Ver mais
                                  </Badge>
                                )}
                                {examStatuses.length === 0 && <span className="text-xs text-gray-500">Nenhum exame ativo</span>}
                              </div>
                            </td>

                            {/* Status de Pagamento (Azul) */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge variant="outline" className={`text-xs px-3 py-1 border-${paymentStatus.color}-200 bg-${paymentStatus.color}-50 text-${paymentStatus.color}-700`}>
                                {paymentStatus.status}
                              </Badge>
                            </td>

                            {/* Valor a Pagar (Verde) */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-green-700">
                                {new Intl.NumberFormat("pt-AO", {
                                  style: "currency",
                                  currency: "AOA",
                                }).format(totalValue)}
                              </div>
                            </td>

                            {/* Chefe Alocado (Rosa) */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge variant="outline" className={`text-xs px-3 py-1 ${hasAllocatedChief ? "border-pink-200 bg-pink-50 text-pink-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                                {hasAllocatedChief ? "Alocado" : "Não alocado"}
                              </Badge>
                            </td>

                            {/* Ações */}
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => handleViewDetails(schedule)} className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalhes
                                  </DropdownMenuItem>

                                  <DropdownMenuItem onClick={() => handleViewReport(schedule)} className="cursor-pointer">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Gerar Relatório
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Responsive Mobile View */}
              <div className="block md:hidden mt-4">
                <div className="space-y-4">
                  {filteredSchedules.map((schedule) => {
                    const examStatuses = getExamStatuses(schedule.Exame || []);
                    const paymentStatus = getPaymentStatus(schedule.Exame || []);
                    const totalValue = calculateTotalValue(schedule.Exame || []);
                    const hasAllocatedChief = !!schedule.id_chefe_alocado;
                    const creationDate = schedule.criado_aos ? format(new Date(schedule.criado_aos), "dd/MM/yyyy", { locale: ptBR }) : "N/A";

                    return (
                      <Card key={schedule.id} className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {(schedule.Paciente?.nome_completo || "")
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{schedule.Paciente?.nome_completo}</h4>
                                <p className="text-sm text-gray-500">{schedule.Paciente?.numero_identificacao || "Sem BI"}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(schedule)}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Informações */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-gray-500">Data de Criação</Label>
                              <p className="text-sm font-medium">{creationDate}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Pagamento</Label>
                              <Badge variant="outline" className={`text-xs mt-1 ${paymentStatus.status === "Pago" ? "border-green-200 bg-green-50 text-green-700" : "border-yellow-200 bg-yellow-50 text-yellow-700"}`}>
                                {paymentStatus.status}
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Valor</Label>
                              <p className="text-sm font-semibold text-green-700">
                                {new Intl.NumberFormat("pt-AO", {
                                  style: "currency",
                                  currency: "AOA",
                                }).format(totalValue)}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Chefe</Label>
                              <Badge variant="outline" className={`text-xs mt-1 ${hasAllocatedChief ? "border-pink-200 bg-pink-50 text-pink-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                                {hasAllocatedChief ? "Alocado" : "Não alocado"}
                              </Badge>
                            </div>
                          </div>

                          {/* Status dos Exames */}
                          <div>
                            <Label className="text-xs text-gray-500 mb-2">Status dos Exames</Label>
                            <div className="flex flex-wrap gap-1">
                              {examStatuses.map((status, index) => (
                                <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                                  {status.label}
                                </Badge>
                              ))}
                              {(schedule.Exame?.filter((e) => e.status !== "CONCLUIDO").length || 0) > 2 && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  +Ver mais
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Botão de Ações */}
                          <div className="flex justify-end pt-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(schedule)}>
                              <Eye className="h-3 w-3 mr-1" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      <CompletedScheduleDetailsModal schedule={selectedSchedule} isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} />
    </div>
  );
}

// Componente Label para mobile view
const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <div className={`text-xs font-medium text-gray-600 ${className}`}>{children}</div>;