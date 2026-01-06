

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Grid3X3,
  List,
  Download,
  FileText,
  BarChart3,
  CheckCircle,
  Calendar as CalendarIcon,
  TrendingUp,
} from "lucide-react";
import { mockExamHistory } from "@/hooks/useExamHistory";
import { ExamCard } from "@/components/akin/lab-exams/ExamCard";
import { ExamTable } from "@/components/akin/lab-exams/ExamTable";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formartCurrency";

export default function ExamsHistoryPage() {
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Usando dados mock para desenvolvimento
  const examHistory = mockExamHistory;

  // Filtrar exames baseado nos filtros aplicados
  const filteredExams = examHistory.filter((exam) => {
    const matchesSearch = exam?.Tipo_Exame?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.id.toString().includes(searchTerm);

    const matchesStatus = statusFilter === "all" || exam.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesPayment = paymentFilter === "all" ||
      exam.status_pagamento.toLowerCase() === paymentFilter.toLowerCase();

    const matchesDateRange = (() => {
      if (!dateFrom && !dateTo) return true;

      const examDate = new Date(exam.data_agendamento);

      if (dateFrom && dateTo) {
        return examDate >= dateFrom && examDate <= dateTo;
      }

      if (dateFrom) {
        return examDate >= dateFrom;
      }

      if (dateTo) {
        return examDate <= dateTo;
      }

      return true;
    })();

    return matchesSearch && matchesStatus && matchesPayment && matchesDateRange;
  });

  const handleExamView = (exam: ExamsType) => {
    toast.info(`Visualizando exame: ${exam?.Tipo_Exame?.nome}`);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Dados atualizados com sucesso");
    }, 1000);
  };

  const handleExportData = () => {
    toast.info("Exportando dados do histórico...");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  // Estatísticas do histórico
  const getHistoryStats = () => {
    const total = examHistory.length;
    const concluidos = examHistory.filter(exam => exam.status === 'CONCLUIDO').length;
    const cancelados = examHistory.filter(exam => exam.status === 'CANCELADO').length;
    const pagos = examHistory.filter(exam => exam.status_pagamento === 'PAGO').length;
    const totalReceita = examHistory
      .filter(exam => exam.status_pagamento === 'PAGO')
      .reduce((sum, exam) => sum + (exam.Tipo_Exame?.preco ?? 0), 0);

    return {
      total,
      concluidos,
      cancelados,
      pagos,
      totalReceita,
      taxaConclusao: total > 0 ? Math.round((concluidos / total) * 100) : 0,
      taxaPagamento: total > 0 ? Math.round((pagos / total) * 100) : 0
    };
  };

  const stats = getHistoryStats();

  return (
    <div className="min-h-screen bg-gray-50/30 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Exames</h1>
          <p className="text-gray-600">Consulte o histórico completo de exames realizados</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Exames</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                <div className="flex items-center space-x-1">
                  <p className="text-2xl font-bold text-gray-900">{stats.taxaConclusao}%</p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Pagamento</p>
                <div className="flex items-center space-x-1">
                  <p className="text-2xl font-bold text-gray-900">{stats.taxaPagamento}%</p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900"> {formatCurrency(stats.totalReceita)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </span>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por exame ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Pagamentos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="nao_pago">Não Pago</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy") : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex space-x-2">
              <Button
                variant={viewMode === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("card")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Histórico de Exames</span>
            <Badge variant="secondary">
              {filteredExams.length} de {examHistory.length} exames
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[100px]" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-[80%]" />
                          <Skeleton className="h-4 w-[60%]" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              )}
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {examHistory.length === 0
                  ? "Nenhum exame no histórico"
                  : "Nenhum exame corresponde aos filtros aplicados"}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Tente ajustar os filtros ou verificar se há exames registrados
              </p>
            </div>
          ) : (
            <div>
              {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExams.map((exam) => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      onView={handleExamView}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <ExamTable
                  exams={filteredExams}
                  onView={handleExamView}
                  showActions={false}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}