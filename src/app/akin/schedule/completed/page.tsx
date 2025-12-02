"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Grid3X3,
  List,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  TrendingUp,
  MoreHorizontal,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { CompletedScheduleCard } from "@/components/schedule/CompletedScheduleCard";
import { CompletedScheduleFilters } from "@/components/schedule/CompletedScheduleFilters";
import { CompletedScheduleStats } from "@/components/schedule/CompletedScheduleStats";
import { CompletedScheduleDetailsModal } from "@/components/schedule/CompletedScheduleDetailsModal";

import { useCompletedSchedules } from "@/hooks/useCompletedSchedules";
import { useCompletedScheduleFilters } from "@/hooks/useCompletedScheduleFilters";

import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function CompletedSchedulesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showStats, setShowStats] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<CompletedScheduleType | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);

  const { schedules, statistics, isLoading, isError, refetch, isRefetching } =
    useCompletedSchedules();

  const uniqueSchedules = useMemo(() => {
    const map = new Map<number, CompletedScheduleType>();
    schedules.forEach((s) => map.set(s.id, s));
    return Array.from(map.values());
  }, [schedules]);

  const {
    filteredSchedules,
    filters,
    handleSearch,
    handleFilterChange,
    clearFilters
  } = useCompletedScheduleFilters(uniqueSchedules);

  const totalCount = statistics?.totalSchedules ?? 0;
  const filteredCount = filteredSchedules.length;

  const handleSelectAll = (checked: boolean) => {
    setSelectedSchedules(checked ? filteredSchedules.map((s) => s.id) : []);
  };

  const handleSelectSchedule = (scheduleId: number, checked: boolean) => {
    setSelectedSchedules((prev) =>
      checked ? [...prev, scheduleId] : prev.filter((id) => id !== scheduleId)
    );
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
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Agendamentos</h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todos os agendamentos pendentes e em andamento.
          </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-gray-900">
            {isLoading ? <Skeleton className="h-8 w-16" /> : statistics.totalSchedules}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Exames</CardTitle>
            <FileText className="w-6 h-6 text-purple-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-gray-900">
            {isLoading ? <Skeleton className="h-8 w-16" /> : statistics.totalExams}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              new Intl.NumberFormat("pt-AO", {
                style: "currency",
                currency: "AOA",
                notation: "compact"
              }).format(statistics.totalRevenue)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progresso dos Exames</CardTitle>
            <CheckCircle className="w-6 h-6 text-orange-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              `${statistics.totalExams > 0
                ? ((statistics.completedExams / statistics.totalExams) * 100).toFixed(1)
                : 0}%`
            )}
          </CardContent>
        </Card>
      </div>

      {showStats && <CompletedScheduleStats statistics={statistics} />}

      <CompletedScheduleFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        filters={filters}
        totalSchedules={totalCount}
        filteredCount={filteredCount}
      />

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
            {filteredCount} de {totalCount} agendamentos
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
            <p className="text-gray-600 mt-2">
              {statistics.totalSchedules === 0
                ? "Não há agendamentos disponíveis."
                : "Ajuste os filtros ou tente novamente."}
            </p>
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
                  <CompletedScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onViewDetails={handleViewDetails}
                    onViewReport={handleViewReport}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="overflow-x-auto mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="w-12">
                        <Checkbox
                          checked={selectedSchedules.length === filteredSchedules.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th>Paciente</th>
                      <th>Exames</th>
                      <th>Status</th>
                      <th>Pagamento</th>
                      <th>Valor Total</th>
                      <th>Técnico</th>
                      <th className="w-16">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSchedules.map((schedule) => {
                      const totalValue =
                        schedule.Exame?.reduce(
                          (sum, e) => sum + (e.Tipo_Exame?.preco || 0),
                          0
                        ) || 0;

                      const completedExams =
                        schedule.Exame?.filter((e) => e.status === "CONCLUIDO").length || 0;

                      const totalExams = schedule.Exame?.length || 0;

                      const paidExams =
                        schedule.Exame?.filter((e) => e.status_pagamento === "PAGO").length || 0;

                      const hasAllocatedTechnician =
                        schedule.Exame?.some((e) => e.id_tecnico_alocado);

                      return (
                        <tr key={schedule.id}>
                          <td>
                            <Checkbox
                              checked={selectedSchedules.includes(schedule.id)}
                              onCheckedChange={(checked) =>
                                handleSelectSchedule(schedule.id, checked as boolean)
                              }
                            />
                          </td>

                          <td>{schedule.Paciente?.nome_completo}</td>

                          <td>
                            {schedule.Exame?.slice(0, 3).map((exam, i) => (
                              <Badge key={i} variant="outline" className="mr-1 text-xs">
                                {exam.Tipo_Exame?.nome}
                              </Badge>
                            ))}
                            {totalExams > 3 && (
                              <span className="text-blue-600 text-xs">
                                +{totalExams - 3}
                              </span>
                            )}
                          </td>

                          <td>
                            {completedExams}/{totalExams} exames realizados
                          </td>

                          <td>
                            {paidExams}/{totalExams} pagos
                          </td>

                          <td>
                            {new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA"
                            }).format(totalValue)}
                          </td>

                          <td>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                hasAllocatedTechnician
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {hasAllocatedTechnician ? "Alocado" : "Não alocado"}
                            </Badge>
                          </td>

                          <td>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(schedule)}>
                                  <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => handleViewReport(schedule)}>
                                  <FileText className="mr-2 h-4 w-4" /> Gerar Relatório
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
            </TabsContent>
          </>
        )}
      </Tabs>

      <CompletedScheduleDetailsModal
        schedule={selectedSchedule}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
}
