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

  const {data: pendingSchedule} = useQuery({
    queryKey: ["pending-schedule"],
    queryFn: async ()=> {
      const response = await _axios.get("/consultations/pending");
      return response.data;
    }
  })
  console.log("All Medical: ", pendingSchedule);

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

  // Determinar tipo de agendamento
  const isExameSchedule = schedule.Exame && schedule.Exame.length > 0;
  const isConsultaSchedule = schedule.Consulta && schedule.Consulta.length > 0;
  const scheduleType = isExameSchedule ? "exame" : isConsultaSchedule ? "consulta" : "desconhecido";

  // Obter data e hora baseadas no tipo
  const getScheduleDateTime = () => {
    if (isExameSchedule && schedule.Exame?.[0]) {
      return {
        date: schedule.Exame[0].data_agendamento,
        time: schedule.Exame[0].hora_agendamento,
      };
    }

    if (isConsultaSchedule && schedule.Consulta?.[0]) {
      return {
        date: schedule.Consulta[0].data_agendamento,
        time: schedule.Consulta[0].hora_agendamento,
      };
    }

    return {
      date: schedule.data_agendamento || "",
      time: schedule.hora_agendamento || "",
    };
  };

  const scheduleInfo = getScheduleDateTime();

  // Calcular preço total
  const getTotalPrice = () => {
    if (isExameSchedule) {
      return schedule.Exame?.reduce((total, exam) => total + (exam.Tipo_Exame?.preco || 0), 0) || 0;
    }

    if (isConsultaSchedule) {
      return schedule.Consulta?.[0]?.preco || 0;
    }

    return 0;
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

  console.log("Consultas: ",schedule.Consulta);
  // console.log("Tipo Consulta: ",schedule?.Consulta[0]?.Tipo_Consulta);


  // Renderizar conteúdo baseado no tipo
  const renderScheduleContent = () => {
    if (isExameSchedule) {
      return (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="flex items-center text-sm font-semibold text-gray-700">
              <div className="p-1.5 mr-2 rounded-md bg-purple-100">
                <Stethoscope className="w-4 h-4 text-purple-600" />
              </div>
              <p>Exames Solicitados ({schedule.Exame?.length || 0})</p>
            </Label>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Exames
            </Badge>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto">
            {schedule.Exame?.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{exam.Tipo_Exame?.nome}</p>
                  <p className="text-xs text-gray-500">Código: #{exam.id}</p>
                </div>
                <span className="ml-4 text-sm font-semibold text-purple-700 whitespace-nowrap">
                  {new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                  }).format(exam.Tipo_Exame?.preco || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (isConsultaSchedule) {
      const consulta = schedule.Consulta?.[0];
      console.log("Consulta: ",consulta)
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
              <span className="text-sm font-medium text-gray-900">{consulta?.Tipo_Consulta?.nome || "Geral"}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Médico:</span>
              </div>
              <span className="text-sm font-medium text-gray-900 truncate ml-2">{consulta?.Clinico_Geral?.nome || "A designar"}</span>
            </div>

            {consulta?.observacoes && (
              <div className="mt-2">
                <Label className="text-xs text-gray-500">Observações</Label>
                <p className="text-sm text-gray-700 mt-1 p-2 bg-white border rounded-md">{consulta.observacoes}</p>
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
    <Card className="w-full transition-shadow duration-200 hover:shadow-lg border-l-4 border-l-blue-500">
      <CardHeader className="p-4">
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              {(schedule.Paciente as any)?.foto ? <AvatarImage src={(schedule.Paciente as any).foto} alt={schedule.Paciente?.nome_completo || "Paciente"} /> : <AvatarFallback className="bg-blue-500 text-white font-semibold">{getPatientInitials()}</AvatarFallback>}
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="capitalize bg-blue-50">
                  {scheduleType}
                </Badge>
                {isExameSchedule && (
                  <Badge variant="secondary" className="text-xs">
                    {schedule.Exame?.length} {schedule.Exame?.length === 1 ? "exame" : "exames"}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={schedule.Paciente?.nome_completo || "Nome não disponível"}>
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
            <span className="text-xs text-gray-500">ID: #{schedule.id}</span>
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
              <div className="font-medium text-gray-900 truncate" title={scheduleInfo.date ? formatDate(scheduleInfo.date) : "Data não disponível"}>
                {scheduleInfo.date ? formatDate(scheduleInfo.date) : "Data não disponível"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="p-2 rounded-md bg-blue-500 text-white flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Hora</div>
              <div className="font-medium text-gray-900 truncate" title={scheduleInfo.time ? formatTime(scheduleInfo.time) : "Hora não disponível"}>
                {scheduleInfo.time ? formatTime(scheduleInfo.time) : "Hora não disponível"}
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
              <Phone className="w-4 h-4 text-green-600" />
              {schedule.Paciente?.contacto_telefonico || "N/A"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Conteúdo específico do agendamento */}
        {renderScheduleContent()}

        {/* Valor Total - só mostra se houver preço */}
        {getTotalPrice() > 0 && (
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
        )}
      </CardContent>

      <CardFooter className="p-4 flex flex-col sm:flex-row gap-2 bg-gray-50 border-t">
        <Button onClick={handleAccept} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2" disabled={acceptMutation.isPending}>
          <CheckCircle className="w-4 h-4" />
          {acceptMutation.isPending ? "Processando..." : "Aceitar"}
        </Button>

        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full flex items-center gap-2" disabled={rejectMutation.isPending}>
              <XCircle className="w-4 h-4" />
              Recusar
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Recusar Agendamento</DialogTitle>
              <DialogDescription>
                Você está recusando um agendamento de {scheduleType} para {schedule.Paciente?.nome_completo}. Por favor, forneça um motivo.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label htmlFor={`reject-reason-${schedule.id}`} className="text-sm">
                Motivo da recusa
              </Label>
              <Textarea id={`reject-reason-${schedule.id}`} placeholder="Digite o motivo da recusa..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="mt-2 min-h-[100px]" />
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
