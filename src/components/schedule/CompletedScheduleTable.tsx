"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  FileText,
  DollarSign,
} from "lucide-react";

interface CompletedScheduleTableProps {
  schedules: CompletedScheduleType[];
  onViewDetails?: (schedule: CompletedScheduleType) => void;
  onViewReport?: (schedule: CompletedScheduleType) => void;
}

export function CompletedScheduleTable({
  schedules,
  onViewDetails,
  onViewReport
}: CompletedScheduleTableProps) {
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);

  // Remove duplicados por ID
  const uniqueSchedules = useMemo(() => {
    const map = new Map<number, CompletedScheduleType>();
    schedules.forEach(s => map.set(s.id, s));
    return Array.from(map.values());
  }, [schedules]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSchedules(uniqueSchedules.map(s => s.id));
    } else {
      setSelectedSchedules([]);
    }
  };

  const handleSelectSchedule = (scheduleId: number, checked: boolean) => {
    if (checked) {
      setSelectedSchedules(prev => [...prev, scheduleId]);
    } else {
      setSelectedSchedules(prev => prev.filter(id => id !== scheduleId));
    }
  };

  const getPatientAge = (birthDate: string) => {
    if (!birthDate) return "N/A";
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    return `${age} anos`;
  };

  const getPatientInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getExamStatusBadge = (status: string) => {
    switch (status) {
      case "CONCLUIDO":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Concluído
          </Badge>
        );
      case "PENDENTE":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "CANCELADO":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAGO":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <DollarSign className="w-3 h-3 mr-1" />
            Pago
          </Badge>
        );
      case "PENDENTE":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "CANCELADO":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Grid responsivo para mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
        {uniqueSchedules.map(schedule => {
          const totalValue = schedule.Exame?.reduce((sum, exam) => sum + (exam.Tipo_Exame?.preco || 0), 0) || 0;
          const completedExams = schedule.Exame?.filter(e => e.status === "CONCLUIDO").length || 0;
          const totalExams = schedule.Exame?.length || 0;
          const paidExams = schedule.Exame?.filter(e => e.status_pagamento === "PAGO").length || 0;
          const hasAllocatedTechnician = schedule.Exame?.some(e => e.id_tecnico_alocado);

          return (
            <Card key={schedule.id} className="w-full transition-shadow duration-200 hover:shadow-lg">
              <CardHeader className="p-4">
                <div className="flex justify-between items-center text-sm">
                  {schedule.Paciente?.nome_completo || "Nome não disponível"}
                  <Checkbox
                    checked={selectedSchedules.includes(schedule.id)}
                    onCheckedChange={(checked) => handleSelectSchedule(schedule.id, checked as boolean)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" alt={schedule.Paciente?.nome_completo} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getPatientInitials(schedule.Paciente?.nome_completo || "")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{getPatientAge(schedule.Paciente?.data_nascimento || "")}</span>
                  <span className="text-xs text-gray-600">{schedule.Paciente?.contacto_telefonico || "N/A"}</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium">{totalExams} exame(s)</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {schedule.Exame?.slice(0, 3).map((exam, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {exam.Tipo_Exame?.nome}
                      </Badge>
                    ))}
                    {totalExams > 3 && <span className="text-blue-600 text-xs">+{totalExams - 3} mais</span>}
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex justify-between mt-1">
                  <span>{completedExams}/{totalExams} concluídos</span>
                  <span>{paidExams}/{totalExams} pagos</span>
                </div>
                <div className="text-xs font-medium">
                  {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(totalValue)}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className={`text-xs ${hasAllocatedTechnician ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {hasAllocatedTechnician ? "Alocado" : "Não alocado"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails?.(schedule)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewReport?.(schedule)}>
                        <FileText className="mr-2 h-4 w-4" /> Gerar Relatório
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabela para desktop */}
      <div className="hidden md:block overflow-x-auto">
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedSchedules.length === uniqueSchedules.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Exames</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead className="w-16">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueSchedules.map(schedule => {
                  const totalValue = schedule.Exame?.reduce((sum, exam) => sum + (exam.Tipo_Exame?.preco || 0), 0) || 0;
                  const completedExams = schedule.Exame?.filter(e => e.status === "CONCLUIDO").length || 0;
                  const totalExams = schedule.Exame?.length || 0;
                  const paidExams = schedule.Exame?.filter(e => e.status_pagamento === "PAGO").length || 0;
                  const hasAllocatedTechnician = schedule.Exame?.some(e => e.id_tecnico_alocado);

                  return (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSchedules.includes(schedule.id)}
                          onCheckedChange={(checked) => handleSelectSchedule(schedule.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>{schedule.Paciente?.nome_completo || "Nome não disponível"}</TableCell>
                      <TableCell>
                        {schedule.Exame?.slice(0, 3).map((exam, idx) => (
                          <Badge key={idx} variant="outline" className="mr-1 text-xs">
                            {exam.Tipo_Exame?.nome}
                          </Badge>
                        ))}
                        {totalExams > 3 && <span className="text-blue-600 text-xs">+{totalExams - 3}</span>}
                      </TableCell>
                      <TableCell>{completedExams}/{totalExams} concluídos</TableCell>
                      <TableCell>{paidExams}/{totalExams} pagos</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(totalValue)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${hasAllocatedTechnician ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {hasAllocatedTechnician ? "Alocado" : "Não alocado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails?.(schedule)}>
                              <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onViewReport?.(schedule)}>
                              <FileText className="mr-2 h-4 w-4" /> Gerar Relatório
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
