

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Search,
  Filter,
  RefreshCw,
  Grid3X3,
  List,
  AlertTriangle,
  FileText,
  Download,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { usePendingExams } from "@/hooks/usePendingExams";
import { ExamCard } from "@/components/akin/lab-exams/ExamCard";
import { ExamTable } from "@/components/akin/lab-exams/ExamTable";
import { AlerDialogNextExam } from "@/app/akin/patient/[id]/next-exam/_alertDialog";
import { MedicalMaterialsModal } from "@/app/akin/patient/[id]/next-exam/_materialModal";
import { toast } from "sonner";

const SkeletonCard = () => (
  <Card className="animate-pulse">
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
);

export default function PendingExamsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Estados para controlar os modais
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamsType | null>(null);

  const { data: pendingExams, isLoading, error, refetch } = usePendingExams();

  // Filtrar exames baseado nos filtros aplicados
  const filteredExams = pendingExams?.filter((exam: ExamsType) => {
    const matchesSearch = exam?.Tipo_Exame?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.id.toString().includes(searchTerm);

    const matchesStatus = statusFilter === "all" || exam.status.toLowerCase() === statusFilter;

    const matchesPayment = paymentFilter === "all" ||
      exam.status_pagamento.toLowerCase() === paymentFilter;

    const matchesDate = dateFilter === "all" || (() => {
      const examDate = new Date(exam.data_agendamento);
      const today = new Date();

      switch (dateFilter) {
        case "today":
          return examDate.toDateString() === today.toDateString();
        case "tomorrow":
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return examDate.toDateString() === tomorrow.toDateString();
        case "week":
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return examDate >= today && examDate <= weekFromNow;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const handleExamEdit = (exam: ExamsType) => {
    toast.info(`Editando exame: ${exam?.Tipo_Exame?.nome}`);
  };

  const handleExamStart = (exam: ExamsType) => {
    console.log(`Iniciando exame: `, exam);
    setSelectedExam(exam);
    setIsProtocolModalOpen(true);
  };

  const handleProtocolClose = () => {
    setIsProtocolModalOpen(false);
    setSelectedExam(null);
  };

  const handleProtocolIgnore = () => {
    setIsProtocolModalOpen(false);
    setIsMaterialsModalOpen(true);
  };

  const handleMaterialsClose = () => {
    setIsMaterialsModalOpen(false);
    setSelectedExam(null);
  };

  const handleMaterialsContinue = () => {
    if (selectedExam) {
      setIsMaterialsModalOpen(false);
      // Usar router.push do Next.js para navegação sem reload
      router.push(`/akin/lab-exams/ready-exam/${selectedExam.Agendamento.Paciente.id}/${selectedExam?.Tipo_Exame?.id}`);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dados atualizados com sucesso");
  };

  const handleExportData = () => {
    toast.info("Exportando dados...");
  };

  const getStatusCounts = () => {
    if (!pendingExams) return { total: 0, pendentes: 0, andamento: 0, atrasados: 0 };

    return {
      total: pendingExams.length,
      pendentes: pendingExams.filter((exam: ExamsType) => exam.status.toLowerCase() === 'pendente').length,
      andamento: pendingExams.filter((exam: ExamsType) => exam.status.toLowerCase() === 'em_andamento').length,
      atrasados: pendingExams.filter((exam: ExamsType) => {
        const examDate = new Date(exam.data_agendamento);
        const today = new Date();
        return examDate < today && exam.status.toLowerCase() === 'pendente';
      }).length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50/30 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exames Pendentes</h1>
          <p className="text-gray-600">Gerencie todos os exames aguardando realização</p>
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

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.pendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.andamento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Atrasados</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.atrasados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {statusCounts.atrasados > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{statusCounts.atrasados} exames atrasados</strong> necessitam de atenção imediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 lg:flex-row">
            <div className="relative md:col-span-2 min-w-[200px]">
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
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
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

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Datas</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="tomorrow">Amanhã</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
              </SelectContent>
            </Select>

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
            <span>Exames Encontrados</span>
            <Badge variant="secondary">
              {filteredExams?.length || 0} de {pendingExams?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              )}
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Erro ao carregar exames pendentes. Tente novamente.
              </AlertDescription>
            </Alert>
          ) : !filteredExams || filteredExams.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {pendingExams?.length === 0
                  ? "Nenhum exame pendente encontrado"
                  : "Nenhum exame corresponde aos filtros aplicados"}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Tente ajustar os filtros ou adicionar novos exames
              </p>
            </div>
          ) : (
            <div>
              {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExams.map((exam: ExamsType) => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      onEdit={handleExamEdit}
                      onStart={handleExamStart}
                    />
                  ))}
                </div>
              ) : (
                <ExamTable
                  exams={filteredExams}
                  onEdit={handleExamEdit}
                  onStart={handleExamStart}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais para o fluxo de iniciar exame */}
      {selectedExam && (
        <>
          <AlerDialogNextExam
            isOpen={isProtocolModalOpen}
            onClose={handleProtocolClose}
            onIgnore={handleProtocolIgnore}
          />

          <MedicalMaterialsModal
            isOpen={isMaterialsModalOpen}
            onClose={handleMaterialsClose}
            onContinue={handleMaterialsContinue}
            exam_id={String(selectedExam?.Tipo_Exame?.id)}
            patient_name={selectedExam.Agendamento.Paciente.nome_completo}
            exam_name={selectedExam?.Tipo_Exame?.nome ?? ""}
          />
        </>
      )}
    </div>
  );
}