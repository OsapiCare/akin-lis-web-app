"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  CreditCard,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  Play
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/utils/formartCurrency";

interface ExamCardProps {
  exam: ExamsType;
  onEdit?: (exam: ExamsType) => void;
  onView?: (exam: ExamsType) => void;
  onStart?: (exam: ExamsType) => void;
  showActions?: boolean;
}

export function ExamCard({ exam, onEdit, onView, onStart, showActions = true }: ExamCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'concluido':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'nao_pago':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return <Clock className="h-4 w-4" />;
      case 'em_andamento':
        return <Stethoscope className="h-4 w-4" />;
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDENTE': 'Pendente',
      'EM_ANDAMENTO': 'Em Andamento',
      'CONCLUIDO': 'Concluído',
      'CANCELADO': 'Cancelado'
    };
    return statusMap[status.toUpperCase()] || status;
  };

  const formatPaymentStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PAGO': 'Pago',
      'NAO_PAGO': 'Não Pago'
    };
    return statusMap[status.toUpperCase()] || status;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col xl:flex-row xl:justify-between gap-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt="Paciente" />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{exam?.Tipo_Exame?.nome}</CardTitle>
              <p className="text-sm text-gray-600">ID: #{exam.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(exam.status)}>
              {getStatusIcon(exam.status)}
              <span className="ml-1">{formatStatus(exam.status)}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações do Paciente */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-sm text-gray-700">
            <User className="h-4 w-4 mr-2" />
            <span className="font-medium">Paciente: {exam.Agendamento.Paciente.nome_completo}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-2">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span>Data: {formatDate(exam.data_agendamento)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>Hora: {exam.hora_agendamento}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <CreditCard className="h-4 w-4 mr-2" />
              <span>Preço: {formatCurrency(exam?.Tipo_Exame?.preco ?? 0)}</span>
            </div>
            <div className="flex items-center text-sm">
              <Badge variant="outline" className={getPaymentStatusColor(exam.status_pagamento)}>
                {formatPaymentStatus(exam.status_pagamento)}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Tipo de Exame:</p>
          <p className="text-sm text-gray-600">{exam?.Tipo_Exame?.nome}</p>
        </div>

        {exam.id_tecnico_alocado && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span>Técnico: {exam.Tecnico_Laboratorio?.nome || 'Não alocado'}</span>
          </div>
        )}

        {showActions && (
          <div className="flex flex-col gap-2 pt-4 2xl:flex-row 2xl:justify-end">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(exam)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {onStart && exam.status.toLowerCase() === 'pendente' && (
              <Button size="sm" onClick={() => onStart(exam)} className="bg-akin-turquoise text-white hover:bg-akin-turquoise">
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
