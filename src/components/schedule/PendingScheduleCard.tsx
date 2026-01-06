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
import { CalendarDays, Clock, User, Phone, CreditCard, Stethoscope, CheckCircle, XCircle, AlertCircle, FileText, HeartPulse, Calendar, UserCog } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { scheduleRoutes } from "@/Api/Routes/schedule/index.routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { _axios } from "@/Api/axios.config";

interface PendingScheduleCardProps {
  schedule: CombinedScheduleType; // Mudamos o tipo aqui
}

// Novo tipo que combina exames e consultas
type CombinedScheduleType = {
  id: number;
  type: 'exame' | 'consulta';
  data_agendamento: string;
  hora_agendamento: string;
  status: string;
  preco: number;
  Paciente: {
    id: number;
    nome_completo: string;
    numero_identificacao?: string;
    data_nascimento?: string;
    id_sexo?: number;
    contacto_telefonico?: string;
    sexo?: { nome: string };
  };
  details: any; // Detalhes específicos (exame ou consulta)
};

export function PendingScheduleCard({ schedule }: PendingScheduleCardProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: (scheduleId: number) => scheduleRoutes.acceptSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pending-schedules"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ scheduleId }: { scheduleId: number }) => scheduleRoutes.rejectSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pending-schedules"] });
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
    try {
      const birthDate = new Date(schedule.Paciente.data_nascimento);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      return `${age} anos`;
    } catch {
      return "N/A";
    }
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
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return "Data não disponível";
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return format(new Date(`2000-01-01T${timeString}`), "HH:mm");
    } catch {
      return "Hora não disponível";
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "pendente";
    switch (statusLower) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmado":
      case "aceite":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelado":
      case "recusado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Renderizar conteúdo baseado no tipo
  const renderScheduleContent = () => {
    if (schedule.type === 'exame') {
      const examDetails = schedule.details;
      return (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="flex items-center text-sm font-semibold text-gray-700">
              <div className="p-1.5 mr-2 rounded-md bg-purple-100">
                <Stethoscope className="w-4 h-4 text-purple-600" />
              </div>
              <p>Exame Solicitado</p>
            </Label>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Exame
            </Badge>
          </div>

          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {examDetails?.Tipo_Exame?.nome || "Exame não especificado"}
                </p>
                <p className="text-xs text-gray-500">Código: #{examDetails?.id || schedule.id}</p>
              </div>
              <span className="ml-4 text-sm font-semibold text-purple-700 whitespace-nowrap">
                {new Intl.NumberFormat("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                }).format(examDetails?.Tipo_Exame?.preco || schedule.preco || 0)}
              </span>
            </div>
            
            {examDetails?.Tipo_Exame?.descricao && (
              <div className="mt-2">
                <Label className="text-xs text-gray-500">Descrição</Label>
                <p className="text-sm text-gray-700 mt-1 p-2 bg-white border rounded-md">
                  {examDetails.Tipo_Exame.descricao}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (schedule.type === 'consulta') {
      const consultaDetails = schedule.details;
      return (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="flex items-center text-sm font-semibold text-gray-700">
              <div className="p-1.5 mr-2 rounded-md bg-blue-100">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <p>Detalhes da Consulta</p>
            </Label>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Consulta
            </Badge>
          </div>

          <div className="space-y-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Tipo:</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {consultaDetails?.Tipo_Consulta?.nome || "Consulta Geral"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Médico:</span>
              </div>
              <span className="text-sm font-medium text-gray-900 truncate ml-2">
                {consultaDetails?.Agendamento?.Clinico_Geral?.nome || "A designar"}
              </span>
            </div>

            {consultaDetails?.observacoes && (
              <div className="mt-2">
                <Label className="text-xs text-gray-500">Observações</Label>
                <p className="text-sm text-gray-700 mt-1 p-2 bg-white border rounded-md">
                  {consultaDetails.observacoes}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 text-center bg-gray-50 rounded-lg border">
        <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Tipo de agendamento não especificado</p>
      </div>
    );
  };

  return (
    <Card className={`w-full transition-shadow duration-200 hover:shadow-lg border-l-4 ${schedule.type === 'consulta' ? 'border-l-blue-500' : 'border-l-purple-500'}`}>
      <CardHeader className="p-4">
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarFallback className={`${schedule.type === 'consulta' ? 'bg-blue-500' : 'bg-purple-500'} text-white font-semibold`}>
                {getPatientInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={`capitalize ${schedule.type === 'consulta' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                  {schedule.type}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ID: #{schedule.id}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {schedule.Paciente?.nome_completo || "Nome não disponível"}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 truncate">
                <span className="inline-flex items-center gap-1">
                  <User className="w-3 h-3 text-blue-600" />
                  {schedule.Paciente?.numero_identificacao || "-"}
                </span>
                <span className="inline-flex items-center gap-1">{getPatientAge()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold border ${getStatusColor(schedule.status)}`}>
              <AlertCircle className="w-3 h-3" />
              <span className="whitespace-nowrap">{schedule.status || "Pendente"}</span>
            </span>
            <span className="text-xs text-gray-500">
              {schedule.type === 'consulta' ? 'Consulta' : 'Exame'} #{schedule.id}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {/* Data e Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className={`p-2 rounded-md ${schedule.type === 'consulta' ? 'bg-blue-500' : 'bg-purple-500'} text-white flex-shrink-0`}>
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Data</div>
              <div className="font-medium text-gray-900 truncate">
                {formatDate(schedule.data_agendamento)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className={`p-2 rounded-md ${schedule.type === 'consulta' ? 'bg-blue-500' : 'bg-purple-500'} text-white flex-shrink-0`}>
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Hora</div>
              <div className="font-medium text-gray-900 truncate">
                {formatTime(schedule.hora_agendamento)}
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Paciente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white border">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Sexo</Label>
            <p className="mt-1 text-sm text-gray-900">
              {schedule.Paciente?.id_sexo === 1 ? "Masculino" : schedule.Paciente?.id_sexo === 2 ? "Feminino" : "Não informado"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white border">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Contacto</Label>
            <p className="mt-1 text-sm text-gray-900 flex items-center gap-2 truncate">
              <Phone className="w-4 h-4 text-green-600" />
              {schedule.Paciente?.contacto_telefonico || "N/A"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Conteúdo específico do agendamento */}
        {renderScheduleContent()}

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
            }).format(schedule.preco || 0)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 flex flex-col sm:flex-row gap-2 bg-gray-50 border-t">
        <Button 
          onClick={handleAccept} 
          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          disabled={acceptMutation.isPending}
        >
          <CheckCircle className="w-4 h-4" />
          {acceptMutation.isPending ? "Processando..." : "Aceitar"}
        </Button>

        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full flex items-center gap-2"
              disabled={rejectMutation.isPending}
            >
              <XCircle className="w-4 h-4" />
              Recusar
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Recusar Agendamento</DialogTitle>
              <DialogDescription>
                Você está recusando uma {schedule.type === 'consulta' ? 'consulta' : 'agendamento de exame'} para {schedule.Paciente?.nome_completo}.
                Por favor, forneça um motivo.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label htmlFor={`reject-reason-${schedule.id}`} className="text-sm">
                Motivo da recusa
              </Label>
              <Textarea 
                id={`reject-reason-${schedule.id}`} 
                placeholder="Digite o motivo da recusa..." 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)} 
                className="mt-2 min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={!rejectReason.trim() || rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Recusando..." : "Confirmar Recusa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}