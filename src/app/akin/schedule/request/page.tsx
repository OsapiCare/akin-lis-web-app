"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Grid3X3, List, RefreshCw, Calendar, Users, Clock, AlertTriangle, CheckCircle, TrendingUp, BarChart3, AlertCircle, XCircle, Stethoscope, UserCheck } from "lucide-react";
import { consultaRoutes, scheduleRoutes } from "@/Api/Routes/schedule/index.routes";
import { AllPendingSchedules, PendingScheduleCard } from "@/components/schedule/PendingScheduleCard";
import { ConsultaFilters, ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { ScheduleStats } from "@/components/schedule/ScheduleStats";
import { BulkActions } from "@/components/schedule/BulkActions";
import { useConsultaFilters, useScheduleFilters } from "@/hooks/useScheduleFilters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { _axios } from "@/Api/axios.config";

// Função para converter ScheduleType para CompletedScheduleType (com valores padrão)
const convertToCompletedSchedule = (schedule: ScheduleType): CompletedScheduleType => {
  return {
    ...schedule,
    status_pagamento: schedule.status_pagamento || "NAO_PAGO",
    Paciente: schedule.Paciente && {
      ...schedule.Paciente,
      sexo: schedule.Paciente.sexo && {
        ...schedule.Paciente.sexo,
        id: Number(schedule.Paciente.sexo.id), // Convert string to number
      },
    },
  } as unknown as CompletedScheduleType;
};

const convertToCompletedConsulta = (consulta: ConsultasType): CompletedConsultaType => {
  return {
    ...consulta,
    status_financeiro: consulta.status_financeiro || "ISENTO",
    Paciente: consulta.Paciente && {
      ...consulta.Paciente,
      sexo: consulta.Paciente.sexo && {
        ...consulta.Paciente.sexo,
        id: Number(consulta.Paciente.sexo.id),
      },
    },
  } as unknown as CompletedConsultaType;
};

export default function Request() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const {
    data: schedules = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["pending-schedules"],
    queryFn: () => scheduleRoutes.getPendingSchedules(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const {
    data: consultas = [],
    isLoadingError,
    isFetched,
  } = useQuery({
    queryKey: ["pending-consultas"],
    queryFn: () => consultaRoutes.getPendingConsultas(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });


  const completedSchedules: CompletedScheduleType[] = schedules.map(convertToCompletedSchedule);
  const completedConsultas: CompletedConsultaType[] = Array.isArray(consultas) ? consultas.map(convertToCompletedConsulta) : [];

  const { filteredSchedules: filteredScheduleType, filters, handleSearch, handleFilterChange } = useScheduleFilters(schedules);
  const { filteredConsultas: filteredConsultaType } = useConsultaFilters(consultas);

  const filteredSchedules = filteredScheduleType.map(convertToCompletedSchedule);
  const filteredConsultas = filteredConsultaType.map(convertToCompletedConsulta);

  const { data: pendingSchedule } = useQuery({
    queryKey: ["pending-schedule"],
    queryFn: async () => {
      const response = await _axios.get("/consultations/pending");
      return response.data;
    },
  });

  const consulta = pendingSchedule?.data;
  // Calculate statistics for both exams and consultations
  const totalSchedules = completedSchedules.length;
  const totalExams = completedSchedules.reduce((total, schedule) => total + (schedule.Exame?.length || 0), 0);
  const totalConsultas = completedConsultas?.length || 0;
  const totalRevenue = completedSchedules.reduce((total, schedule) => {
    const examRevenue = schedule.Exame?.reduce((examTotal, exam) => examTotal + (exam.Tipo_Exame?.preco || 0), 0) || 0;
    const consultaRevenue = consulta?.Consulta?.reduce((total: number, consulta: any) => total + (consulta.Tipo_Consulta?.preco || 0), 0) || 0;
    return total + examRevenue + consultaRevenue;
  }, 0);

  // Get today's schedules
  const todaySchedules = completedSchedules.filter((schedule) => {
    const scheduleDate = schedule.Exame?.[0]?.data_agendamento || schedule.Consulta?.[0]?.data_agendamento;
    if (!scheduleDate) return false;
    const date = new Date(scheduleDate);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  });

  const acceptMutation = useMutation({
    mutationFn: (scheduleId: number) => scheduleRoutes.acceptSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-schedules"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ scheduleId }: { scheduleId: number }) => scheduleRoutes.rejectSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-schedules"] });
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedScheduleId(null);
    },
  });

  // Accept a specific schedule by id
  const handleAccept = (scheduleId: number) => {
    acceptMutation.mutate(scheduleId);
  };

  // Open reject dialog for a specific schedule
  const openRejectDialog = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
    setShowRejectDialog(true);
  };

  // Confirm reject for selected schedule
  const handleConfirmReject = () => {
    if (selectedScheduleId && rejectReason.trim()) {
      rejectMutation.mutate({
        scheduleId: selectedScheduleId,
      });
    }
  };

  // Get schedule type badge
  const getScheduleTypeBadge = (schedule: CompletedScheduleType) => {
    const hasExams = schedule.Exame && schedule.Exame.length > 0;
    const hasConsultations = schedule.Consulta && schedule.Consulta.length > 0;

    if (hasExams && hasConsultations) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Stethoscope className="w-3 h-3 mr-1" />
          <UserCheck className="w-3 h-3 mr-1" />
          Exames + Consultas
        </Badge>
      );
    } else if (hasExams) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Stethoscope className="w-3 h-3 mr-1" />
          Exames
        </Badge>
      );
    } else if (hasConsultations) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <UserCheck className="w-3 h-3 mr-1" />
          Consultas
        </Badge>
      );
    }
    return null;
  };

  // Get date from schedule (prioritizes first exam or consultation)
  const getScheduleDate = (schedule: CompletedScheduleType) => {
    if (schedule.Exame?.[0]?.data_agendamento) {
      return new Date(schedule.Exame[0].data_agendamento);
    }
    if (schedule.Consulta?.[0]?.data_agendamento) {
      return new Date(schedule.Consulta[0].data_agendamento);
    }
    return new Date(schedule.criado_aos);
  };

  // Get time from schedule
  const getScheduleTime = (schedule: CompletedScheduleType) => {
    if (schedule.Exame?.[0]?.hora_agendamento) {
      return schedule.Exame[0].hora_agendamento;
    }
    if (schedule.Consulta?.[0]?.hora_agendamento) {
      return schedule.Consulta[0].hora_agendamento;
    }
    return "";
  };

  // Get total items count
  const getTotalItems = (schedule: CompletedScheduleType) => {
    return (schedule.Exame?.length || 0) + (schedule.Consulta?.length || 0);
  };

  // Get total price
  const getTotalPrice = (schedule: CompletedScheduleType) => {
    const examPrice = schedule.Exame?.reduce((total, exam) => total + (exam.Tipo_Exame?.preco || 0), 0) || 0;
    const consultationPrice = schedule.Consulta?.reduce((total, consult) => total + (consult.id || 0), 0) || 0;
    return examPrice + consultationPrice;
  };

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar agendamentos pendentes.
            <Button variant="link" className="p-0 h-auto ml-2" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos Pendentes</h1>
          <p className="text-gray-600 mt-1">Gerencie e processe agendamentos que aguardam aprovação</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
          </Badge>

          <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            {showStats ? "Ocultar" : "Mostrar"} Estatísticas
          </Button>

          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pendentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{isLoading ? <Skeleton className="h-8 w-16" /> : totalSchedules}</div>
            <p className="text-xs text-muted-foreground">agendamentos aguardando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{isLoading ? <Skeleton className="h-8 w-16" /> : todaySchedules.length}</div>
            <p className="text-xs text-muted-foreground">agendamentos para hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Itens Pendentes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? <Skeleton className="h-8 w-16" /> : totalExams + totalConsultas}</div>
            <div className="text-xs text-muted-foreground flex gap-2">
              <span>{totalExams} exames</span>
              <span>•</span>
              <span>{totalConsultas} consultas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Potencial</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                new Intl.NumberFormat("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                  notation: "compact",
                  maximumFractionDigits: 0,
                }).format(totalRevenue)
              )}
            </div>
            <p className="text-xs text-muted-foreground">valor total pendente</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics (conditionally shown) */}
      {showStats && <ScheduleStats schedules={completedSchedules as any} isLoading={isLoading} />}

      {/* Bulk Actions */}
      {!isLoading && filteredSchedules.length > 0 && <BulkActions schedules={completedSchedules as any} selectedSchedules={selectedSchedules} onSelectionChange={setSelectedSchedules} />}

      {/* Filters */}
      <ScheduleFilters onSearch={handleSearch} onFilterChange={handleFilterChange} totalSchedules={totalSchedules} filteredCount={filteredSchedules.length} />
      <ConsultaFilters onSearch={handleSearch} onFilterChange={handleFilterChange} totalConsultas={totalConsultas} filteredCount={filteredConsultas.length} />

      {/* View Toggle and Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          <div className="text-sm text-gray-600">
            {filteredSchedules.length} de {totalSchedules} agendamentos
          </div>
          <div className="text-sm text-gray-600">
            {filteredConsultas.length} de {totalConsultas} agendamentos
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
          <Card className="p-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-gray-600 mb-4">{totalSchedules === 0 ? "Não há agendamentos pendentes no momento." : "Tente ajustar os filtros para encontrar agendamentos."}</p>
              {filters.searchQuery && (
                <Button variant="outline" onClick={() => handleSearch("")}>
                  Limpar busca
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            <TabsContent value="grid" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AllPendingSchedules />
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell">Data</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Itens</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Valor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSchedules.map((schedule) => {
                      const scheduleDate = getScheduleDate(schedule);
                      const scheduleTime = getScheduleTime(schedule);
                      const totalItems = getTotalItems(schedule);
                      const totalPrice = getTotalPrice(schedule);
                      const hasExams = schedule.Exame && schedule.Exame.length > 0;
                      const hasConsultations = schedule.Consulta && schedule.Consulta.length > 0;

                      return (
                        <tr key={schedule.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{schedule.Paciente?.nome_completo?.split(" ")[0] || "Paciente"}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 sm:table-cell">{hasExams && hasConsultations ? "Exames + Consultas" : hasExams ? "Exames" : hasConsultations ? "Consultas" : "N/A"}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 sm:table-cell">
                            {scheduleDate.toLocaleDateString("pt-AO")}
                            {scheduleTime && ` • ${scheduleTime}`}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                            {totalItems} {totalItems === 1 ? "item" : "itens"}
                            {hasExams && ` (${schedule.Exame?.length} ex)`}
                            {hasConsultations && ` (${schedule.Consulta?.length} cons)`}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600 hidden lg:table-cell">
                            {new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA",
                            }).format(totalPrice)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {schedule.status || "Pendente"}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 sm:table-cell">
                            <div className="flex gap-2">
                              <Button onClick={() => handleAccept(schedule.id)} disabled={acceptMutation.isPending} size="sm" className="bg-green-600 hover:bg-green-700 text-white px-3">
                                <CheckCircle className="w-4 h-4" />
                              </Button>

                              <Button variant="destructive" size="sm" onClick={() => openRejectDialog(schedule.id)} disabled={rejectMutation.isPending} className="px-3">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Recusar Agendamento</DialogTitle>
            <DialogDescription>Por favor, forneça um motivo para recusar este agendamento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Motivo da recusa</Label>
              <Textarea id="reject-reason" placeholder="Digite o motivo da recusa..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="mt-2" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
                setSelectedScheduleId(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectReason.trim() || rejectMutation.isPending}>
              {rejectMutation.isPending ? "Recusando..." : "Confirmar Recusa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
