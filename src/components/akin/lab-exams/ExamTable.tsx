"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  Play,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatCurrency } from "@/utils/formartCurrency";

interface ExamTableProps {
  exams: ExamsType[];
  onEdit?: (exam: ExamsType) => void;
  onView?: (exam: ExamsType) => void;
  onStart?: (exam: ExamsType) => void;
  showActions?: boolean;
}

export function ExamTable({ exams, onEdit, onView, onStart, showActions = true }: ExamTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (examId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(examId)) {
      newExpandedRows.delete(examId);
    } else {
      newExpandedRows.add(examId);
    }
    setExpandedRows(newExpandedRows);
  };

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
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Exame</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Preço</TableHead>
            {showActions && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <>
              <TableRow key={exam.id} className="hover:bg-gray-50">
                <TableCell>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(exam.id)}
                        className="w-full p-0"
                      >
                        {expandedRows.has(exam.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="Paciente" />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{exam?.Tipo_Exame?.nome}</div>
                      <div className="text-sm text-gray-500">Paciente: {exam.Agendamento.Paciente.nome_completo}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(exam.data_agendamento)}</TableCell>
                <TableCell>{exam.hora_agendamento}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(exam.status)}>
                    {getStatusIcon(exam.status)}
                    <span className="ml-1">{formatStatus(exam.status)}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPaymentStatusColor(exam.status_pagamento)}>
                    {formatPaymentStatus(exam.status_pagamento)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium"> {formatCurrency(exam?.Tipo_Exame?.preco ?? 0)}</TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {onView && (
                        <Button variant="outline" size="sm" onClick={() => onView(exam)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(exam)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onStart && exam.status.toLowerCase() === 'pendente' && (
                        <Button size="sm" onClick={() => onStart(exam)} className="bg-akin-turquoise text-white hover:bg-akin-turquoise">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>

              {expandedRows.has(exam.id) && (
                <TableRow>
                  <TableCell colSpan={showActions ? 8 : 7} className="bg-gray-50">
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Tipo de Exame:</p>
                          <p className="text-sm text-gray-600">{exam?.Tipo_Exame?.nome}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Técnico Alocado:</p>
                          <p className="text-sm text-gray-600">
                            {exam.id_tecnico_alocado || 'Não alocado'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Criado em:</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(exam.criado_aos), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Última atualização:</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(exam.atualizado_aos), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
