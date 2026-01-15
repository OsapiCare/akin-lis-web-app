"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader, AlertTriangle, Users, Calendar, Stethoscope, CreditCard, FileText } from "lucide-react";
import { scheduleRoutes } from "@/Api/Routes/schedule/index.routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examRoutes } from "@/Api/Routes/Exam/index.route";

interface BulkActionsProps {
  schedules: ScheduleType[];
  selectedSchedules: number[];
  onSelectionChange: (scheduleIds: number[]) => void;
}

export function BulkActions({ schedules, selectedSchedules, onSelectionChange }: BulkActionsProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const queryClient = useQueryClient();

  const bulkAcceptMutation = useMutation({
    mutationFn: async (scheduleIds: number[]) => {
      const results = await Promise.allSettled(scheduleIds.map((id) => scheduleRoutes.acceptSchedule(id)));
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams-pending"] });
      queryClient.invalidateQueries({ queryKey: ["pending-consultas"] });
      onSelectionChange([]);
    },
  });

  const { data: exam } = useQuery({
    queryKey: ["exam"],
    queryFn: async () => {
      const response = await examRoutes.getExams();
      return response.data;
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: async ({ scheduleIds }: { scheduleIds: number[] }) => {
      const results = await Promise.allSettled(scheduleIds.map((id) => scheduleRoutes.rejectSchedule(id)));
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams-pending"] });
      queryClient.invalidateQueries({ queryKey: ["pending-consultas"] });
      onSelectionChange([]);
      setShowBulkRejectDialog(false);
      setRejectReason("");
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(schedules.map((s) => s.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectSchedule = (scheduleId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedSchedules, scheduleId]);
    } else {
      onSelectionChange(selectedSchedules.filter((id) => id !== scheduleId));
    }
  };

  const handleBulkAccept = () => {
    if (selectedSchedules.length > 0) {
      bulkAcceptMutation.mutate(selectedSchedules);
    }
  };

  const handleBulkReject = () => {
    if (selectedSchedules.length > 0 && rejectReason.trim()) {
      bulkRejectMutation.mutate({
        scheduleIds: selectedSchedules,
      });
    }
  };

  const getSelectedSchedulesTotal = () => {
    return selectedSchedules.reduce((total, scheduleId) => {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (!schedule) return total;

      // Calcular total de exames
      const examesTotal = schedule.Exame?.reduce((totalExame, exame) => {
        return totalExame + (exame?.Tipo_Exame?.preco || 0);
      }, 0) || 0;

      // Calcular total de consultas
      const consultasTotal = schedule.Consulta?.reduce((totalConsulta, consulta) => {
        return totalConsulta + (consulta?.Tipo_Consulta?.preco || 0);
      }, 0) || 0;

      return total + examesTotal + consultasTotal;
    }, 0);
  };

  const getSelectedSchedulesCounts = () => {
    const counts = selectedSchedules.reduce(
      (acc, scheduleId) => {
        const schedule = schedules.find((s) => s.id === scheduleId);
        if (schedule) {
          acc.exames += schedule.Exame?.length || 0;
          acc.consultas += schedule.Consulta?.length || 0;
        }
        return acc;
      },
      { exames: 0, consultas: 0 }
    );

    return counts;
  };

  const isIndeterminate = selectedSchedules.length > 0 && selectedSchedules.length < schedules.length;
  const isAllSelected = selectedSchedules.length === schedules.length && schedules.length > 0;

  if (schedules.length === 0) {
    return null;
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/D";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-AO");
    } catch {
      return "N/D";
    }
  };

  // Função para renderizar informações de data e tipo
  const renderScheduleInfo = (schedule: any) => {
    const examesInfo = schedule.exames?.map((exame: any) => ({
      tipo: "Exame",
      data: exame?.data_agendamento,
      nome: exame?.Tipo_Exame?.nome,
      preco: exame?.Tipo_Exame?.preco
    })) || [];

    const consultasInfo = schedule.consultas?.map((consulta: any) => ({
      tipo: "Consulta",
      data: consulta?.data_agendamento,
      nome: consulta?.Tipo_Consulta?.nome,
      preco: consulta?.Tipo_Consulta?.preco
    })) || [];

    const allItems = [...examesInfo, ...consultasInfo];

    return (
      <div className="space-y-1">
        {allItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className={`${item.tipo === "Exame" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"} px-1 py-0`}>
              {item.tipo === "Exame" ? <Stethoscope className="w-2 h-2 mr-1" /> : <FileText className="w-2 h-2 mr-1" />}
              {item.tipo}
            </Badge>
            <span className="text-gray-600">{formatDate(item.data)}</span>
            {item.preco > 0 && (
              <span className="font-semibold text-green-600 ml-auto">
                {new Intl.NumberFormat("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                }).format(item.preco)}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
            <span className="text-sm font-medium">Selecionar todos ({schedules.length})</span>
          </div>

          {selectedSchedules.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {selectedSchedules.length} selecionados
            </Badge>
          )}
        </div>

        {selectedSchedules.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button onClick={handleBulkAccept} disabled={bulkAcceptMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white" size="sm">
              {bulkAcceptMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Aceitar ({selectedSchedules.length})
            </Button>

            <Dialog open={showBulkRejectDialog} onOpenChange={setShowBulkRejectDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={bulkRejectMutation.isPending}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Recusar ({selectedSchedules.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Recusar Agendamentos em Lote</DialogTitle>
                  <DialogDescription>Você está prestes a recusar {selectedSchedules.length} agendamento(s). Esta ação não pode ser desfeita.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Todos os pacientes afetados serão notificados sobre a recusa.</AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="bulk-reject-reason">Motivo da recusa (aplicado a todos)</Label>
                    <Textarea id="bulk-reject-reason" placeholder="Digite o motivo da recusa..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="mt-2" />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowBulkRejectDialog(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleBulkReject} disabled={!rejectReason.trim() || bulkRejectMutation.isPending}>
                    {bulkRejectMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : "Confirmar Recusa"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {selectedSchedules.length > 0 && (
        <>
          <Separator />
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <span className="text-gray-600">Agendamentos:</span>
                    <div className="font-semibold text-blue-700">{selectedSchedules.length}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-gray-600">Exames:</span>
                    <div className="font-semibold text-blue-700">
                      {getSelectedSchedulesCounts().exames}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <div>
                    <span className="text-gray-600">Consultas:</span>
                    <div className="font-semibold text-green-700">
                      {getSelectedSchedulesCounts().consultas}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-gray-600">Valor Total:</span>
                    <div className="font-semibold text-purple-700">
                      {new Intl.NumberFormat("pt-AO", {
                        style: "currency",
                        currency: "AOA",
                      }).format(getSelectedSchedulesTotal())}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleBulkAccept} disabled={bulkAcceptMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                  {bulkAcceptMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Aceitar {selectedSchedules.length > 1 ? "Todos" : ""}
                </Button>

                <Dialog open={showBulkRejectDialog} onOpenChange={setShowBulkRejectDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={bulkRejectMutation.isPending}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Recusar {selectedSchedules.length > 1 ? "Todos" : ""}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Recusar Agendamentos em Lote</DialogTitle>
                      <DialogDescription>Você está prestes a recusar {selectedSchedules.length} agendamento(s). Esta ação não pode ser desfeita.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>Todos os pacientes afetados serão notificados sobre a recusa.</AlertDescription>
                      </Alert>

                      <div>
                        <Label htmlFor="bulk-reject-reason">Motivo da recusa (aplicado a todos)</Label>
                        <Textarea id="bulk-reject-reason" placeholder="Digite o motivo da recusa..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="mt-2" />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowBulkRejectDialog(false)}>
                        Cancelar
                      </Button>
                      <Button variant="destructive" onClick={handleBulkReject} disabled={!rejectReason.trim() || bulkRejectMutation.isPending}>
                        {bulkRejectMutation.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : "Confirmar Recusa"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Individual Schedule Selection */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {schedules.map((schedule: any) => (
          <div key={schedule.id_paciente} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
            <Checkbox 
              checked={selectedSchedules.includes(schedule.id_paciente)} 
              onCheckedChange={(checked) => handleSelectSchedule(schedule.id_paciente, checked as boolean)} 
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium truncate">{schedule.paciente_nome}</span>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span className="font-medium">
                    Total: {new Intl.NumberFormat("pt-AO", {
                      style: "currency",
                      currency: "AOA",
                    }).format(
                      (schedule.exames?.reduce((total: number, exame: any) => total + (exame?.Tipo_Exame?.preco || 0), 0) || 0) +
                      (schedule.consultas?.reduce((total: number, consulta: any) => total + (consulta?.Tipo_Consulta?.preco || 0), 0) || 0)
                    )}
                  </span>
                </div>
              </div>
              
              {/* Informações detalhadas de exames e consultas */}
              {renderScheduleInfo(schedule)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}