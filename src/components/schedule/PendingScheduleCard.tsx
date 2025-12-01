"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarDays, Clock, User, Phone, CreditCard, Stethoscope, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { scheduleRoutes } from "@/Api/Routes/schedule/index.routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface PendingScheduleCardProps {
  schedule: ScheduleType;
}

export function PendingScheduleCard({ schedule }: PendingScheduleCardProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const queryClient = useQueryClient();

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

  const handleAccept = () => {
    acceptMutation.mutate(schedule.id);
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      rejectMutation.mutate({ scheduleId: schedule.id });
    }
  };

  const getPatientAge = () => {
    if (!schedule.Paciente?.data_nascimento) return "N/A";
    const birthDate = new Date(schedule.Paciente.data_nascimento);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return `${age} anos`;
  };

  const getPatientInitials = () => {
    const name = schedule.Paciente?.nome_completo || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (timeString: string) => {
    return format(new Date(`2000-01-01T${timeString}`), "HH:mm");
  };

  const getTotalPrice = () => {
    return schedule.Exame?.reduce((total, exam) => total + (exam.Tipo_Exame?.preco || 0), 0) || 0;
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

  return (
    <Card className="w-full transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="p-4">
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0 ">
              {(schedule.Paciente as any)?.foto ? <AvatarImage src={(schedule.Paciente as any).foto} alt={schedule.Paciente?.nome_completo || "Paciente"} /> : <AvatarFallback className="bg-blue-500 text-white font-semibold">{getPatientInitials()}</AvatarFallback>}
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={schedule.Paciente?.nome_completo || "Nome não disponível"}>{schedule.Paciente?.nome_completo || "Nome não disponível"}</h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 truncate">
                <span className="inline-flex items-center gap-1">
                  <User className="w-3 h-3  text-blue-600" />
                  {schedule.Paciente?.numero_identificacao || "-"}
                </span>
                <span className="inline-flex items-center gap-1">{getPatientAge()}</span>
              </div>
            </div>
          </div>
   
          <div className="flex-shrink-0 ml-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold border ${getStatusColor(schedule.status)}`} aria-label={`Status: ${schedule.status || "Pendente"}`}>
              <AlertCircle className="w-3 h-3" />
              <span className="whitespace-nowrap">{schedule.status || "Pendente"}</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {/* Data e Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="p-2 rounded-md bg-blue-500 text-white flex-shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Data</div>
              <div className="font-medium text-gray-900 truncate" title={schedule.Exame && schedule.Exame.length > 0 ? formatDate(schedule.Exame[0].data_agendamento) : "Data não disponível"}>
                {schedule.Exame && schedule.Exame.length > 0 ? formatDate(schedule.Exame[0].data_agendamento) : "Data não disponível"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="p-2 rounded-md bg-blue-500 text-white flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Hora</div>
              <div className="font-medium text-gray-900 truncate" title={schedule.Exame && schedule.Exame.length > 0 ? formatTime(schedule.Exame[0].hora_agendamento) : "Hora não disponível"}>
                {schedule.Exame && schedule.Exame.length > 0 ? formatTime(schedule.Exame[0].hora_agendamento) : "Hora não disponível"}
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Paciente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white border">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Sexo</Label>
            <p className="mt-1 text-sm text-gray-900">{schedule.Paciente?.id_sexo === 1 ? "Masculino" : "Feminino"}</p>
          </div>
          <div className="p-3 rounded-lg bg-white border">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Contacto</Label>
            <p className="mt-1 text-sm text-gray-900 flex items-center gap-2 truncate">
              <Phone className="w-4 h-4 mr-2 text-green-600" />
              {schedule.Paciente?.contacto_telefonico || "N/A"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Exames */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="flex items-center text-sm font-semibold text-gray-700">
              <div className="p-1.5 mr-2">
                <Stethoscope className="w-4 h-4  text-purple-600" />
              </div>
              <p>Exames Solicitados ({schedule.Exame?.length || 0})</p>
            </Label>
            <div className="text-xs text-gray-400">Últimos Códigos</div>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto">
            {schedule.Exame && schedule.Exame.length > 0 ? (
              schedule.Exame.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50  border border-purple-100">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{exam.Tipo_Exame?.nome}</p>
                    <p className="text-xs text-gray-500">Código: #{exam.id}</p>
                  </div>
                  <span className="ml-4 text-sm font-semibold text-purple-700 whitespace-nowrap">
                    {new Intl.NumberFormat("pt-AO", {
                      style: "currency",
                      currency: "AOA",
                      notation: "compact",
                    }).format(exam.Tipo_Exame?.preco || 0)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum exame solicitado.</p>
            )}
          </div>
        </div>

        {/* Valor Total */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100">
          <span className="flex items-center gap-2 text-sm text-green-800 font-medium">
            <div className="p-1.5 bg-green-500 rounded text-white">
              <CreditCard className="w-4 h-4" />
            </div>
            Valor Total
          </span>
          <span className="text-xl font-bold text-green-700">
            {new Intl.NumberFormat("pt-AO", {
              style: "currency",
              currency: "AOA",
            }).format(getTotalPrice())}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 flex flex-col sm:flex-row gap-2">
        <Button onClick={handleAccept} title={"Aceitar"} disabled={acceptMutation.isPending} className="w-full bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle className="w-4 h-4" />
        </Button>

        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive" title="Recusar" className="w-full" disabled={rejectMutation.isPending}>
              <XCircle className="w-4 h-4" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Recusar Agendamento</DialogTitle>
              <DialogDescription>Por favor, forneça um motivo para recusar este agendamento.</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label htmlFor={`reject-reason-${schedule.id}`} className="text-sm">
                Motivo da recusa
              </Label>
              <Textarea id={`reject-reason-${schedule.id}`} placeholder="Digite o motivo da recusa..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="mt-2" />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || rejectMutation.isPending}>
                {rejectMutation.isPending ? "Recusando..." : "Confirmar Recusa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
