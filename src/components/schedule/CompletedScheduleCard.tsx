"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { CalendarDays, User, Phone, CreditCard, Stethoscope, CheckCircle, XCircle, AlertCircle, UserCheck, DollarSign, Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CompletedScheduleCardProps {
  schedule: CompletedScheduleType;
  onViewDetails?: (schedule: CompletedScheduleType) => void;
  onViewReport?: (schedule: CompletedScheduleType) => void;
}

export function CompletedScheduleCard({ schedule, onViewDetails, onViewReport }: CompletedScheduleCardProps) {
  const getPatientAge = () => {
    if (!schedule.Paciente?.data_nascimento) return "N/A";
    const birthDate = new Date(schedule.Paciente.data_nascimento);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return `${age} ${age > 1 ? "anos" : "ano"}`;
  };

  const getPatientInitials = () => {
    const name = schedule.Paciente?.nome_completo || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const formatTime = (timeString: string) => format(new Date(`2000-01-01T${timeString}`), "HH:mm");

  const getTotalPrice = () => schedule.Exame?.reduce((total, exam) => total + (exam.Tipo_Exame?.preco || 0), 0) || 0;

  const getPaidAmount = () => schedule.Exame?.filter((exam) => exam.status_pagamento === "PAGO").reduce((total, exam) => total + (exam.Tipo_Exame?.preco || 0), 0) || 0;

  const getExamStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "concluido":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pago":
        return "bg-green-100 text-green-800 border-green-200";
      case "pendente":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getExamStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "concluido":
        return <CheckCircle className="w-3 h-3" />;
      case "cancelado":
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  // Metrics
  const completedExams = schedule.Exame?.filter((e) => e.status === "CONCLUIDO").length || 0;
  const pendingExams = schedule.Exame?.filter((e) => e.status === "PENDENTE").length || 0;
  const cancelledExams = schedule.Exame?.filter((e) => e.status === "CANCELADO").length || 0;
  const totalExams = schedule.Exame?.length || 0;

  // Only show block if there are pending or non-concluded exams
  if (completedExams === totalExams && totalExams > 0) {
    return null; // block disappears from management view
  }

  return (
    <Card className="w-full transition-shadow duration-200 hover:shadow-lg">
      {/* Header */}
      <CardHeader className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left sm:justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-green-200">
              {(schedule.Paciente as any)?.foto ? <AvatarImage src={(schedule.Paciente as any)?.foto} alt={schedule.Paciente?.nome_completo} /> : <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold">{getPatientInitials()}</AvatarFallback>}
            </Avatar>

            <div className="min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{schedule.Paciente?.nome_completo}</h3>

              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 truncate">
                <span className="flex items-center bg-white px-2 py-1 rounded-md shadow-sm">
                  <User className="w-3 h-3 text-green-600" />
                  {schedule.Paciente?.numero_identificacao}
                </span>

                <span className="inline-flex items-center gap-1">{getPatientAge()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-6 p-4">
        {/* Agendamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 w-full">
            <div className="p-2 rounded-md bg-blue-500 text-white flex-shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-600 uppercase">Agendamento criado em</div>
              <div className="font-medium text-gray-900 truncate">{schedule.Exame?.length ? `${formatDate(schedule.Exame[0].data_agendamento)} às ${formatTime(schedule.Exame[0].hora_agendamento)}` : "Data não disponível"}</div>
            </div>
          </div>
        </div>

        {/* Dados do paciente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-xs text-gray-600 uppercase">Sexo</Label>
            <p className="font-semibold text-gray-900 mt-1">{schedule.Paciente?.sexo?.nome || "N/A"}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-xs text-gray-600 uppercase">Contacto</Label>
            <p className="font-semibold text-gray-900 flex items-center mt-1 break-all">
              <Phone className="w-4 h-4 mr-2 text-green-600" />
              {schedule.Paciente?.contacto_telefonico || "N/A"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Resumo exames */}
        <div>
          <Label className="text-gray-700 flex items-center mb-3 font-semibold">
            <div className="p-1.5 bg-purple-100 rounded-lg mr-2">
              <Stethoscope className="w-4 h-4 text-purple-600" />
            </div>
            Resumo dos Exames ({totalExams})
          </Label>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="font-semibold text-green-800">{completedExams}</div>
              <div className="text-xs text-green-600">Concluídos</div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="font-semibold text-yellow-800">{pendingExams}</div>
              <div className="text-xs text-yellow-600">Pendentes</div>
            </div>

            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="font-semibold text-red-800">{cancelledExams}</div>
              <div className="text-xs text-red-600">Cancelados</div>
            </div>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {schedule.Exame?.slice(0, 3).map((exam) => (
              <div key={exam.id} className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{exam.Tipo_Exame?.nome}</p>
                    <Badge className={getExamStatusColor(exam.status)} variant="outline">
                      {getExamStatusIcon(exam.status)}
                      {exam.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                    {formatDate(exam.data_agendamento)} às {formatTime(exam.hora_agendamento)}
                    <Badge className={getPaymentStatusColor(exam.status_pagamento)} variant="outline">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {exam.status_pagamento}
                    </Badge>
                  </div>

                  {exam.id_tecnico_alocado && (
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Técnico alocado
                    </p>
                  )}
                </div>

                <span className="text-sm text-purple-700 font-bold bg-purple-100 px-2 py-1 rounded-md ml-3">
                  {new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                    notation: "compact",
                  }).format(exam.Tipo_Exame?.preco || 0)}
                </span>
              </div>
            ))}

            {schedule.Exame && schedule.Exame.length > 3 && <div className="text-center text-sm text-gray-500 py-2">+{schedule.Exame.length - 3} exames adicionais</div>}
          </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <span className="flex items-center font-semibold text-green-800 mb-2">
              <div className="p-1.5 bg-green-500 rounded-lg mr-2">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              Valor Total
            </span>

            <span className="font-bold text-xl text-green-700">
              {new Intl.NumberFormat("pt-AO", {
                style: "currency",
                currency: "AOA",
              }).format(getTotalPrice())}
            </span>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
            <span className="flex items-center font-semibold text-blue-800 mb-2">
              <div className="p-1.5 bg-blue-500 rounded-lg mr-2">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              Valor Pago
            </span>

            <span className="font-bold text-xl text-blue-700">
              {new Intl.NumberFormat("pt-AO", {
                style: "currency",
                currency: "AOA",
              }).format(getPaidAmount())}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Rodapé */}
      <CardFooter className="flex flex-col gap-3 pt-4 bg-gray-50 border-t">
        <Button variant="outline" className="w-full" onClick={() => onViewDetails?.(schedule)}>
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalhes
        </Button>

        <Button variant="default" className="w-full bg-green-600 hover:bg-green-700" onClick={() => onViewReport?.(schedule)}>
          <FileText className="w-4 h-4 mr-2" />
          Relatório
        </Button>
      </CardFooter>
    </Card>
  );
}
