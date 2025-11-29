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
import { Grid3X3, List, RefreshCw, Calendar, Users, Clock, AlertTriangle, CheckCircle, TrendingUp, BarChart3, AlertCircle, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { scheduleRoutes } from "@/Api/Routes/schedule/index.routes";
import { PendingScheduleCard } from "@/components/schedule/PendingScheduleCard";
import { PendingScheduleTable } from "@/components/schedule/PendingScheduleTable";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { ScheduleStats } from "@/components/schedule/ScheduleStats";
import { BulkActions } from "@/components/schedule/BulkActions";
import { useScheduleFilters } from "@/hooks/useScheduleFilters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Request() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Use custom hook for filtering
  const { filteredSchedules, filters, handleSearch, handleFilterChange } = useScheduleFilters(schedules);

  // Calculate statistics
  const totalSchedules = schedules.length;
  const totalExams = schedules.reduce((total, schedule) => total + (schedule.Exame?.length || 0), 0);
  const totalRevenue = schedules.reduce((total, schedule) => total + (schedule.Exame?.reduce((examTotal, exam) => examTotal + (exam.Tipo_Exame?.preco || 0), 0) || 0), 0);

  // Get today's schedules
  const todaySchedules = schedules.filter((schedule) => {
    if (!schedule.Exame || schedule.Exame.length === 0) return false;
    const scheduleDate = new Date(schedule.Exame[0].data_agendamento);
    const today = new Date();
    return scheduleDate.toDateString() === today.toDateString();
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
    },
  });

  // Accept a specific schedule by id
  const handleAccept = (scheduleId: number) => {
    acceptMutation.mutate(scheduleId);
  };

  // Reject a specific schedule by id (uses the current rejectReason)
  const handleReject = (scheduleId: number) => {
    if (rejectReason.trim()) {
      rejectMutation.mutate({ scheduleId });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmado":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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
          <p className="text-gray-600 mt-1 text-wrap">Gerencie e processe agendamentos que aguardam aprovação</p>
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
            <CardTitle className="text-sm font-medium">Total Exames</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? <Skeleton className="h-8 w-16" /> : totalExams}</div>
            <p className="text-xs text-muted-foreground">exames pendentes</p>
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
      {showStats && <ScheduleStats schedules={schedules} isLoading={isLoading} />}

      {/* Bulk Actions */}
      {!isLoading && filteredSchedules.length > 0 && <BulkActions schedules={filteredSchedules} selectedSchedules={selectedSchedules} onSelectionChange={setSelectedSchedules} />}

      {/* Filters */}
      <ScheduleFilters onSearch={handleSearch} onFilterChange={handleFilterChange} totalSchedules={totalSchedules} filteredCount={filteredSchedules.length} />

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
                {filteredSchedules.map((schedule) => (
                  <PendingScheduleCard key={schedule.id} schedule={schedule} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              {/* <div className="w-full min-w-[600px]">
                <PendingScheduleTable schedules={filteredSchedules} />
              </div> */}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell">Data</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Exames</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Valor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{schedule.Paciente?.nome_completo.split(" ")[0]}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 sm:table-cell">{new Date(schedule.Exame[0].data_agendamento).toLocaleDateString("pt-AO")}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{schedule.Exame?.length || 0}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600 hidden lg:table-cell">
                          {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", notation: "compact" }).format(schedule.Exame?.reduce((total, exam) => total + (exam.Tipo_Exame?.preco || 0), 0) || 0)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                           <Badge className={getStatusColor(schedule.status)} variant="outline">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {schedule.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500  sm:table-cell">
                          <div className="flex gap-2 items-center justify-center md:space-x-2">
                            <Button onClick={() => handleAccept(schedule.id)} disabled={acceptMutation.isPending} size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1 flex items-center" />
                              {acceptMutation.isPending ? "..." : ""}
                            </Button>

                            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                              <DialogTrigger asChild className="m-0">
                                <Button variant="destructive" size="sm" disabled={rejectMutation.isPending} className="w-full px-2 py-1 text-xs">
                                  <XCircle className="w-3 h-3 mr-1" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Recusar Agendamento</DialogTitle>
                                  <DialogDescription>Por favor, forneça um motivo para recusar este agendamento de {schedule.Paciente?.nome_completo}.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="reject-reason">Motivo da recusa</Label>
                                    <Textarea id="reject-reason" placeholder="Digite o motivo da recusa..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="mt-2" />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                                    Cancelar
                                  </Button>
                                  <Button variant="destructive" onClick={() => handleReject(schedule.id)} disabled={!rejectReason.trim() || rejectMutation.isPending}>
                                    {rejectMutation.isPending ? "Recusando..." : "Confirmar Recusa"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
