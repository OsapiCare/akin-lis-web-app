"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, RefreshCw, Calendar, Search, Grid3X3, List, Eye, FileText, DollarSign, CreditCard, Users, ChevronRight, MoreHorizontal, CalendarDays, Activity, BarChart3, Filter, Download, UserCheck, TrendingUp, CheckCircle, Stethoscope, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useCompletedSchedules } from "@/hooks/useCompletedSchedules";
import { useCompletedScheduleFilters } from "@/hooks/useCompletedScheduleFilters";
import { CompletedScheduleDetailsModal } from "@/components/schedule/CompletedScheduleDetailsModal";
import { CompletedScheduleStats } from "@/components/schedule/CompletedScheduleStats";

/* ---------------- HELPERS ---------------- */

const getExamStatuses = (exams: any[], maxVisible = 2) => {
  if (!exams || exams.length === 0) return [{ label: "Concluído", color: "emerald" }];

  const activeExams = exams.filter((exam) => exam.status !== "CONCLUIDO");

  if (activeExams.length === 0) {
    return [{ label: "Concluído", color: "emerald" }];
  }

  return activeExams.slice(0, maxVisible).map((exam) => {
    switch (exam.status) {
      case "PENDENTE":
        return { label: "Pendente", color: "amber" };
      case "EM_ANDAMENTO":
        return { label: "Em Andamento", color: "blue" };
      case "POR_REAGENDAR":
        return { label: "Por Reagendar", color: "orange" };
      case "CANCELADO":
        return { label: "Cancelado", color: "rose" };
      default:
        return { label: exam.status, color: "slate" };
    }
  });
};

const getPaymentStatus = (exams: any[]) => {
  if (!exams || exams.length === 0) return { label: "N/A", color: "slate" };

  const hasPendingPayment = exams.some((exam) => exam.status_pagamento === "PENDENTE");

  return hasPendingPayment ? { label: "Pendente", color: "amber" } : { label: "Pago", color: "emerald" };
};

const calculateTotalValue = (exams: any[]) => {
  if (!exams || exams.length === 0) return 0;
  return exams.reduce((sum, exam) => sum + (exam.Tipo_Exame?.preco || 0), 0);
};

const getPatientInitials = (name: string = "") => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getPatientAge = (birthDate: string) => {
  if (!birthDate) return "";
  const birth = new Date(birthDate);
  const today = new Date();
  const diff = today.getTime() - birth.getTime();
  const ageYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  if (ageYears > 0) return `${ageYears} ano${ageYears > 1 ? "s" : ""}`;
  const ageMonths = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (ageMonths > 0) return `${ageMonths} mês${ageMonths > 1 ? "es" : ""}`;
  const ageDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${ageDays} dia${ageDays > 1 ? "s" : ""}`;
};

/* ---------------- PAGE ---------------- */

export default function CompletedSchedulesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showStats, setShowStats] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { schedules, statistics, isLoading, isError, refetch, isRefetching } = useCompletedSchedules();

  const uniqueSchedules = useMemo(() => {
    const map = new Map<number, any>();
    schedules.forEach((s) => map.set(s.id, s));
    return Array.from(map.values());
  }, [schedules]);

  const { filteredSchedules, handleSearch, filters, clearFilters } = useCompletedScheduleFilters(uniqueSchedules);

  const filteredCount = filteredSchedules.length;
  const totalCount = statistics?.totalSchedules ?? 0;

  const handleViewDetails = (schedule: any) => {
    setSelectedSchedule(schedule);
  };

  const handleCloseDetailsModal = () => {
    setSelectedSchedule(null);
  };

  const handleViewReport = (schedule: any) => {
    console.log("Gerar relatório para:", schedule.id);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSchedules(filteredSchedules.map((s) => s.id));
    } else {
      setSelectedSchedules([]);
    }
  };

  const handleSelectSchedule = (scheduleId: number, checked: boolean) => {
    if (checked) {
      setSelectedSchedules((prev) => [...prev, scheduleId]);
    } else {
      setSelectedSchedules((prev) => prev.filter((id) => id !== scheduleId));
    }
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50 shadow-xl">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Erro ao carregar dados</h3>
                  <p className="text-gray-600 mt-1">Não foi possível carregar os agendamentos. Verifique sua conexão.</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-akin-turquoise to-akin-turquoise rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Gestão de Agendamentos</h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Controle completo de exames e consultas em tempo real</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-sm px-4 py-2 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
            </Badge>

            <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              {showStats ? "Ocultar" : "Mostrar"} Estatísticas
            </Button>

            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
          <Input placeholder="Buscar por paciente, exame ou status..." className="pl-11 h-11 text-base border-1 border bg-white/90  rounded-xl focus:border-blue-500 focus:ring-0 transition-all" value={filters.searchQuery} onChange={(e) => handleSearch(e.target.value)} />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Badge variant="secondary" className="px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200">
              {filteredCount} resultados
            </Badge>
          </div>
        </div>

        {/* FILTERS ROW */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm mb-2 block">Tipo de Serviço</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  <SelectItem value="exams">Apenas exames</SelectItem>
                  <SelectItem value="consultations">Apenas consultas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Todos status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-end">
            <Button variant="ghost" onClick={() => clearFilters} className="border-gray-200">
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 bg-gradient-to-br from-white to-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Total de Agendamentos</CardTitle>
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{statistics?.totalSchedules || 0}</span>
                  <span className="text-sm text-gray-500">registros</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-white to-emerald-50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Exames Realizados</CardTitle>
                <div className="p-2.5 bg-emerald-100 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{statistics?.totalExams || 0}</span>
                  <span className="text-sm text-gray-500">exames</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-white to-amber-50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Receita Total</CardTitle>
                <div className="p-2.5 bg-amber-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {new Intl.NumberFormat("pt-AO", {
                      style: "currency",
                      currency: "AOA",
                      notation: "compact",
                    }).format(statistics?.totalRevenue || 0)}
                  </span>
                  <span className="text-sm text-gray-500">receita</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-white to-purple-50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Taxa de Conclusão</CardTitle>
                <div className="p-2.5 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{statistics?.totalExams && statistics?.completedExams ? `${((statistics.completedExams / statistics.totalExams) * 100).toFixed(1)}%` : "0%"}</span>
                  <span className="text-sm text-gray-500">concluídos</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showStats && statistics && <CompletedScheduleStats statistics={statistics} />}

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs value={viewMode}>
            <TabsList className="bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="grid" onClick={() => setViewMode("grid")} className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2">
                <Grid3X3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Visualização em Cards</span>
                <span className="sm:hidden">Cards</span>
              </TabsTrigger>
              <TabsTrigger value="list" onClick={() => setViewMode("list")} className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2">
                <List className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Visualização em Lista</span>
                <span className="sm:hidden">Lista</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            {selectedSchedules.length > 0 && (
              <>
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedSchedules.length} selecionados
                </Badge>
                <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar ({selectedSchedules.length})
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={() => clearFilters()} className="border-gray-200 hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>

        <Separator />

        {/* CONTENT */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shadow-lg">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Nenhum agendamento encontrado</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{uniqueSchedules.length === 0 ? "Não há agendamentos disponíveis no momento. Comece criando um novo agendamento." : "Tente ajustar os filtros ou a busca para encontrar o que procura."}</p>
              {filters.searchQuery && (
                <Button variant="outline" onClick={() => handleSearch("")} className="border-gray-200 hover:bg-gray-50">
                  Limpar busca
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((schedule) => {
              const exams = schedule.Exame || [];
              const paymentStatus = getPaymentStatus(exams);
              const examStatuses = getExamStatuses(exams);
              const totalValue = calculateTotalValue(exams);
              const hasAllocatedChief = !!schedule.id_chefe_alocado;
              const status_pagamento = schedule.status_pagamento;
              console.log("Estado do pagamento: ", status_pagamento);

              return (
                <Card key={schedule.id} className="group border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1 cursor-pointer" onClick={() => handleViewDetails(schedule)}>
                  <CardContent className="p-0">
                    {/* Header do Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-white p-5 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-akin-turquoise flex items-center justify-center shadow-lg">
                              <span className="text-sm font-bold text-white">{getPatientInitials(schedule.Paciente?.nome_completo || "")}</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-white flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-base">{schedule.Paciente?.nome_completo || "Paciente"}</h4>
                            <p className="text-sm text-gray-500 mt-1">{schedule.Paciente?.numero_identificacao || "Sem identificação"}</p>
                            <h4 className="text-gray-500 text-sm">{getPatientAge(schedule.Paciente?.data_nascimento ?? "Data não informada!") || "N/A"}</h4>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-5 space-y-4">
                      {/* Status dos Exames */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-600">Status dos Exames</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {examStatuses.map((status, index) => (
                            <Badge
                              key={index}
                              className={`
                                text-xs px-3 py-1 rounded-lg
                                ${status.color === "emerald" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                                ${status.color === "amber" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                                ${status.color === "blue" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                                ${status.color === "orange" ? "bg-orange-50 text-orange-700 border-orange-200" : ""}
                                ${status.color === "rose" ? "bg-rose-50 text-rose-700 border-rose-200" : ""}
                                ${status.color === "slate" ? "bg-gray-50 text-gray-700 border-gray-200" : ""}
                              `}
                            >
                              {status.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Informações Rápidas */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500">Data do Agend...</span>
                          <p className="text-sm font-semibold text-gray-900">{`${format(new Date(schedule.criado_aos), "dd/MM/yyyy  - HH:mm", { locale: ptBR })}`} </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Pagamento</p>
                          <Badge
                            className={`
                              text-xs px-3 py-1 rounded-lg
                              ${schedule.status_pagamento === "PAGO" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                              ${schedule.status_pagamento === "PENDENTE" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                              ${schedule.status_pagamento === "CANCELADO" ? "bg-red-50 text-red-700 border-red-200" : ""}
                              ${schedule.status_pagamento === "NAO_PAGO" ? "bg-red-100 text-red-800 border-red-300" : ""}
                              ${schedule.status_pagamento === "ISENTO" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}
                            `}
                          >
                            {schedule.status_pagamento === "NAO_PAGO" ? "Não Efetuado" : schedule.status_pagamento}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500">Valor Total</span>
                          <p className="text-sm font-bold text-emerald-600">
                            {new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA",
                            }).format(totalValue)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Chefe</p>
                          <Badge
                            className={`
                              text-xs px-3 py-1 rounded-lg
                              ${hasAllocatedChief ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-gray-50 text-gray-700 border-gray-200"}
                            `}
                          >
                            {hasAllocatedChief ? "Alocado" : "Não alocado"}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Sexo</p>
                          <p className={`text-sm font-semibold text-gray-900`}>{schedule.Paciente?.sexo?.nome || "Não definido"}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Contacto</p>
                          <p
                            className={`text-sm font-semibold text-gray-900`}
                          >
                            {schedule.Paciente.contacto_telefonico || "Não informado"}
                          </p>
                        </div>
                      </div>

                      {/* Footer com Ação */}
                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-gray-200 hover:bg-gray-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(schedule);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes Completos
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          // LIST VIEW
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="text-left p-4">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={selectedSchedules.length === filteredSchedules.length && filteredSchedules.length > 0} onChange={(e) => handleSelectAll(e.target.checked)} className="rounded border-gray-300" />
                        </div>
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Paciente</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Data</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Pagamento</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Valor</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Chefe</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSchedules.map((schedule) => {
                      const exams = schedule.Exame || [];
                      const paymentStatus = getPaymentStatus(exams);
                      const examStatuses = getExamStatuses(exams, 1);
                      const totalValue = calculateTotalValue(exams);
                      const hasAllocatedChief = !!schedule.id_chefe_alocado;
                      const creationDate = schedule.criado_aos ? format(new Date(schedule.criado_aos), "dd/MM/yyyy", { locale: ptBR }) : "N/A";

                      return (
                        <tr key={schedule.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="p-4">
                            <input type="checkbox" checked={selectedSchedules.includes(schedule.id)} onChange={(e) => handleSelectSchedule(schedule.id, e.target.checked)} className="rounded border-gray-300" onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow">
                                <span className="text-sm font-bold text-white">{getPatientInitials(schedule.Paciente?.nome_completo || "")}</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{schedule.Paciente?.nome_completo || "Paciente"}</div>
                                <div className="text-sm text-gray-500">{schedule.Paciente?.numero_identificacao || "Sem identificação"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">{creationDate}</div>
                              {schedule.criado_aos && <div className="text-xs text-gray-500">{format(new Date(schedule.criado_aos), "HH:mm")}</div>}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {examStatuses.map((status, index) => (
                                <Badge
                                  key={index}
                                  className={`
                                    text-xs px-2 py-1
                                    ${status.color === "emerald" ? "bg-emerald-50 text-emerald-700" : ""}
                                    ${status.color === "amber" ? "bg-amber-50 text-amber-700" : ""}
                                    ${status.color === "blue" ? "bg-blue-50 text-blue-700" : ""}
                                  `}
                                >
                                  {status.label}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={`
                                text-xs px-3 py-1
                                ${paymentStatus.color === "emerald" ? "bg-emerald-50 text-emerald-700" : ""}
                                ${paymentStatus.color === "amber" ? "bg-amber-50 text-amber-700" : ""}
                              `}
                            >
                              {paymentStatus.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-bold text-emerald-600">
                              {new Intl.NumberFormat("pt-AO", {
                                style: "currency",
                                currency: "AOA",
                              }).format(totalValue)}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={`
                                text-xs px-3 py-1
                                ${hasAllocatedChief ? "bg-purple-50 text-purple-700" : "bg-gray-50 text-gray-700"}
                              `}
                            >
                              {hasAllocatedChief ? "Alocado" : "Não alocado"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleViewDetails(schedule)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewReport(schedule)}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Gerar Relatório
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Exportar Dados
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
            </CardContent>
          </Card>
        )}

        {/* MOBILE VIEW */}
        <div className="block md:hidden">
          <div className="space-y-4">
            {filteredSchedules.map((schedule) => {
              const exams = schedule.Exame || [];
              const paymentStatus = getPaymentStatus(exams);
              const examStatuses = getExamStatuses(exams);
              const totalValue = calculateTotalValue(exams);
              const hasAllocatedChief = !!schedule.id_chefe_alocado;
              const creationDate = schedule.criado_aos ? format(new Date(schedule.criado_aos), "dd/MM/yyyy", { locale: ptBR }) : "N/A";

              return (
                <Card key={schedule.id} className="border-0 bg-white shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-blue-50 to-white p-5 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow">
                            <span className="text-sm font-bold text-white">{getPatientInitials(schedule.Paciente?.nome_completo || "")}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{schedule.Paciente?.nome_completo}</h4>
                            <p className="text-sm text-gray-500">{schedule.Paciente?.numero_identificacao || "Sem identificação"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Data de Criação</Label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{creationDate}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Status Pagamento</Label>
                          <div className="mt-1">
                            <Badge
                              className={`
                                text-xs
                                ${paymentStatus.color === "emerald" ? "bg-emerald-50 text-emerald-700" : ""}
                                ${paymentStatus.color === "amber" ? "bg-amber-50 text-amber-700" : ""}
                              `}
                            >
                              {paymentStatus.label}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Valor Total</Label>
                          <p className="text-sm font-bold text-emerald-600 mt-1">
                            {new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA",
                            }).format(totalValue)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Chefe</Label>
                          <div className="mt-1">
                            <Badge
                              className={`
                                text-xs
                                ${hasAllocatedChief ? "bg-purple-50 text-purple-700" : "bg-gray-50 text-gray-700"}
                              `}
                            >
                              {hasAllocatedChief ? "Alocado" : "Não alocado"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-500 mb-2">Status dos Exames</Label>
                        <div className="flex flex-wrap gap-2">
                          {examStatuses.map((status, index) => (
                            <Badge
                              key={index}
                              className={`
                                text-xs
                                ${status.color === "emerald" ? "bg-emerald-50 text-emerald-700" : ""}
                                ${status.color === "amber" ? "bg-amber-50 text-amber-700" : ""}
                                ${status.color === "blue" ? "bg-blue-50 text-blue-700" : ""}
                              `}
                            >
                              {status.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                        <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50" onClick={() => handleViewDetails(schedule)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                        <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" onClick={() => handleViewReport(schedule)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Relatório
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <CompletedScheduleDetailsModal schedule={selectedSchedule} isOpen={!!selectedSchedule} onClose={handleCloseDetailsModal} />
    </div>
  );
}
