"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  BarChart3,
  FileText,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Components
import { CompletedScheduleCard } from "@/components/schedule/CompletedScheduleCard";
import { CompletedScheduleTable } from "@/components/schedule/CompletedScheduleTable";
import { CompletedScheduleFilters } from "@/components/schedule/CompletedScheduleFilters";
import { CompletedScheduleStats } from "@/components/schedule/CompletedScheduleStats";
import { CompletedScheduleDetailsModal } from "@/components/schedule/CompletedScheduleDetailsModal";

// Hooks
import { useCompletedSchedules } from "@/hooks/useCompletedSchedules";
import { useCompletedScheduleFilters } from "@/hooks/useCompletedScheduleFilters";

export default function CompletedSchedulesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showStats, setShowStats] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<CompletedScheduleType | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch completed schedules
  const {
    schedules,
    statistics,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useCompletedSchedules();

  // Use custom hook for filtering
  const {
    filteredSchedules,
    filters,
    handleSearch,
    handleFilterChange,
    clearFilters,
  } = useCompletedScheduleFilters(schedules);

  // Memoized derived values (performance)
  const totalCount = useMemo(() => statistics?.totalSchedules ?? 0, [statistics]);
  const filteredCount = useMemo(() => filteredSchedules.length, [filteredSchedules]);

  // Handlers
  const handleViewDetails = useCallback((schedule: CompletedScheduleType) => {
    setSelectedSchedule(schedule);
    setIsDetailsModalOpen(true);
  }, []);

  const handleViewReport = useCallback((schedule: CompletedScheduleType) => {
    console.log("View report for schedule:", schedule.id);
    // TODO: Implement report generation
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedSchedule(null);
  }, []);

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar agendamentos concluídos.
            <Button
              variant="link"
              className="p-0 h-auto ml-2"
              onClick={() => refetch()}
            >
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
          <h1 className="text-3xl font-bold text-gray-900">
            Agendamentos Concluídos
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todos os agendamentos que foram finalizados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showStats ? "Ocultar" : "Mostrar"} Estatísticas
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : statistics.totalSchedules}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Exames</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : statistics.totalExams}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  new Intl.NumberFormat('pt-AO', {
                    style: 'currency',
                    currency: 'AOA',
                    notation: 'compact'
                  }).format(statistics.totalRevenue)
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mr-4">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa Conclusão</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  `${statistics.totalExams > 0 ? ((statistics.completedExams / statistics.totalExams) * 100).toFixed(1) : 0}%`
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics (conditionally shown) */}
      {showStats && (
        <CompletedScheduleStats statistics={statistics} isLoading={isLoading} />
      )}

      {/* Filters */}
      <CompletedScheduleFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        filters={filters}
        totalSchedules={totalCount}
        filteredCount={filteredCount}
      />

      {/* View Toggle and Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
        <div className="flex flex-col lg:flex-row items-center justify-between">
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
            {filteredCount} de {totalCount} agendamentos
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <Card className="p-12 mt-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {statistics.totalSchedules === 0
                  ? "Não há agendamentos concluídos no momento."
                  : "Tente ajustar os filtros para encontrar agendamentos."
                }
              </p>
              {filters.searchQuery && (
                <Button variant="outline" onClick={() => handleSearch("")}>
                  Limpar busca
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            <TabsContent value="grid" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

            <TabsContent value="list" className="space-y-4 mt-6">
              <CompletedScheduleTable
                schedules={filteredSchedules}
                onViewDetails={handleViewDetails}
                onViewReport={handleViewReport}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Details Modal */}
      <CompletedScheduleDetailsModal
        schedule={selectedSchedule}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
}
