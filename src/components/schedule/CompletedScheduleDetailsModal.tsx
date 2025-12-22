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
import { format, parse, isValid, isBefore, startOfDay, parseISO } from "date-fns";
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

// Função melhorada para parsear datas do backend
const parseBackendDate = (dateString: string): Date | null => {
  if (!dateString || dateString.trim() === "") return null;

  try {
    // Tenta parsear como ISO string primeiro (formato comum do backend)
    const isoDate = new Date(dateString);
    if (isValid(isoDate)) {
      return isoDate;
    }

    // Tenta parsear como yyyy-MM-dd (formato comum para bancos de dados)
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2})/;
    const match = dateString.match(dateRegex);
    
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // Mês é 0-indexed
      const day = parseInt(match[3], 10);
      
      const parsed = new Date(year, month, day);
      if (isValid(parsed)) {
        return parsed;
      }
    }

    // Tenta outros formatos
    const formats = ["dd/MM/yyyy", "dd-MM-yyyy", "yyyy/MM/dd", "dd/MM/yy", "dd-MM-yy"];
    
    for (const fmt of formats) {
      try {
        const parsed = parse(dateString, fmt, new Date());
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

// Função para formatar data para o backend (yyyy-MM-dd)
const formatDateForBackend = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) return "";
  
  try {
    return format(date, "yyyy-MM-dd");
  } catch (error) {
    console.error("Erro ao formatar data para backend:", error);
    return "";
  }
};

// Função para formatar data para exibição (dd/MM/yyyy)
const formatDateForDisplay = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) return "";
  
  try {
    return format(date, "dd/MM/yyyy");
  } catch (error) {
    console.error("Erro ao formatar data para exibição:", error);
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

  // Configuração inicial quando o modal abre ou schedule muda
  useEffect(() => {
    if (schedule?.Exame) {
      // Filtra exames que não estão concluídos
      const activeExams = schedule.Exame.filter((exam) => exam.status !== "CONCLUIDO");

      // Processa as datas dos exames
      const examsWithDates = activeExams.map((exam) => {
        try {
          let dateObj: Date | null = null;
          let displayDate = "";

          // Tenta parsear a data do backend
          if (exam.data_agendamento) {
            dateObj = parseBackendDate(exam.data_agendamento);
            
            if (dateObj && isValid(dateObj)) {
              displayDate = formatDateForDisplay(dateObj);
            } else {
              // Fallback para data atual
              dateObj = new Date();
              displayDate = formatDateForDisplay(dateObj);
            }
          } else {
            // Se não há data, usa data atual
            dateObj = new Date();
            displayDate = formatDateForDisplay(dateObj);
          }

          return {
            ...exam,
            data_agendamento: exam.data_agendamento || "", // Mantém o formato original do backend
            display_date: displayDate,
            originalDate: dateObj,
          };
        } catch (error) {
          console.error(`Erro ao processar exame ${exam.id}:`, error);
          return {
            ...exam,
            data_agendamento: "",
            display_date: formatDateForDisplay(new Date()),
            originalDate: new Date(),
          };
        }
      });

      setLocalExams(examsWithDates);

      // Inicializa as datas do calendar
      const datesMap = new Map<number, Date | null>();
      examsWithDates.forEach((exam) => {
        datesMap.set(exam.id, exam.originalDate);
      });
      setCalendarDates(datesMap);
    }
  }, [schedule]);

  // Atualiza o calendarDate quando editingExam muda
  useEffect(() => {
    if (editingExam && editedExam) {
      const date = parseBackendDate(editedExam.data_agendamento);
      setCalendarDate(date);
      if (date) {
        setInputValue(formatDateForDisplay(date));
      }
    }
  }, [editingExam, editedExam]);

  // Limpa estados quando a modal fecha
  useEffect(() => {
    if (!isOpen) {
      setEditingExam(null);
      setEditedExam(null);
      setSelectedTechnician(null);
      setSelectedChief(null);
      setCalendarDate(null);
      setInputValue("");
    }
  }, [isOpen]);

  // Função para atualizar o exame CORRIGIDA
  const updateExamMutation = useMutation({
    mutationFn: async (data: { examId: number; updates: Partial<EditableExam> }) => {
      const updatePayload: any = { ...data.updates };

      // Converte a data para o formato do backend SE necessário
      if (updatePayload.data_agendamento) {
        try {
          // Primeiro tenta verificar se já está no formato do backend
          const isISOFormat = /^\d{4}-\d{2}-\d{2}/.test(updatePayload.data_agendamento);
          
          if (!isISOFormat) {
            // Se não está no formato ISO, tenta parsear e converter
            const parsedDate = parseBackendDate(updatePayload.data_agendamento);
            if (parsedDate && isValid(parsedDate)) {
              updatePayload.data_agendamento = formatDateForBackend(parsedDate);
            } else {
              throw new Error("Data inválida");
            }
          }
        } catch (error) {
          console.error("Erro ao processar data para backend:", error);
          throw new Error("Formato de data inválido");
        }
      }

      // Verifica se o usuário tem permissão para marcar como concluído
      if (isReceptionist && updatePayload.status === "CONCLUIDO") {
        ___showErrorToastNotification({
          message: "Recepcionistas não podem marcar exames como concluídos.",
        });
        throw new Error("Recepcionistas não podem marcar exames como concluídos.");
      }

      // Log para debug
      console.log("Enviando para o backend:", {
        examId: data.examId,
        updates: updatePayload
      });

      return await examRoutes.editExam(data.examId, updatePayload);
    },
    onSuccess: (response, variables) => {
      console.log("Resposta do backend:", response);
      
      ___showSuccessToastNotification({ 
        message: "Exame atualizado com sucesso!" 
      });

      // ATUALIZAÇÃO AGGRESSIVA DO CACHE
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["patient-schedules"] });
      
      // Força o refetch imediato
      queryClient.refetchQueries({ queryKey: ["completed-schedules"] });

      // Atualiza o estado local imediatamente
      setLocalExams((prev) =>
        prev.map((exam) => {
          if (exam.id === variables.examId) {
            const updatedExam = { ...exam, ...variables.updates };

            // Atualiza a data de exibição
            if (variables.updates.data_agendamento) {
              try {
                const date = parseBackendDate(variables.updates.data_agendamento);
                if (date && isValid(date)) {
                  updatedExam.display_date = formatDateForDisplay(date);
                  updatedExam.originalDate = date;
                }
              } catch (error) {
                console.error("Erro ao atualizar data local:", error);
              }
            }

            // Atualiza o tipo de exame se foi alterado
            if (variables.updates.id_tipo_exame && examTypesResponse?.data) {
              const newExamType = examTypesResponse.data.find((et: ExamType) => et.id === variables.updates.id_tipo_exame);
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

      // Limpa o estado de edição
      setEditingExam(null);
      setEditedExam(null);
      setCalendarDate(null);
      setInputValue("");
      
      // Fecha a modal após salvar? (opcional)
      // onClose();
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar exame:", error);
      
      let errorMessage = "Erro ao atualizar exame.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      ___showErrorToastNotification({
        message: errorMessage,
      });
    },
  });

  const allocateTechnicianMutation = useMutation({
    mutationFn: async (data: { examId: number; technicianId: string }) => 
      (await _axios.patch(`/exams/${data.examId}`, { 
        id_tecnico_alocado: data.technicianId 
      })).data,
    onSuccess: (response, variables) => {
      ___showSuccessToastNotification({ message: "Técnico alocado com sucesso!" });

      // Atualiza o cache
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });

      // Atualiza o estado local
      setLocalExams((prev) => 
        prev.map((exam) => 
          exam.id === variables.examId 
            ? { ...exam, id_tecnico_alocado: variables.technicianId } 
            : exam
        )
      );

      setSelectedTechnician(null);
    },
    onError: (error: any) => {
      console.error("Erro ao alocar técnico:", error);
      ___showErrorToastNotification({ 
        message: error.response?.data?.message || "Erro ao alocar técnico." 
      });
    },
  });

  const allocateChiefMutation = useMutation({
    mutationFn: async (data: { scheduleId: number; chiefId: string }) => 
      labChiefRoutes.allocateLabChief(data.scheduleId, data.chiefId),
    onSuccess: () => {
      ___showSuccessToastNotification({ message: "Chefe alocado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      setSelectedChief(null);
    },
    onError: (error: any) => {
      console.error("Erro ao alocar chefe:", error);
      ___showErrorToastNotification({ 
        message: error.response?.data?.message || "Erro ao alocar chefe." 
      });
    },
  });

  const handleForceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
    queryClient.refetchQueries({ queryKey: ["completed-schedules"] });
    ___showSuccessToastNotification({ message: "Dados recarregados!" });
  };

  // Handlers para input manual de data
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Tenta parsear a data digitada
    const formats = ["dd/MM/yyyy", "dd/MM/yy", "dd-MM-yyyy", "dd-MM-yy"];
    let parsedDate: Date | null = null;

    for (const fmt of formats) {
      try {
        parsedDate = parse(value, fmt, new Date());
        if (isValid(parsedDate)) {
          break;
        }
      } catch {
        continue;
      }
    }

    if (parsedDate && isValid(parsedDate)) {
      // Valida se a data não é anterior a hoje
      if (!isValidScheduleDate(parsedDate)) {
        ___showErrorToastNotification({
          message: "Não é possível agendar para uma data anterior à data atual.",
        });
        return;
      }
      
      setCalendarDate(parsedDate);
      
      // Atualiza o editedExam se estiver editando
      if (editedExam) {
        setEditedExam({
          ...editedExam,
          data_agendamento: formatDateForBackend(parsedDate),
        });
      }
    } else if (value.trim() === "") {
      setCalendarDate(null);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setCalendarDate(date);
      setInputValue(formatDateForDisplay(date));
      setIsPopoverOpen(false);
      
      // Atualiza o editedExam se estiver editando
      if (editedExam) {
        setEditedExam({
          ...editedExam,
          data_agendamento: formatDateForBackend(date),
        });
      }
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCalendarDate(today);
    setInputValue(formatDateForDisplay(today));
    
    if (editedExam) {
      setEditedExam({
        ...editedExam,
        data_agendamento: formatDateForBackend(today),
      });
    }
  };

  if (!schedule) return null;

  // Verifica se há pagamento pendente
  const hasPendingPayment = schedule.Exame?.some((exam) => exam.status_pagamento === "PENDENTE");

  // Calcula o status geral do bloco
  const calculateOverallScheduleStatus = () => {
    const exams = schedule.Exame || [];

    if (exams.some((exam) => exam.status === "PENDENTE")) {
      return "PENDENTE";
    }

    if (exams.every((exam) => exam.status === "CONCLUIDO")) {
      return "CONCLUIDO";
    }

    if (exams.some((exam) => exam.status === "POR_REAGENDAR")) {
      return "POR_REAGENDAR";
    }

    if (exams.every((exam) => exam.status === "CANCELADO")) {
      return "CANCELADO";
    }

    return "PENDENTE";
  };

  const overallStatus = calculateOverallScheduleStatus();

  // Usa os exames locais (que podem ter sido atualizados) ou os originais do schedule
  const activeExams = localExams.length > 0 ? localExams : schedule.Exame?.filter((exam) => exam.status !== "CONCLUIDO") || [];

  // Se todos os exames estão concluídos, não mostrar
  if (overallStatus === "CONCLUIDO") return null;

  const getPatientAge = () => {
    if (!schedule.Paciente?.data_nascimento) return "N/A";
    try {
      const birthDate = parseBackendDate(schedule.Paciente.data_nascimento);
      if (!birthDate || !isValid(birthDate)) return "N/A";

      const now = new Date();
      const diffYears = now.getFullYear() - birthDate.getFullYear();
      
      // Ajuste para aniversário que ainda não aconteceu este ano
      const hasHadBirthday = 
        now.getMonth() > birthDate.getMonth() || 
        (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
      
      const age = hasHadBirthday ? diffYears : diffYears - 1;
      
      return `${age} ano${age !== 1 ? 's' : ''}`;
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
    
    // Prepara o objeto de edição com a data no formato do backend
    const editData: EditableExam = {
      id: exam.id,
      data_agendamento: exam.data_agendamento || "", // Mantém o formato do backend
      hora_agendamento: exam.hora_agendamento,
      status: exam.status,
      id_tipo_exame: exam.id_tipo_exame || exam.Tipo_Exame?.id,
      id_tecnico_alocado: exam.id_tecnico_alocado || null,
    };
    
    setEditedExam(editData);
    
    // Configura o calendar com a data atual do exame
    const date = exam.originalDate || parseBackendDate(exam.data_agendamento);
    setCalendarDate(date);
    setInputValue(date ? formatDateForDisplay(date) : "");
  };

  const handleSaveExam = () => {
    if (!editedExam) return;

    // Validações
    if (!editedExam.data_agendamento) {
      ___showErrorToastNotification({
        message: "Por favor, selecione uma data.",
      });
      return;
    }

    if (!editedExam.hora_agendamento) {
      ___showErrorToastNotification({
        message: "Por favor, selecione um horário.",
      });
      return;
    }

    // Valida a data selecionada
    const selectedDate = parseBackendDate(editedExam.data_agendamento);
    if (!selectedDate || !isValid(selectedDate)) {
      ___showErrorToastNotification({
        message: "Data inválida.",
      });
      return;
    }

    if (!isValidScheduleDate(selectedDate)) {
      ___showErrorToastNotification({
        message: "Não é possível agendar para uma data anterior à data atual.",
      });
      return;
    }

    // Envia para atualização
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
    setCalendarDate(null);
    setInputValue("");
  };

  const handleExamFieldChange = (field: keyof EditableExam, value: any) => {
    if (!editedExam) return;

    // Se está mudando o tipo de exame, atualiza também o preço no estado local
    if (field === "id_tipo_exame" && examTypesResponse?.data) {
      const selectedExamType = examTypesResponse.data.find((et: ExamType) => et.id === parseInt(value));
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

  // Função para mudança do TimePicker
  const handleTimeChange = (time: string) => {
    if (editedExam) {
      setEditedExam({ ...editedExam, hora_agendamento: time });
    }
  };

  // Função para verificar se pode inicializar exame
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
                    <div className={`font-medium ${hasPendingPayment ? "text-amber-600" : "text-green-600"}`}>
                      {hasPendingPayment ? "Pendente" : "Pago"}
                    </div>
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
                            return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
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
                        onClick={() => 
                          selectedChief && 
                          allocateChiefMutation.mutate({ 
                            scheduleId: schedule.id, 
                            chiefId: selectedChief 
                          })
                        }
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
                  const examCalendarDate = calendarDates.get(exam.id) || null;

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
                              <Button
                                variant="default"
                                size="sm"
                                onClick={handleSaveExam}
                                disabled={updateExamMutation.isPending}
                              >
                                <Save className="w-3 h-3 mr-1" />
                                {updateExamMutation.isPending ? "Salvando..." : "Salvar"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={updateExamMutation.isPending}
                              >
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
                              <Select
                                value={editedExam.id_tipo_exame?.toString() || ""}
                                onValueChange={(value) => 
                                  handleExamFieldChange("id_tipo_exame", parseInt(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.isArray(examTypesResponse?.data) &&
                                    examTypesResponse.data.map((examType: ExamType) => (
                                      <SelectItem key={examType.id} value={examType.id.toString()}>
                                        {examType.nome} - {new Intl.NumberFormat("pt-AO", { 
                                          style: "currency", 
                                          currency: "AOA" 
                                        }).format(examType.preco)}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">Status</Label>
                              <Select
                                value={editedExam.status}
                                onValueChange={(value) => handleExamFieldChange("status", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                  {!isReceptionist && (
                                    <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Calendário para Data */}
                          <div>
                            <Label className="text-sm mb-2 block font-medium text-gray-700">
                              Selecione a Data
                            </Label>
                            <div className="mt-2 flex gap-2">
                              {/* Input para digitação manual */}
                              <div className="flex-1">
                                <div className="relative">
                                  <Input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder="dd/mm/aaaa"
                                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  />
                                  <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Formato: dd/mm/aaaa (ex: 25/12/2024)
                                </p>
                              </div>

                              {/* Botão do calendário */}
                              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="h-10 px-3 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 hover:border-gray-400"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0 z-[100] border border-gray-300 shadow-lg"
                                  align="start"
                                  sideOffset={4}
                                >
                                  <div className="bg-white rounded-lg">
                                    <Calendar
                                      mode="single"
                                      selected={calendarDate || undefined}
                                      onSelect={handleCalendarSelect}
                                      initialFocus
                                      className="p-3"
                                      disabled={(date) => 
                                        isBefore(startOfDay(date), startOfDay(new Date()))
                                      }
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
                                          Data atual:{" "}
                                          <span className="font-medium">
                                            {format(new Date(), "dd/MM/yyyy")}
                                          </span>
                                        </p>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-2 py-1"
                                          onClick={handleTodayClick}
                                        >
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
                                <span className="font-medium">Data selecionada:</span>{" "}
                                {formatDateForDisplay(calendarDate)}
                              </div>
                            )}
                          </div>

                          {/* TimePicker para Hora */}
                          <div>
                            <Label className="text-sm">Selecione o Horário</Label>
                            <div className="mt-2">
                              <TimePicker
                                value={editedExam.hora_agendamento}
                                onChange={handleTimeChange}
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
                                {exam.display_date || exam.data_agendamento} às {exam.hora_agendamento}
                              </span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Preço</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <DollarSign className="w-3 h-3 text-gray-500" />
                              <span className="font-medium text-green-600">
                                {new Intl.NumberFormat("pt-AO", { 
                                  style: "currency", 
                                  currency: "AOA" 
                                }).format(currentPrice)}
                              </span>
                            </div>
                          </div>
                          {(isLabChief || isLabTechnician) && (
                            <div>
                              <Label className="text-xs text-gray-500">Técnico Alocado</Label>
                              <p className="font-medium mt-1">
                                {getTechnicianName(exam.id_tecnico_alocado)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Alocação de técnico (apenas para chefe) */}
                      {isLabChief && editingExam !== exam.id && (
                        <div className="pt-3 border-t">
                          <Label className="text-sm">Alocar Técnico</Label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Select
                              value={selectedTechnician || ""}
                              onValueChange={setSelectedTechnician}
                            >
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
                              onClick={() =>
                                selectedTechnician &&
                                allocateTechnicianMutation.mutate({
                                  examId: exam.id,
                                  technicianId: selectedTechnician,
                                })
                              }
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