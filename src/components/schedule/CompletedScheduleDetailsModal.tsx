"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, User, Phone, Stethoscope, CheckCircle, XCircle, AlertCircle, Edit3, Mail, Calendar, Users, Save, X, FileText, DollarSign, CreditCard, Shield } from "lucide-react";
import { format, addDays, subDays, isToday, isTomorrow, isYesterday, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { _axios } from "@/Api/axios.config";
import { ___showSuccessToastNotification, ___showErrorToastNotification } from "@/lib/sonner";
import { getAllDataInCookies } from "@/utils/get-data-in-cookies";
import { labTechniciansRoutes } from "@/Api/Routes/lab-technicians/index.routes";
import { labChiefRoutes } from "@/Api/Routes/lab-chief/index.routes";
import { examRoutes } from "@/Api/Routes/Exam/index.route";

interface CompletedScheduleDetailsModalProps {
  schedule: CompletedScheduleType | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EditableExam {
  id: number;
  data_agendamento: string;
  hora_agendamento: string;
  status: string;
  id_tipo_exame?: number;
  observacoes?: string;
  id_tecnico_alocado?: string | null;
}

interface ExamType {
  id: number;
  nome: string;
  preco: number;
  descricao?: string;
}

interface TimeSlot {
  time: string;
  formattedTime: string;
  period: "manhã" | "tarde" | "noite";
}

// Componente para o carrossel de datas (versão compacta)
function DateCarousel({ selectedDate, onDateSelect }: { selectedDate: string; onDateSelect: (date: string) => void }) {
  const [dates, setDates] = useState<Array<{ date: Date; formattedDate: string; label: string }>>([]);

  useEffect(() => {
    const today = startOfDay(new Date());
    const dateList = [];

    // Gera 10 dias (5 antes, 5 depois) para ser mais compacto
    for (let i = -5; i <= 5; i++) {
      const date = addDays(today, i);
      const formattedDate = format(date, "yyyy-MM-dd");

      let label = format(date, "dd/MM");
      if (isToday(date)) label = "Hoje";
      else if (isTomorrow(date)) label = "Amanhã";
      else if (isYesterday(date)) label = "Ontem";
      else if (i === -2) label = "Anteontem";

      dateList.push({
        date,
        formattedDate,
        label,
      });
    }

    setDates(dateList);
  }, []);

  return (
    <div className="relative">
      <div className="flex overflow-x-auto py-1 space-x-1.5 scrollbar-hide">
        {dates.map((dateItem) => {
          const isSelected = selectedDate === dateItem.formattedDate;
          const isWeekend = dateItem.date.getDay() === 0 || dateItem.date.getDay() === 6;

          return (
            <button
              key={dateItem.formattedDate}
              onClick={() => onDateSelect(dateItem.formattedDate)}
              className={`
                flex-shrink-0 w-16 px-2 py-1.5 rounded-md border transition-all duration-200 text-xs
                ${isSelected ? "bg-blue-600 text-white border-blue-600" : isWeekend ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}
              `}
            >
              <div className="text-center">
                <div className={`text-[10px] font-medium ${isSelected ? "text-white" : "text-gray-500"}`}>
                  {format(dateItem.date, "EEE", { locale: ptBR }).slice(0, 3)}
                </div>
                <div className={`text-sm font-bold ${isSelected ? "text-white" : "text-gray-900"}`}>{dateItem.label}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Componente para o carrossel de horários (versão compacta)
function TimeCarousel({ selectedTime, onTimeSelect }: { selectedTime: string; onTimeSelect: (time: string) => void }) {
  const timeSlots: TimeSlot[] = [
    // Manhã
    { time: "08:00", formattedTime: "08:00", period: "manhã" },
    { time: "08:30", formattedTime: "08:30", period: "manhã" },
    { time: "09:00", formattedTime: "09:00", period: "manhã" },
    { time: "09:30", formattedTime: "09:30", period: "manhã" },
    { time: "10:00", formattedTime: "10:00", period: "manhã" },
    { time: "10:30", formattedTime: "10:30", period: "manhã" },
    { time: "11:00", formattedTime: "11:00", period: "manhã" },
    { time: "11:30", formattedTime: "11:30", period: "manhã" },
    // Tarde
    { time: "13:00", formattedTime: "13:00", period: "tarde" },
    { time: "13:30", formattedTime: "13:30", period: "tarde" },
    { time: "14:00", formattedTime: "14:00", period: "tarde" },
    { time: "14:30", formattedTime: "14:30", period: "tarde" },
    { time: "15:00", formattedTime: "15:00", period: "tarde" },
    { time: "15:30", formattedTime: "15:30", period: "tarde" },
    { time: "16:00", formattedTime: "16:00", period: "tarde" },
    { time: "16:30", formattedTime: "16:30", period: "tarde" },
    { time: "17:00", formattedTime: "17:00", period: "tarde" },
    { time: "17:30", formattedTime: "17:30", period: "tarde" },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState<"manhã" | "tarde" | "todos">("manhã");

  const filteredTimeSlots = timeSlots.filter((slot) => selectedPeriod === "todos" || slot.period === selectedPeriod);

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 flex-wrap">
        <Button
          variant={selectedPeriod === "manhã" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedPeriod("manhã")}
          className="text-xs h-7 px-2"
        >
          Manhã
        </Button>
        <Button
          variant={selectedPeriod === "tarde" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedPeriod("tarde")}
          className="text-xs h-7 px-2"
        >
          Tarde
        </Button>
        <Button
          variant={selectedPeriod === "todos" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedPeriod("todos")}
          className="text-xs h-7 px-2"
        >
          Todos
        </Button>
      </div>

      <div className="flex overflow-x-auto py-1 space-x-1.5 scrollbar-hide">
        {filteredTimeSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;

          return (
            <button
              key={slot.time}
              onClick={() => onTimeSelect(slot.time)}
              className={`
                flex-shrink-0 px-2.5 py-1.5 rounded-md border transition-all duration-200 text-xs
                ${isSelected ? "bg-green-600 text-white border-green-600" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}
              `}
            >
              <div className="text-center">
                <div className="font-medium">{slot.formattedTime}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CompletedScheduleDetailsModal({ schedule, isOpen, onClose }: CompletedScheduleDetailsModalProps) {
  const [editingExam, setEditingExam] = useState<number | null>(null);
  const [editedExam, setEditedExam] = useState<EditableExam | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [selectedChief, setSelectedChief] = useState<string | null>(null);
  const [localExams, setLocalExams] = useState<any[]>([]);

  const queryClient = useQueryClient();
  const userRole = getAllDataInCookies().userRole;
  const isReceptionist = userRole === "RECEPCIONISTA";
  const isLabChief = userRole === "CHEFE";
  const isLabTechnician = userRole === "TECNICO";

  const { data: technicians } = useQuery({
    queryKey: ["lab-technicians"],
    queryFn: async () => (await labTechniciansRoutes.getAllLabTechnicians()).data,
    enabled: isLabChief || isLabTechnician,
  });

  const { data: labChiefs } = useQuery({
    queryKey: ["lab-chiefs"],
    queryFn: async () => await labChiefRoutes.getAllLabChief(),
    enabled: isReceptionist,
  });

  const { data: examTypesResponse } = useQuery({
    queryKey: ["exam-types"],
    queryFn: async () => await examRoutes.getExamTypes(),
    enabled: isReceptionist || isLabChief || isLabTechnician,
  });

  // Extrai o array de tipos de exame da resposta
  const examTypes = examTypesResponse?.data || [];

  // Atualiza os exames locais quando o schedule muda
  useEffect(() => {
    if (schedule?.Exame) {
      // Filtra exames que não estão concluídos (conforme regra 1)
      const activeExams = schedule.Exame.filter((exam) => exam.status !== "CONCLUIDO");
      setLocalExams(activeExams);
    }
  }, [schedule]);

  const updateExamMutation = useMutation({
    mutationFn: async (data: { examId: number; updates: Partial<EditableExam> }) => {
      const updatePayload: any = { ...data.updates };

      // Se o usuário é recepcionista, não pode marcar como CONCLUIDO
      if (isReceptionist && updatePayload.status === "CONCLUIDO") {
        ___showErrorToastNotification({
          message: "Recepcionistas não podem marcar exames como concluídos.",
        });
        throw new Error("Recepcionistas não podem marcar exames como concluídos.");
      }

      return await examRoutes.editExam(data.examId, updatePayload);
    },
    onSuccess: (response, variables) => {
      ___showSuccessToastNotification({ message: "Exame atualizado com sucesso!" });

      // Atualiza o cache do React Query
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });

      // Atualiza o estado local imediatamente
      setLocalExams((prev) =>
        prev.map((exam) => {
          if (exam.id === variables.examId) {
            const updatedExam = { ...exam, ...variables.updates };

            // Atualiza o tipo de exame se foi alterado
            if (variables.updates.id_tipo_exame && examTypes) {
              const newExamType = examTypes.find((et: ExamType) => et.id === variables.updates.id_tipo_exame);
              if (newExamType) {
                updatedExam.Tipo_Exame = newExamType;
                updatedExam.id_tipo_exame = newExamType.id;
              }
            }

            return updatedExam;
          }
          return exam;
        })
      );

      setEditingExam(null);
      setEditedExam(null);
    },
    onError: (error: any) => {
      console.error("Update exam error:", error);
      ___showErrorToastNotification({
        message: error.response?.data?.message || "Erro ao atualizar exame.",
      });
    },
  });

  const allocateTechnicianMutation = useMutation({
    mutationFn: async (data: { examId: number; technicianId: string }) => (await _axios.patch(`/exams/${data.examId}`, { id_tecnico_alocado: data.technicianId })).data,
    onSuccess: (response, variables) => {
      ___showSuccessToastNotification({ message: "Técnico alocado com sucesso!" });

      // Atualiza o cache
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });

      // Atualiza o estado local
      setLocalExams((prev) => prev.map((exam) => (exam.id === variables.examId ? { ...exam, id_tecnico_alocado: variables.technicianId } : exam)));

      setSelectedTechnician(null);
    },
    onError: () => ___showErrorToastNotification({ message: "Erro ao alocar técnico." }),
  });

  const allocateChiefMutation = useMutation({
    mutationFn: async (data: { scheduleId: number; chiefId: string }) => labChiefRoutes.allocateLabChief(data.scheduleId, data.chiefId),
    onSuccess: () => {
      ___showSuccessToastNotification({ message: "Chefe alocado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      setSelectedChief(null);
    },
    onError: () => ___showErrorToastNotification({ message: "Erro ao alocar chefe." }),
  });

  if (!schedule) return null;

  // Verifica se há pagamento pendente (regra 02)
  const hasPendingPayment = schedule.Exame?.some((exam) => exam.status_pagamento === "PENDENTE");

  // Calcula o status geral do bloco (conforme regras)
  const calculateOverallScheduleStatus = () => {
    const exams = schedule.Exame || [];

    // Regra: Se pelo menos um exame está pendente, status geral é pendente
    if (exams.some((exam) => exam.status === "PENDENTE")) {
      return "PENDENTE";
    }

    // Regra: Se todos os exames são concluídos, status geral é concluído
    if (exams.every((exam) => exam.status === "CONCLUIDO")) {
      return "CONCLUIDO";
    }

    // Regra: Se há exame "POR_REAGENDAR" e outros "CANCELADO" ou "CONCLUIDO", status é "POR_REAGENDAR"
    if (exams.some((exam) => exam.status === "POR_REAGENDAR")) {
      return "POR_REAGENDAR";
    }

    // Regra: Se todos os exames são cancelados, status geral é cancelado
    if (exams.every((exam) => exam.status === "CANCELADO")) {
      return "CANCELADO";
    }

    return "PENDENTE"; // default
  };

  const overallStatus = calculateOverallScheduleStatus();

  // Usa os exames locais (que podem ter sido atualizados) ou os originais do schedule
  const activeExams = localExams.length > 0 ? localExams : schedule.Exame?.filter((exam) => exam.status !== "CONCLUIDO") || [];

  // Se todos os exames estão concluídos, não mostrar (regra 1)
  if (overallStatus === "CONCLUIDO") return null;

  const getPatientAge = () => {
    if (!schedule.Paciente?.data_nascimento) return "N/A";
    const birthDate = new Date(schedule.Paciente.data_nascimento);
    const now = new Date();
    const diffTime = now.getTime() - birthDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + now.getMonth() - birthDate.getMonth();
    const diffYears = now.getFullYear() - birthDate.getFullYear();
    if (diffYears > 0) return `${diffYears} ano${diffYears > 1 ? "s" : ""}`;
    if (diffMonths > 0) return `${diffMonths} mês${diffMonths > 1 ? "es" : ""}`;
    return `${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  };

  const getPatientInitials = () =>
    (schedule.Paciente?.nome_completo || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getExamStatusBadge = (status: string) => {
    const mapping = {
      PENDENTE: { text: "Pendente", color: "yellow", icon: AlertCircle },
      CANCELADO: { text: "Cancelado", color: "red", icon: XCircle },
      POR_REAGENDAR: { text: "Por Reagendar", color: "orange", icon: CalendarDays },
      EM_ANDAMENTO: { text: "Em Andamento", color: "blue", icon: Clock },
      CONCLUIDO: { text: "Concluído", color: "green", icon: CheckCircle },
    } as any;

    const info = mapping[status] || { text: status, color: "gray", icon: AlertCircle };
    const Icon = info.icon;

    return (
      <Badge variant="default" className={`bg-${info.color}-100 text-${info.color}-800 border-${info.color}-200 flex items-center gap-1 text-xs px-2 py-0.5`}>
        <Icon className="w-3 h-3" /> {info.text}
      </Badge>
    );
  };

  const getTechnicianName = (id: string | null) => {
    if (!id || !technicians) return "Não alocado";
    return technicians.find((t) => t.id === id)?.nome || "Técnico não encontrado";
  };

  const getChiefName = (id: string | null) => {
    if (!id || !labChiefs) return "Não alocado";
    return labChiefs.find((c) => c.id === id)?.nome || "Chefe não encontrado";
  };

  const totalValue = activeExams?.reduce((acc, exam) => acc + (exam.Tipo_Exame?.preco || 0), 0) || 0;

  const handleEditExam = (exam: any) => {
    setEditingExam(exam.id);
    setEditedExam({
      id: exam.id,
      data_agendamento: exam.data_agendamento,
      hora_agendamento: exam.hora_agendamento,
      status: exam.status,
      id_tipo_exame: exam.id_tipo_exame || exam.Tipo_Exame?.id,
      id_tecnico_alocado: exam.id_tecnico_alocado || null,
    });
  };

  const handleSaveExam = () => {
    if (!editedExam) return;

    updateExamMutation.mutate({
      examId: editedExam.id,
      updates: {
        data_agendamento: editedExam.data_agendamento,
        hora_agendamento: editedExam.hora_agendamento,
        status: editedExam.status,
        id_tipo_exame: editedExam.id_tipo_exame,
        id_tecnico_alocado: editedExam.id_tecnico_alocado,
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingExam(null);
    setEditedExam(null);
  };

  const handleExamFieldChange = (field: keyof EditableExam, value: any) => {
    if (!editedExam) return;

    // Se está mudando o tipo de exame, atualiza também o preço no estado local
    if (field === "id_tipo_exame" && Array.isArray(examTypes)) {
      const selectedExamType = examTypes.find((et: ExamType) => et.id === parseInt(value));
      if (selectedExamType) {
        setEditedExam({
          ...editedExam,
          [field]: value,
        });

        // Atualiza o exame local com o novo tipo
        setLocalExams((prev) =>
          prev.map((exam) => {
            if (exam.id === editedExam.id) {
              return {
                ...exam,
                Tipo_Exame: selectedExamType,
                id_tipo_exame: selectedExamType.id,
              };
            }
            return exam;
          })
        );

        return;
      }
    }

    setEditedExam({ ...editedExam, [field]: value });
  };

  // Funções para o carrossel
  const handleDateSelect = (date: string) => {
    if (editedExam) {
      setEditedExam({ ...editedExam, data_agendamento: date });
    }
  };

  const handleTimeSelect = (time: string) => {
    if (editedExam) {
      setEditedExam({ ...editedExam, hora_agendamento: time });
    }
  };

  // Função para verificar se pode inicializar exame (regra 02)
  const canInitializeExam = (exam: any) => {
    if (exam.status_pagamento !== "PAGO") return false;
    if (!isLabChief && !isLabTechnician) return false;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="sticky top-0 bg-white z-10 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Agendamento #{schedule.id}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">Paciente: {schedule.Paciente?.nome_completo}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{getPatientAge()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getExamStatusBadge(overallStatus)}
              <DialogClose className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="px-6 py-4 space-y-4">
            {/* Status Overview Card */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      Status do Bloco
                    </div>
                    <div className="font-medium">{getExamStatusBadge(overallStatus)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      Status do Pagamento
                    </div>
                    <div className={`font-medium ${hasPendingPayment ? "text-amber-600" : "text-green-600"}`}>
                      {hasPendingPayment ? "Pendente" : "Pago"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Data de Criação
                    </div>
                    <div className="font-medium text-sm">
                      {format(new Date(schedule.criado_aos), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      Valor Total
                    </div>
                    <div className="font-medium text-green-600 text-sm">
                      {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(totalValue)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Paciente */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informações do Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0 flex justify-center sm:justify-start">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="" alt={schedule.Paciente?.nome_completo} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                        {getPatientInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <div>
                      <Label className="text-xs text-gray-500">Nome Completo</Label>
                      <p className="font-medium mt-1">{schedule.Paciente?.nome_completo}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Idade</Label>
                      <p className="font-medium mt-1">{getPatientAge()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">BI/Identificação</Label>
                      <p className="font-medium mt-1 text-sm">
                        {schedule.Paciente?.numero_identificacao || "Não informado"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Telefone</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span className="font-medium">{schedule.Paciente?.contacto_telefonico}</span>
                      </div>
                    </div>
                    {schedule.Paciente?.email && (
                      <div className="sm:col-span-2">
                        <Label className="text-xs text-gray-500">Email</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span className="font-medium text-sm truncate">{schedule.Paciente.email}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-gray-500">Sexo</Label>
                      <p className="font-medium mt-1">{schedule.Paciente?.sexo?.nome || "Não informado"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chefe alocado (apenas para recepcionistas) */}
            {isReceptionist && (
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Chefe de Laboratório
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Chefe Atual</Label>
                      <p className="font-medium mt-1">{getChiefName(schedule.id_chefe_alocado || null)}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select value={selectedChief || ""} onValueChange={setSelectedChief}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecionar novo chefe" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(labChiefs) &&
                            labChiefs.map((chief) => (
                              <SelectItem key={chief.id} value={chief.id}>
                                {chief.nome} - {chief.tipo}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => selectedChief && allocateChiefMutation.mutate({ scheduleId: schedule.id, chiefId: selectedChief })}
                        disabled={!selectedChief || allocateChiefMutation.isPending}
                        className="sm:w-auto"
                      >
                        {allocateChiefMutation.isPending ? "Alocando..." : "Alocar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exames ativos */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Exames ({activeExams.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeExams.map((exam, index) => {
                  const currentPrice = exam.Tipo_Exame?.preco || 0;

                  return (
                    <div key={exam.id} className="border rounded-lg p-4 space-y-3">
                      {/* Cabeçalho do exame */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{exam.Tipo_Exame?.nome || "Exame não especificado"}</h4>
                          <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
                            Exame:
                            {getExamStatusBadge(exam.status)}
                            <p>Pagamento: </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${exam.status_pagamento === "PAGO" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                              {exam.status_pagamento === "PAGO" ? "Pago" : "Pendente"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {editingExam === exam.id ? (
                            <div className="flex gap-2">
                              <Button variant="default" size="sm" onClick={handleSaveExam} disabled={updateExamMutation.isPending}>
                                <Save className="w-3 h-3 mr-1" />
                                Salvar
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={updateExamMutation.isPending}>
                                <X className="w-3 h-3 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleEditExam(exam)}>
                              <Edit3 className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                          )}

                          {/* Botão para inicializar exame */}
                          {(isLabChief || isLabTechnician) && canInitializeExam(exam) && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                console.log("Inicializar exame:", exam.id);
                              }}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Iniciar
                            </Button>
                          )}
                        </div>
                      </div>

                      {editingExam === exam.id && editedExam ? (
                        <div className="space-y-4 pt-3 border-t">
                          {/* Tipo de Exame e Status */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm">Tipo de Exame</Label>
                              <Select value={editedExam.id_tipo_exame?.toString() || ""} onValueChange={(value) => handleExamFieldChange("id_tipo_exame", parseInt(value))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.isArray(examTypes) &&
                                    examTypes.map((examType: ExamType) => (
                                      <SelectItem key={examType.id} value={examType.id.toString()}>
                                        {examType.nome} - {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(examType.preco)}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">Status</Label>
                              <Select value={editedExam.status} onValueChange={(value) => handleExamFieldChange("status", value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                  {!isReceptionist && <SelectItem value="CONCLUIDO">Concluído</SelectItem>}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Carrossel de Datas */}
                          <div>
                            <Label className="text-sm">Selecione a Data</Label>
                            <div className="mt-2">
                              <DateCarousel selectedDate={editedExam.data_agendamento} onDateSelect={handleDateSelect} />
                            </div>
                          </div>

                          {/* Carrossel de Horários */}
                          <div>
                            <Label className="text-sm">Selecione o Horário</Label>
                            <div className="mt-2">
                              <TimeCarousel selectedTime={editedExam.hora_agendamento} onTimeSelect={handleTimeSelect} />
                            </div>
                          </div>

                          {/* Inputs manuais */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm">Data</Label>
                              <Input
                                type="date"
                                value={editedExam.data_agendamento}
                                onChange={(e) => handleExamFieldChange("data_agendamento", e.target.value)}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Hora</Label>
                              <Input
                                type="time"
                                value={editedExam.hora_agendamento}
                                onChange={(e) => handleExamFieldChange("hora_agendamento", e.target.value)}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm pt-3 border-t">
                          <div>
                            <Label className="text-xs text-gray-500">Data e Hora</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <CalendarDays className="w-3 h-3 text-gray-500" />
                              <span className="font-medium">
                                {format(new Date(exam.data_agendamento), "dd/MM/yyyy", { locale: ptBR })} às {exam.hora_agendamento}
                              </span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Preço</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <DollarSign className="w-3 h-3 text-gray-500" />
                              <span className="font-medium text-green-600">
                                {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(currentPrice)}
                              </span>
                            </div>
                          </div>
                          {(isLabChief || isLabTechnician) && (
                            <div>
                              <Label className="text-xs text-gray-500">Técnico Alocado</Label>
                              <p className="font-medium mt-1">{getTechnicianName(exam.id_tecnico_alocado)}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Alocação de técnico (apenas para chefe) */}
                      {isLabChief && editingExam !== exam.id && (
                        <div className="pt-3 border-t">
                          <Label className="text-sm">Alocar Técnico</Label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Select value={selectedTechnician || ""} onValueChange={setSelectedTechnician}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Selecionar técnico" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.isArray(technicians) &&
                                  technicians.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                      {t.nome} - {t.tipo}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={() => selectedTechnician && allocateTechnicianMutation.mutate({ examId: exam.id, technicianId: selectedTechnician })}
                              disabled={!selectedTechnician || allocateTechnicianMutation.isPending}
                              className="sm:w-auto"
                            >
                              {allocateTechnicianMutation.isPending ? "Alocando..." : "Alocar"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}