"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarDays, Clock, User, Phone, CreditCard, Stethoscope, CheckCircle, XCircle, AlertCircle, FileText, HeartPulse, UserCog } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { consultaRoutes, scheduleRoutes } from "@/Api/Routes/schedule/index.routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { _axios } from "@/Api/axios.config";

interface ConsultaCardProps {
  consulta: ConsultasType;
}

interface PendingScheduleCardProps {
  schedule: ScheduleType;
}

export function ConsultaScheduleCard({ consulta }: ConsultaCardProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: (consultaId: number) => consultaRoutes.acceptConsulta(consultaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-consultations"] });
      queryClient.invalidateQueries({ queryKey: ["pending-consultas"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ consultaId }: { consultaId: number }) => consultaRoutes.rejectConsulta(consultaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-consultations"] });
      queryClient.invalidateQueries({ queryKey: ["pending-consultas"] });
      setShowRejectDialog(false);
      setRejectReason("");
    },
  });

  const handleAccept = () => {
    if (consulta?.id) {
      acceptMutation.mutate(consulta.id);
    }
  };

  const handleReject = () => {
    if (rejectReason.trim() && consulta?.id) {
      rejectMutation.mutate({ consultaId: consulta.id });
    }
  };


 const getPatientAge = () => {
    if (!consulta?.Agendamento?.Paciente) return "N/A";
    const birthDate = new Date(consulta?.data_formatada);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return `${age} anos`;
  };

  const isConsultaSchedule = consulta.Consulta && consulta.Consulta.length > 0;

  const getPatientInitials = () => {
    const name = consulta?.Paciente?.nome_completo || "Paciente";
    return name
      .split(" ")
      .map((n: any) => n[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (timeString: string) => {
    return format(new Date(`2000-01-01T${timeString}`), "HH:mm");
  };

  const getScheduleDateConsultTime = () => {
    if (isConsultaSchedule && consulta.Consulta?.[0]) {
      return {
        date: consulta.Consulta[0].data_agendamento,
        time: consulta.Consulta[0].hora_agendamento,
      };
    }
    return {
      date: consulta.data_agendamento ?? "",
      time: consulta.hora_agendamento ?? "",
    };
  };

   const getTotalPrice = () => {
    if (isConsultaSchedule) {
      return consulta.Consulta?.reduce((total) => total + (consulta?.Tipo_Consulta?.preco || 0), 0) || 0;
    }
    return 0;
  };


  const consultaInfo = getScheduleDateConsultTime();

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

  const paciente = consulta?.Agendamento?.Paciente;

        const renderConsultaContent = () => {
    if (!isConsultaSchedule) {
      return null;
    }

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
              <span className="text-sm font-medium text-gray-900">{consulta.Tipo_Consulta?.nome || "Consulta Geral"}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Médico:</span>
              </div>
              <span className="text-sm font-medium text-gray-900 truncate ml-2">
                {consulta.Tecnico_Laboratorio?.nome || "A designar"}</span>
            </div>

            {/* {consulta.observacoes && (
              <div className="mt-2">
                <Label className="text-xs text-gray-500">Observações</Label>
                <p className="text-sm text-gray-700 mt-1 p-2 bg-white border rounded-md line-clamp-3">{consulta.observacoes}</p>
              </div>
            )} */}
          </div>
        </div>
  )
}

  return(
    <Card className="w-full transition-shadow duration-200 hover:shadow-lg border-l-4 border-l-blue-500">
      <CardHeader className="p-4">
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarFallback className="bg-blue-500 text-white font-semibold">
                {getPatientInitials()}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Consulta
                </Badge>
                {isConsultaSchedule && (
                  <Badge variant="secondary" className="text-xs">
                  {consulta.Consulta?.length} {consulta.Consulta?.length === 1 ? "consulta" : "consultas"}
                </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {paciente?.nome_completo || "Paciente não identificado"}
                </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 truncate">
                <span className="inline-flex items-center gap-1">
                  <User className="w-3 h-3 text-blue-600" />
                  {/* {paciente?.numero_identificacao || "-"} */}
                </span>
                <span className="inline-flex items-center gap-1">{getPatientAge()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold border ${getStatusColor(consulta.status)}`}>
              <AlertCircle className="w-3 h-3" />
              <span className="whitespace-nowrap">{consulta.status || "Pendente"}</span>
            </span>
            <span className="text-xs text-gray-500">Consulta #{consulta.id}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {/* Data e Hora - Layout especial para consultas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="p-2 rounded-md bg-blue-500 text-white flex-shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Data</div>
              <div className="font-medium text-gray-900 truncate" title={`${consultaInfo.date ? formatDate(consultaInfo.date) : "Data não disponível"}`}>
                {`${consultaInfo.date ? formatDate(consultaInfo.date) : "Data não encontrada"}`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="p-2 rounded-md bg-blue-500 text-white flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Hora</div>
              <div className="font-medium text-gray-900 truncate" title={`${consultaInfo.time ? formatTime(consultaInfo.time) : "Hora não disponível"}`}>
                {`${consultaInfo.time ? formatTime(consultaInfo.time) : "Hora não encontrada"}`}
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Paciente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white border">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Sexo</Label>
            <p className="mt-1 text-sm text-gray-900">{paciente?.id_sexo === 1 ? "Masculino" : paciente?.id_sexo === 2 ? "Feminino" : "Não informado"}</p>
          </div>
          <div className="p-3 rounded-lg bg-white border">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Contacto</Label>
            <p className="mt-1 text-sm text-gray-900 flex items-center gap-2 truncate">
              <Phone className="w-4 h-4 text-green-600" />
              {consulta.Paciente?.contacto_telefonico || "N/A"}
            </p>
          </div>
        </div>

        <Separator />
   

        {/* Valor Total */}
        {renderConsultaContent()}

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
        <Button onClick={handleAccept} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2" disabled={acceptMutation.isPending || !consulta.id}>
          <CheckCircle className="w-4 h-4" />
          {acceptMutation.isPending ? "Processando..." : "Aceitar"}
        </Button>

        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full flex items-center gap-2" disabled={rejectMutation.isPending || !consulta.id}>
              <XCircle className="w-4 h-4" />
              Recusar
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Recusar Consulta</DialogTitle>
              <DialogDescription>Você está recusando uma consulta para {paciente?.nome_completo}. Por favor, forneça um motivo.</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label htmlFor={`reject-reason-${consulta.id}`} className="text-sm">
                Motivo da recusa
              </Label>
              <Textarea id={`reject-reason-${consulta.id}`} placeholder="Digite o motivo da recusa..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="mt-2 min-h-[100px]" />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || rejectMutation.isPending || !consulta.id}>
                {rejectMutation.isPending ? "Recusando..." : "Confirmar Recusa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

// COMPONENTE ORIGINAL PARA EXAMES (AGORA SÓ EXAMES)
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

  // Determinar tipo de agendamento - AGORA SÓ EXAMES
  const isExameSchedule = schedule.Exame && schedule.Exame.length > 0;

  // Obter data e hora baseadas no tipo
  const getScheduleDateTime = () => {
    if (isExameSchedule && schedule.Exame?.[0]) {
      return {
        date: schedule.Exame[0].data_agendamento,
        time: schedule.Exame[0].hora_agendamento,
      };
    }

    return {
      date: schedule.data_agendamento || "",
      time: schedule.hora_agendamento || "",
    };
  };

  const scheduleInfo = getScheduleDateTime();

  // Calcular preço total - APENAS PARA EXAMES
  const getTotalPrice = () => {
    if (isExameSchedule) {
      return schedule.Exame?.reduce((total, exam) => total + (exam.Tipo_Exame?.preco || 0), 0) || 0;
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

  // Renderizar conteúdo APENAS para exames
  const renderScheduleContent = () => {
    if (!isExameSchedule) {
      return null;
    }
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
  };

  return (
    <Card className="w-full transition-shadow duration-200 hover:shadow-lg border-l-4 border-l-purple-500">
      <CardHeader className="p-4">
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarFallback className="bg-purple-500 text-white font-semibold">{getPatientInitials()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  Exames
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
        {/* Data e Hora - Layout normal para exames */}
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
              <DialogDescription>Você está recusando um agendamento de exames para {schedule.Paciente?.nome_completo}. Por favor, forneça um motivo.</DialogDescription>
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

// COMPONENTE PRINCIPAL QUE GERENCIA AMBOS OS TIPOS
export function AllPendingSchedules() {
  const { data: pendingSchedules } = useQuery({
    queryKey: ["pending-schedules"],
    queryFn: async () => {
      const response = await _axios.get("/schedulings/pending");
      return response.data || [];
    },
  });

  const { data: pendingConsultations } = useQuery({
    queryKey: ["pending-consultations"],
    queryFn: async () => {
      const response = await _axios.get("/consultations/pending");
      return response.data?.data || [];
    },
  });

  const exames = pendingSchedules || [];
  const consultas = pendingConsultations || [];

    const { data: pendingSchedule } = useQuery({
      queryKey: ["pending-schedule"],
      queryFn: async () => {
        const response = await _axios.get("/consultations/pending");
        return response.data;
      },
    });  
    const consulta = pendingSchedule?.data;

  return (
    <div className="flex w-full gap-5 m-auto space-y-4">
      {/* Seção de Consultas */}
      {consultas.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Consultas Pendentes ({consulta.length})</h2>
          </div>
          {consultas.map((consulta: ConsultasType) => (
            <ConsultaScheduleCard key={`consulta-${consulta.id}`} consulta={consulta} />
          ))}
        </div>
      )}

      {/* Seção de Exames */}
      {exames.length > 0 && (
        <div className="">
          <div className="flex -mt-3 items-center gap-2 mb-2">
            <Stethoscope className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Exames Pendentes ({exames.length})</h2>
          </div>
          {exames.map((schedule: ScheduleType) => (
            <PendingScheduleCard key={`exame-${schedule.id}`} schedule={schedule} />
          ))}
        </div>
      )}
    </div>
  );
}

// export default function PendingSchedulesPage() {
//   return (
//     <div className="container mx-auto p-4">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Agendamentos Pendentes</h1>
//         <p className="text-gray-600">Gerencie exames e consultas aguardando aprovação</p>
//       </div>

//       <AllPendingSchedules />
//     </div>
//   );
// }
