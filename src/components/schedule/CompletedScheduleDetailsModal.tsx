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
import { CalendarDays, Clock, User, Phone, Stethoscope, CheckCircle, XCircle, AlertCircle, Edit3, Mail, Users, Save, X, FileText, DollarSign, CreditCard, Shield, ChevronDown } from "lucide-react";
import { format, parse, isValid, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { _axios } from "@/Api/axios.config";
import { ___showSuccessToastNotification, ___showErrorToastNotification } from "@/lib/sonner";
import { getAllDataInCookies } from "@/utils/get-data-in-cookies";
import { labTechniciansRoutes } from "@/Api/Routes/lab-technicians/index.routes";
import { labChiefRoutes } from "@/Api/Routes/lab-chief/index.routes";
import { examRoutes } from "@/Api/Routes/Exam/index.route";
import TimePicker from "@/components/ui/timepicker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

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

// Função para converter string no formato yy/M/d para Date - MELHORADA
const parseFromYYMMDD = (dateString: string): Date | null => {
  if (!dateString || dateString.trim() === "") return null;

  try {
    const trimmedString = dateString.trim();

    // Primeiro tenta como ISO string (formato do backend: YYYY-MM-DD)
    try {
      const isoDate = new Date(trimmedString);
      if (isValid(isoDate)) {
        return isoDate;
      }
    } catch {
      // Continua
    }

    // Tenta no formato yy/M/d
    if (trimmedString.includes("/")) {
      const parts = trimmedString.split("/").map((part) => part.trim());

      if (parts.length === 3) {
        let year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexed
        const day = parseInt(parts[2], 10);

        // Verifica se os valores são números válidos
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          // Se ano tem 2 dígitos, assume 2000+
          if (year < 100) {
            year = 2000 + year;
          }

          const parsed = new Date(year, month, day);

          // Verifica se a data é válida
          if (isValid(parsed) && parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day) {
            return parsed;
          }
        }
      }
    }

    // Tenta outros formatos comuns com date-fns
    const formats = ["dd/MM/yyyy", "dd-MM-yyyy", "yyyy/MM/dd", "yyyy-MM-dd", "yy/MM/dd", "yy-MM-dd", "yy/M/d", "yyyy/M/d"];

    for (const fmt of formats) {
      try {
        const parsed = parse(trimmedString, fmt, new Date());
        if (isValid(parsed)) {
          return parsed;
        }
      } catch {
        continue;
      }
    }

    console.warn(`Não foi possível parsear a data: "${dateString}"`);
    return null;
  } catch (error) {
    console.error("Erro ao parsear data:", error, "String:", dateString);
    return null;
  }
};

// Função para converter Date para string no formato yy/M/d
const formatToYYMMDD = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) return "";

  try {
    return format(date, "yy/M/d");
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "";
  }
};

// Função para verificar se uma data é válida para agendamento
const isValidScheduleDate = (date: Date): boolean => {
  const today = startOfDay(new Date());
  const selectedDate = startOfDay(date);

  // Verifica se a data selecionada é hoje ou no futuro
  return !isBefore(selectedDate, today);
};

export function CompletedScheduleDetailsModal({ schedule, isOpen, onClose }: CompletedScheduleDetailsModalProps) {
  const [editingExam, setEditingExam] = useState<number | null>(null);
  const [editedExam, setEditedExam] = useState<EditableExam | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [selectedChief, setSelectedChief] = useState<string | null>(null);
  const [localExams, setLocalExams] = useState<any[]>([]);
  const [calendarDates, setCalendarDates] = useState<Map<number, Date | null>>(new Map());
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setInputValue(value);

    // Tentar parsear a data no formato dd/MM/yy ou dd/MM/yyyy
    const formats = ["dd/MM/yy", "dd/MM/yyyy", "dd-MM-yy", "dd-MM-yyyy"];
    let parsedDate = null;

    for (const fmt of formats) {
      parsedDate = parse(value, fmt, new Date());
      if (isValid(parsedDate) && !isBefore(startOfDay(parsedDate), startOfDay(new Date()))) {
        setCalendarDate(parsedDate ?? null);
        break;
      }
    }

    // Se não for válido, limpar a data
    if (!parsedDate || !isValid(parsedDate)) {
      setCalendarDate(null);
    }
  };

  const handleCalendarSelect = (date: any) => {
    if (date) {
      setCalendarDate(date);
      setInputValue(format(date, "dd/MM/yy"));
      setIsPopoverOpen(false);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCalendarDate(today);
    setInputValue(format(today, "dd/MM/yy"));
    setIsPopoverOpen(false);
  };

  // Extrai o array de tipos de exame da resposta
  const examTypes = examTypesResponse?.data || [];

  // Atualiza os exames locais quando o schedule muda
  useEffect(() => {
    if (schedule?.Exame) {
      // Filtra exames que não estão concluídos (conforme regra 1)
      const activeExams = schedule.Exame.filter((exam) => exam.status !== "CONCLUIDO");

      // Converte as datas para o formato yy/M/d e prepara as datas para o calendar
      const examsWithFormattedDates = activeExams.map((exam) => {
        try {
          // Tenta converter a data do backend para o formato de exibição
          let formattedDate = "";
          let dateObj: Date | null = null;

          if (exam.data_agendamento) {
            // Primeiro tenta parsear como ISO string
            dateObj = new Date(exam.data_agendamento);

            if (!isValid(dateObj)) {
              // Se falhar, tenta nosso parser customizado
              dateObj = parseFromYYMMDD(exam.data_agendamento);
            }

            if (dateObj && isValid(dateObj)) {
              formattedDate = format(dateObj, "yy/M/d");
            } else {
              // Fallback para data atual
              console.warn(`Data inválida para exame ${exam.id}: ${exam.data_agendamento}`);
              dateObj = new Date();
              formattedDate = format(dateObj, "yy/M/d");
            }
          } else {
            // Se não há data, usa data atual
            dateObj = new Date();
            formattedDate = format(dateObj, "yy/M/d");
          }

          return {
            ...exam,
            data_agendamento: formattedDate,
            originalDate: dateObj,
          };
        } catch (error) {
          console.error(`Erro ao processar data do exame ${exam.id}:`, error);
          return {
            ...exam,
            data_agendamento: format(new Date(), "yy/M/d"),
            originalDate: new Date(),
          };
        }
      });

      setLocalExams(examsWithFormattedDates);

      // Inicializa as datas do calendar
      const datesMap = new Map<number, Date | null>();
      examsWithFormattedDates.forEach((exam) => {
        const date = exam.originalDate || parseFromYYMMDD(exam.data_agendamento);
        datesMap.set(exam.id, date);
      });
      setCalendarDates(datesMap);
    }
  }, [schedule]);

  // Atualiza as datas do calendar quando um exame está sendo editado
  useEffect(() => {
    if (editedExam) {
      const date = parseFromYYMMDD(editedExam.data_agendamento);
      setCalendarDates((prevMap) => new Map(prevMap.set(editedExam.id, date)));
    }
  }, [editedExam]);

  // Limpa estados quando a modal fecha
  useEffect(() => {
    if (!isOpen) {
      setEditingExam(null);
      setEditedExam(null);
      setSelectedTechnician(null);
      setSelectedChief(null);
    }
  }, [isOpen]);

  const updateExamMutation = useMutation({
    mutationFn: async (data: { examId: number; updates: Partial<EditableExam> }) => {
      const updatePayload: any = { ...data.updates };

      // Converte a data de volta para o formato do banco se necessário
      if (updatePayload.data_agendamento) {
        try {
          const date = parseFromYYMMDD(updatePayload.data_agendamento);
          if (date && isValid(date)) {
            // Formato YYYY-MM-DD para o backend
            updatePayload.data_agendamento = format(date, "yyyy-MM-dd");
          } else {
            // Se não conseguir parsear, mantém o valor original
            console.warn("Não foi possível converter a data para o formato do backend:", updatePayload.data_agendamento);
          }
        } catch (error) {
          console.error("Erro ao converter data:", error);
        }
      }

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

      // Atualiza o cache do React Query AGressivamente
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });

      // Atualiza o estado local imediatamente
      setLocalExams((prev) =>
        prev.map((exam) => {
          if (exam.id === variables.examId) {
            const updatedExam = { ...exam, ...variables.updates };

            // Formata a data para o formato yy/M/d para exibição
            if (variables.updates.data_agendamento) {
              try {
                // A data vem do backend no formato YYYY-MM-DD
                const date = new Date(variables.updates.data_agendamento);
                if (isValid(date)) {
                  updatedExam.data_agendamento = format(date, "yy/M/d");
                }
              } catch (error) {
                console.error("Erro ao formatar data para exibição:", error);
                updatedExam.data_agendamento = format(new Date(), "yy/M/d");
              }
            }

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

  const handleForceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
    queryClient.refetchQueries({ queryKey: ["completed-schedules"] });
    ___showSuccessToastNotification({ message: "Dados recarregados!" });
  };

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
    try {
      const birthDate = new Date(schedule.Paciente.data_nascimento);
      if (!isValid(birthDate)) return "N/A";

      const now = new Date();
      const diffTime = now.getTime() - birthDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + now.getMonth() - birthDate.getMonth();
      const diffYears = now.getFullYear() - birthDate.getFullYear();

      if (diffYears > 0) return `${diffYears} ano${diffYears > 1 ? "s" : ""}`;
      if (diffMonths > 0) return `${diffMonths} mês${diffMonths > 1 ? "es" : ""}`;
      return `${diffDays} dia${diffDays > 1 ? "s" : ""}`;
    } catch {
      return "N/A";
    }
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

    // Valida se a data selecionada é válida
    const selectedDate = parseFromYYMMDD(editedExam.data_agendamento);
    const today = startOfDay(new Date());

    if (selectedDate && isBefore(startOfDay(selectedDate), today)) {
      ___showErrorToastNotification({
        message: "Não é possível agendar para uma data anterior à data atual.",
      });
      return;
    }

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

  // Função para mudança do Calendar
  const handleDateChange = (date: Date | null) => {
    if (editedExam && date) {
      try {
        // Valida se a data é válida para agendamento
        if (!isValidScheduleDate(date)) {
          ___showErrorToastNotification({
            message: "Não é possível agendar para uma data anterior à data atual.",
          });
          return;
        }

        // Formata a data para o formato yy/M/d
        const formattedDate = format(date, "yy/M/d");

        setEditedExam((prev) => ({
          ...prev!,
          data_agendamento: formattedDate,
        }));

        // Atualiza também o calendarDates
        setCalendarDates((prev) => new Map(prev.set(editedExam.id, date)));

        ___showSuccessToastNotification({
          message: "Data selecionada com sucesso!",
        });
      } catch (error) {
        console.error("Erro ao formatar data:", error);
      }
    }
  };

  // Função para mudança do TimePicker
  const handleTimeChange = (time: string) => {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 z-[50]">
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
              <Button variant="ghost" size="sm" onClick={handleForceRefresh} className="h-8 px-2" title="Recarregar dados">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </Button>
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
                    <div className={`font-medium ${hasPendingPayment ? "text-amber-600" : "text-green-600"}`}>{hasPendingPayment ? "Pendente" : "Pago"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays className="w-4 h-4" />
                      Data de Criação
                    </div>
                    <div className="font-medium text-sm">
                      {(() => {
                        try {
                          const date = new Date(schedule.criado_aos);
                          if (isValid(date)) {
                            return format(date, "dd/M/yyyy HH:mm", { locale: ptBR });
                          }
                          return "Data inválida";
                        } catch {
                          return "Erro na data";
                        }
                      })()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      Valor Total
                    </div>
                    <div className="font-medium text-green-600 text-sm">{new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(totalValue)}</div>
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
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">{getPatientInitials()}</AvatarFallback>
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
                      <p className="font-medium mt-1 text-sm">{schedule.Paciente?.numero_identificacao || "Não informado"}</p>
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
                      <Button onClick={() => selectedChief && allocateChiefMutation.mutate({ scheduleId: schedule.id, chiefId: selectedChief })} disabled={!selectedChief || allocateChiefMutation.isPending} className="sm:w-auto">
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
                  const calendarDate = calendarDates.get(exam.id) || null;

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
                            <span className={`text-xs px-2 py-0.5 rounded-full ${exam.status_pagamento === "PAGO" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{exam.status_pagamento === "PAGO" ? "Pago" : "Pendente"}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {editingExam === exam.id ? (
                            <div className="flex gap-2">
                              <Button variant="default" size="sm" onClick={handleSaveExam} disabled={updateExamMutation.isPending}>
                                <Save className="w-3 h-3 mr-1" />
                                {updateExamMutation.isPending ? "Salvando..." : "Salvar"}
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

                          {/* Calendário para Data - Com dias desabilitados visíveis */}
                          <div>
                            <Label className="text-sm mb-2 block font-medium text-gray-700">Selecione a Data</Label>
                            <div className="mt-2 flex gap-2">
                              {/* Input para digitação manual */}
                              <div className="flex-1">
                                <div className="relative">
                                  <Input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder="dd/mm/aa"
                                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  />
                                  <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Formato: dd/mm/aa (ex: 25/12/24)</p>
                              </div>

                              {/* Botão do calendário */}
                              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="h-10 px-3 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 hover:border-gray-400">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[100] border border-gray-300 shadow-lg" align="start" sideOffset={4}>
                                  <div className="bg-white rounded-lg">
                                    <Calendar
                                      mode="single"
                                      selected={calendarDate || undefined}
                                      onSelect={handleCalendarSelect}
                                      initialFocus
                                      className="p-3"
                                      disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                                      classNames={{
                                        month: "flex flex-col m-auto text-center space-y-4",
                                        months: "flex flex-col m-auto justify-center items-center space-y-4",
                                        caption_label: "text-sm font-semibold text-gray-800",
                                        caption: "flex justify-center pt-1 relative items-center",
                                        nav: "space-x-1 flex items-center",
                                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-600 hover:text-gray-900",
                                        nav_button_previous: "absolute left-1",
                                        nav_button_next: "absolute right-1",
                                        table: "w-full border-collapse space-y-1",
                                        head_row: "flex",
                                        head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                                        row: "flex w-full mt-2",
                                        cell: "h-9 w-9 text-center text-sm p-0 relative",
                                        day: "h-9 w-9 p-0 font-normal rounded-md transition-colors hover:bg-blue-100 hover:text-blue-700 data-[disabled]:text-gray-300 data-[disabled]:bg-gray-50 data-[disabled]:cursor-not-allowed data-[outside]:text-gray-300 data-[outside]:opacity-30",
                                        day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                                        day_today: "bg-blue-100 text-blue-700 border border-blue-300",
                                      }}
                                    />
                                    <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500">
                                          Data atual: <span className="font-medium">{format(new Date(), "dd/MM/yyyy")}</span>
                                        </p>
                                        <Button variant="ghost" size="sm" className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-2 py-1" onClick={handleTodayClick}>
                                          <CalendarDays className="h-3 w-3 mr-1" />
                                          Hoje
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Exibir a data selecionada */}
                            {calendarDate && (
                              <div className="mt-2 text-sm text-gray-700">
                                <span className="font-medium">Data selecionada:</span> {format(calendarDate, "dd/MM/yyyy")}
                              </div>
                            )}
                          </div>
                          {/* TimePicker para Hora */}
                          <div>
                            <Label className="text-sm">Selecione o Horário</Label>
                            <div className="mt-2">
                              <TimePicker value={editedExam.hora_agendamento} onChange={handleTimeChange} />
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
                                {exam.data_agendamento} às {exam.hora_agendamento}
                              </span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Preço</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <DollarSign className="w-3 h-3 text-gray-500" />
                              <span className="font-medium text-green-600">{new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(currentPrice)}</span>
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
                            <Button onClick={() => selectedTechnician && allocateTechnicianMutation.mutate({ examId: exam.id, technicianId: selectedTechnician })} disabled={!selectedTechnician || allocateTechnicianMutation.isPending} className="sm:w-auto">
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
