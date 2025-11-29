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
import {
  CheckCircle,
  XCircle,
  Loader,
  AlertTriangle,
  Users,
  Calendar,
  Stethoscope,
  CreditCard
} from "lucide-react";
import { scheduleRoutes } from "@/Api/Routes/schedule/index.routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface BulkActionsProps {
  schedules: ScheduleType[];
  selectedSchedules: number[];
  onSelectionChange: (scheduleIds: number[]) => void;
}

export function BulkActions({
  schedules,
  selectedSchedules,
  onSelectionChange
}: BulkActionsProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const queryClient = useQueryClient();

  const bulkAcceptMutation = useMutation({
    mutationFn: async (scheduleIds: number[]) => {
      const results = await Promise.allSettled(
        scheduleIds.map(id => scheduleRoutes.acceptSchedule(id))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-schedules'] });
      onSelectionChange([]);
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: async ({ scheduleIds }: { scheduleIds: number[] }) => {
      const results = await Promise.allSettled(
        scheduleIds.map(id => scheduleRoutes.rejectSchedule(id))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-schedules'] });
      onSelectionChange([]);
      setShowBulkRejectDialog(false);
      setRejectReason("");
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(schedules.map(s => s.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectSchedule = (scheduleId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedSchedules, scheduleId]);
    } else {
      onSelectionChange(selectedSchedules.filter(id => id !== scheduleId));
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
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) return total;

      const scheduleTotal = schedule.Exame?.reduce((examTotal, exam) =>
        examTotal + (exam.Tipo_Exame?.preco || 0), 0
      ) || 0;

      return total + scheduleTotal;
    }, 0);
  };

  const isIndeterminate = selectedSchedules.length > 0 && selectedSchedules.length < schedules.length;
  const isAllSelected = selectedSchedules.length === schedules.length && schedules.length > 0;

  if (schedules.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              Selecionar todos ({schedules.length})
            </span>
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
            <Button
              onClick={handleBulkAccept}
              disabled={bulkAcceptMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              {bulkAcceptMutation.isPending ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Aceitar ({selectedSchedules.length})
            </Button>

            <Dialog open={showBulkRejectDialog} onOpenChange={setShowBulkRejectDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={bulkRejectMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Recusar ({selectedSchedules.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Recusar Agendamentos em Lote</DialogTitle>
                  <DialogDescription>
                    Você está prestes a recusar {selectedSchedules.length} agendamento(s).
                    Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Todos os pacientes afetados serão notificados sobre a recusa.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="bulk-reject-reason">
                      Motivo da recusa (aplicado a todos)
                    </Label>
                    <Textarea
                      id="bulk-reject-reason"
                      placeholder="Digite o motivo da recusa..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkRejectDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleBulkReject}
                    disabled={!rejectReason.trim() || bulkRejectMutation.isPending}
                  >
                    {bulkRejectMutation.isPending ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      "Confirmar Recusa"
                    )}
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
                      {selectedSchedules.reduce((total, scheduleId) => {
                        const schedule = schedules.find(s => s.id === scheduleId);
                        return total + (schedule?.Exame?.length || 0);
                      }, 0)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <div>
                    <span className="text-gray-600">Valor Total:</span>
                    <div className="font-semibold text-green-700">
                      {new Intl.NumberFormat('pt-AO', {
                        style: 'currency',
                        currency: 'AOA',
                        notation: 'compact'
                      }).format(getSelectedSchedulesTotal())}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-gray-600">Pacientes:</span>
                    <div className="font-semibold text-blue-700">
                      {new Set(selectedSchedules.map(scheduleId => {
                        const schedule = schedules.find(s => s.id === scheduleId);
                        return schedule?.id_paciente;
                      })).size}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleBulkAccept}
                  disabled={bulkAcceptMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  {bulkAcceptMutation.isPending ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Aceitar {selectedSchedules.length > 1 ? 'Todos' : ''}
                </Button>

                <Dialog open={showBulkRejectDialog} onOpenChange={setShowBulkRejectDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={bulkRejectMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Recusar {selectedSchedules.length > 1 ? 'Todos' : ''}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Recusar Agendamentos em Lote</DialogTitle>
                      <DialogDescription>
                        Você está prestes a recusar {selectedSchedules.length} agendamento(s).
                        Esta ação não pode ser desfeita.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Todos os pacientes afetados serão notificados sobre a recusa.
                        </AlertDescription>
                      </Alert>

                      <div>
                        <Label htmlFor="bulk-reject-reason">
                          Motivo da recusa (aplicado a todos)
                        </Label>
                        <Textarea
                          id="bulk-reject-reason"
                          placeholder="Digite o motivo da recusa..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowBulkRejectDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleBulkReject}
                        disabled={!rejectReason.trim() || bulkRejectMutation.isPending}
                      >
                        {bulkRejectMutation.isPending ? (
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          "Confirmar Recusa"
                        )}
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
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
          >
            <Checkbox
              checked={selectedSchedules.includes(schedule.id)}
              onCheckedChange={(checked) =>
                handleSelectSchedule(schedule.id, checked as boolean)
              }
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">
                  {schedule.Paciente?.nome_completo}
                </span>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(schedule.Exame[0].data_agendamento).toLocaleDateString('pt-AO')}
                  </span>
                  <span className="font-semibold text-green-600">
                    {new Intl.NumberFormat('pt-AO', {
                      style: 'currency',
                      currency: 'AOA',
                      notation: 'compact'
                    }).format(
                      schedule.Exame?.reduce((total, exam) => total + (exam.Tipo_Exame?.preco || 0), 0) || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
