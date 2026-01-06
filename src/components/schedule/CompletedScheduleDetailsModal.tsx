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
import { CalendarDays, Clock, User, Phone, Stethoscope, CheckCircle, XCircle, AlertCircle, Edit3, Mail, Users, Save, X, FileText, DollarSign, CreditCard, Shield, ChevronDown, ClipboardList } from "lucide-react";
import { format, parse, isValid, isBefore, startOfDay, isToday, isAfter, isEqual } from "date-fns";
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
  status_financeiro: string;
  status_reembolso: string;
  id_tipo_exame?: number;
  observacoes?: string;
  id_tecnico_alocado?: string | null;
}

interface EditableConsulta {
  id: number;
  data_agendamento: string;
  hora_agendamento: string;
  status: string;
  status_financeiro: string;
  status_reembolso: string;
  id_tipo_consulta?: number;
  observacoes?: string;
  id_clinico_alocado?: string | null;
}

interface ExamType {
  id: number;
  nome: string;
  preco: number;
  descricao?: string;
}

interface ConsultaType {
  id: number;
  nome: string;
  preco: number;
  descricao?: string;
}

// Função para converter string no formato yy/M/d para Date
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

        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          // Se ano tem 2 dígitos, assume 2000+
          if (year < 100) {
            year = 2000 + year;
          }

          const parsed = new Date(year, month, day);
          if (isValid(parsed) && parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day) {
            return parsed;
          }
        }
      }
    }

    // Tenta outros formatos
    const formats = ["dd/MM/yyyy", "dd-MM-yyyy", "yyyy/MM/dd", "yyyy-MM-dd", "dd/MM/yy", "dd-MM-yy"];

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

// Função para formatar data para input (dd/MM/yy)
const formatForInput = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) return "";

  try {
    return format(date, "dd/MM/yy");
  } catch (error) {
    console.error("Erro ao formatar data para input:", error);
    return "";
  }
};

// Função para verificar se uma data é anterior à data atual
const isDateBeforeToday = (date: Date): boolean => {
  const today = startOfDay(new Date());
  const selectedDate = startOfDay(date);
  return isBefore(selectedDate, today);
};

// Função para verificar se um horário é anterior ao horário atual (para datas de hoje)
const isTimeBeforeNow = (date: Date, time: string): boolean => {
  if (!date || !time) return false;
  
  try {
    // Cria uma data com a hora selecionada
    const [hours, minutes] = time.split(":").map(Number);
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    // Data e hora atual
    const now = new Date();
    
    // Verifica se o horário selecionado é anterior ao horário atual
    return isBefore(selectedDateTime, now);
  } catch (error) {
    console.error("Erro ao verificar horário:", error);
    return false;
  }
};

// Função para formatar hora atual para comparação
const getCurrentTimeString = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
};

export function CompletedScheduleDetailsModal({ schedule, isOpen, onClose }: CompletedScheduleDetailsModalProps) {
  const [editingExam, setEditingExam] = useState<number | null>(null);
  const [editingConsulta, setEditingConsulta] = useState<number | null>(null);
  const [editedExam, setEditedExam] = useState<EditableExam | null>(null);
  const [editedConsulta, setEditedConsulta] = useState<EditableConsulta | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [selectedChief, setSelectedChief] = useState<string | null>(null);
  const [selectedClinico, setSelectedClinico] = useState<string | null>(null);
  const [localExams, setLocalExams] = useState<any[]>([]);
  const [localConsultas, setLocalConsultas] = useState<any[]>([]);
  const [calendarDates, setCalendarDates] = useState<Map<number, Date | null>>(new Map());
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [saveDisabledReason, setSaveDisabledReason] = useState<string | null>(null);
  const [isDateValid, setIsDateValid] = useState<boolean>(true);
  const [dateValidationMessage, setDateValidationMessage] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const userRole = getAllDataInCookies().userRole;
  const isReceptionist = userRole === "RECEPCIONISTA";
  const isLabChief = userRole === "CHEFE";
  const isLabTechnician = userRole === "TECNICO";
  const isClinico = userRole === "CLINICO";

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

  const { data: clinicos } = useQuery({
    queryKey: ["clinicos"],
    queryFn: async () => (await _axios.get("/clinicos")).data,
    enabled: isReceptionist || isClinico,
  });

  const { data: examTypesResponse } = useQuery({
    queryKey: ["exam-types"],
    queryFn: async () => await examRoutes.getExamTypes(),
    enabled: isReceptionist || isLabChief || isLabTechnician,
  });

  const { data: consultaTypesResponse } = useQuery({
    queryKey: ["consulta-types"],
    queryFn: async () => (await _axios.get("/tipos-consulta")).data,
    enabled: isReceptionist || isClinico,
  });

  // Função para verificar se o botão de salvar deve estar habilitado
  const checkSaveButtonStatus = () => {
    if (!editedExam && !editedConsulta) {
      setIsSaveDisabled(true);
      setSaveDisabledReason("Nenhum item em edição");
      return;
    }
    
    const item = editedExam || editedConsulta;
    if (!item) {
      setIsSaveDisabled(true);
      setSaveDisabledReason("Nenhum item em edição");
      return;
    }
    
    // Verifica se há uma data válida
    if (!item.data_agendamento || item.data_agendamento.trim() === "") {
      setIsSaveDisabled(true);
      setSaveDisabledReason("Data de agendamento é obrigatória");
      return;
    }
    
    // Parse a data para verificar se é válida
    const selectedDate = parseFromYYMMDD(item.data_agendamento);
    if (!selectedDate || !isValid(selectedDate)) {
      setIsSaveDisabled(true);
      setSaveDisabledReason("Data inválida");
      return;
    }
    
    // Verifica se a data é anterior a hoje
    if (isDateBeforeToday(selectedDate)) {
      setIsSaveDisabled(true);
      setSaveDisabledReason("Não é possível agendar para uma data anterior à data atual");
      return;
    }
    
    // Verifica se há horário
    if (!item.hora_agendamento || item.hora_agendamento.trim() === "") {
      setIsSaveDisabled(true);
      setSaveDisabledReason("Horário de agendamento é obrigatório");
      return;
    }
    
    // Verifica se o horário é válido (para datas de hoje)
    if (isToday(selectedDate)) {
      // Verifica se o horário é anterior ao horário atual
      if (isTimeBeforeNow(selectedDate, item.hora_agendamento)) {
        setIsSaveDisabled(true);
        setSaveDisabledReason(`Para hoje, não é possível agendar para um horário anterior ao atual (${getCurrentTimeString()})`);
        return;
      } else {
        setTimeError(null);
      }
    } else {
      setTimeError(null);
    }
    
    // Verifica se há tipo de exame/consulta
    if (editedExam && !editedExam.id_tipo_exame) {
      setIsSaveDisabled(true);
      setSaveDisabledReason("Tipo de exame é obrigatório");
      return;
    }
    
    if (editedConsulta && !editedConsulta.id_tipo_consulta) {
      setIsSaveDisabled(true);
      setSaveDisabledReason("Tipo de consulta é obrigatório");
      return;
    }
    
    // Verifica se há status
    if (!item.status || item.status.trim() === "") {
      setIsSaveDisabled(true);
      setSaveDisabledReason("Status do item é obrigatório");
      return;
    }
    
    // Todas as validações passaram
    setIsSaveDisabled(false);
    setSaveDisabledReason(null);
    setTimeError(null);
  };

  // Efeito para verificar status do botão de salvar quando editedExam muda
  useEffect(() => {
    checkSaveButtonStatus();
  }, [editedExam, editedConsulta]);

  // SIMPLIFICADO: handleInputChange - apenas atualiza o valor
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Remove erro enquanto digita
    setInputError(null);
    setDateValidationMessage(null);
    setTimeError(null);
  };

  // SIMPLIFICADO: handleInputBlur - valida apenas quando o campo perde o foco
  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      // Campo vazio - limpa tudo
      setInputError(null);
      setCalendarDate(null);
      setIsDateValid(true);
      setDateValidationMessage(null);
      setTimeError(null);
      
      if (editedExam && editingExam) {
        setEditedExam({
          ...editedExam,
          data_agendamento: "",
        });
      }
      if (editedConsulta && editingConsulta) {
        setEditedConsulta({
          ...editedConsulta,
          data_agendamento: "",
        });
      }
      return;
    }

    try {
      // Tenta parsear a data
      const formatsToTry = ["dd/MM/yy", "dd/MM/yyyy", "d/M/yy", "d/M/yyyy"];
      let parsedDate: Date | null = null;
      
      for (const fmt of formatsToTry) {
        try {
          parsedDate = parse(inputValue, fmt, new Date());
          if (isValid(parsedDate)) {
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (parsedDate && isValid(parsedDate)) {
        // Formata para exibição consistente (dd/mm/aa)
        const formatted = format(parsedDate, "dd/MM/yy");
        if (formatted !== inputValue) {
          setInputValue(formatted);
        }
        
        setCalendarDate(parsedDate);
        setInputError(null);
        
        // Verifica se a data é anterior a hoje
        if (isDateBeforeToday(parsedDate)) {
          setIsDateValid(false);
          setDateValidationMessage("Data anterior à data atual - o botão de salvar será bloqueado");
        } else {
          setIsDateValid(true);
          setDateValidationMessage(null);
          
          // Se a data for hoje e já houver um horário selecionado, valida o horário
          const currentItem = editedExam || editedConsulta;
          if (isToday(parsedDate) && currentItem?.hora_agendamento) {
            if (isTimeBeforeNow(parsedDate, currentItem.hora_agendamento)) {
              setTimeError(`Horário inválido para hoje. Hora atual: ${getCurrentTimeString()}`);
            } else {
              setTimeError(null);
            }
          }
        }
        
        // Atualiza o editedExam ou editedConsulta
        if (editedExam && editingExam) {
          const formattedDate = formatToYYMMDD(parsedDate);
          setEditedExam({
            ...editedExam,
            data_agendamento: formattedDate,
          });
        }
        if (editedConsulta && editingConsulta) {
          const formattedDate = formatToYYMMDD(parsedDate);
          setEditedConsulta({
            ...editedConsulta,
            data_agendamento: formattedDate,
          });
        }
      } else {
        // Data inválida
        setInputError("Formato de data inválido. Use dd/mm/aa (ex: 25/12/24)");
        setCalendarDate(null);
        setIsDateValid(false);
        setDateValidationMessage(null);
        setTimeError(null);
        
        if (editedExam && editingExam) {
          setEditedExam({
            ...editedExam,
            data_agendamento: "",
          });
        }
        if (editedConsulta && editingConsulta) {
          setEditedConsulta({
            ...editedConsulta,
            data_agendamento: "",
          });
        }
      }
    } catch (error) {
      setInputError("Data inválida");
      setCalendarDate(null);
      setIsDateValid(false);
      setDateValidationMessage(null);
      setTimeError(null);
      
      if (editedExam && editingExam) {
        setEditedExam({
          ...editedExam,
          data_agendamento: "",
        });
      }
      if (editedConsulta && editingConsulta) {
        setEditedConsulta({
          ...editedConsulta,
          data_agendamento: "",
        });
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = formatForInput(date);
      setInputValue(formattedDate);
      setCalendarDate(date);
      setInputError(null);
      
      // Verifica se a data é anterior a hoje
      if (isDateBeforeToday(date)) {
        setIsDateValid(false);
        setDateValidationMessage("Data anterior à data atual - o botão de salvar será bloqueado");
        setTimeError(null);
      } else {
        setIsDateValid(true);
        setDateValidationMessage(null);
        
        // Se a data for hoje e já houver um horário selecionado, valida o horário
        const currentItem = editedExam || editedConsulta;
        if (isToday(date) && currentItem?.hora_agendamento) {
          if (isTimeBeforeNow(date, currentItem.hora_agendamento)) {
            setTimeError(`Horário inválido para hoje. Hora atual: ${getCurrentTimeString()}`);
          } else {
            setTimeError(null);
          }
        }
      }
      
      setIsPopoverOpen(false);

      // Atualiza o editedExam ou editedConsulta se estiver editando
      const formattedDateForItem = formatToYYMMDD(date);
      if (editedExam && editingExam) {
        setEditedExam({
          ...editedExam,
          data_agendamento: formattedDateForItem,
        });
      }
      if (editedConsulta && editingConsulta) {
        setEditedConsulta({
          ...editedConsulta,
          data_agendamento: formattedDateForItem,
        });
      }
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCalendarDate(today);
    setInputValue(formatForInput(today));
    setInputError(null);
    setIsDateValid(true);
    setDateValidationMessage(null);
    setIsPopoverOpen(false);

    // Se já houver um horário selecionado, valida-o
    const currentItem = editedExam || editedConsulta;
    if (currentItem?.hora_agendamento) {
      if (isTimeBeforeNow(today, currentItem.hora_agendamento)) {
        setTimeError(`Horário inválido para hoje. Hora atual: ${getCurrentTimeString()}`);
      } else {
        setTimeError(null);
      }
    }

    const formattedDate = formatToYYMMDD(today);
    if (editedExam && editingExam) {
      setEditedExam({
        ...editedExam,
        data_agendamento: formattedDate,
      });
    }
    if (editedConsulta && editingConsulta) {
      setEditedConsulta({
        ...editedConsulta,
        data_agendamento: formattedDate,
      });
    }
  };

  const examTypes = examTypesResponse?.data || [];
  const consultaTypes = consultaTypesResponse?.data || [];

  // Atualiza os exames e consultas locais quando o schedule muda
  useEffect(() => {
    if (schedule?.Exame) {
      const activeExams = schedule.Exame.filter((exam) => exam.status !== "CONCLUIDO");

      const examsWithFormattedDates = activeExams.map((exam) => {
        try {
          let dateObj: Date | null = null;

          if (exam.data_agendamento) {
            dateObj = parseFromYYMMDD(exam.data_agendamento);
            if (!dateObj || !isValid(dateObj)) {
              dateObj = new Date();
            }
          } else {
            dateObj = new Date();
          }

          return {
            ...exam,
            data_agendamento: formatToYYMMDD(dateObj),
            originalDate: dateObj,
            status_financeiro: exam.status_pagamento || "NAO_PAGO",
            status_reembolso: exam.status || "SEM_REEMBOLSO",
          };
        } catch (error) {
          console.error(`Erro ao processar data do exame ${exam.id}:`, error);
          const dateObj = new Date();
          return {
            ...exam,
            data_agendamento: formatToYYMMDD(dateObj),
            originalDate: dateObj,
            status_financeiro: exam.status_pagamento || "NAO_PAGO",
            status_reembolso: exam.status || "SEM_REEMBOLSO",
          };
        }
      });

      setLocalExams(examsWithFormattedDates);

      const datesMap = new Map<number, Date | null>();
      examsWithFormattedDates.forEach((exam) => {
        datesMap.set(exam.id, exam.originalDate);
      });
      setCalendarDates(datesMap);
    }

    if (schedule?.Consultas) {
      const activeConsultas = schedule.Consultas.filter((consulta) => consulta.status !== "CONCLUIDO");

      const consultasWithFormattedDates = activeConsultas.map((consulta) => {
        try {
          let dateObj: Date | null = null;

          if (consulta.data_agendamento) {
            dateObj = parseFromYYMMDD(consulta.data_agendamento);
            if (!dateObj || !isValid(dateObj)) {
              dateObj = new Date();
            }
          } else {
            dateObj = new Date();
          }

          return {
            ...consulta,
            data_agendamento: formatToYYMMDD(dateObj),
            originalDate: dateObj,
            status_financeiro: consulta.status_financeiro || "NAO_PAGO",
            status_reembolso: consulta.status_reembolso || "SEM_REEMBOLSO",
          };
        } catch (error) {
          console.error(`Erro ao processar data da consulta ${consulta.id}:`, error);
          const dateObj = new Date();
          return {
            ...consulta,
            data_agendamento: formatToYYMMDD(dateObj),
            originalDate: dateObj,
            status_financeiro: consulta.status_financeiro || "NAO_PAGO",
            status_reembolso: consulta.status_reembolso || "SEM_REEMBOLSO",
          };
        }
      });

      setLocalConsultas(consultasWithFormattedDates);
    }
  }, [schedule]);

  // Atualiza o calendarDate quando editingExam ou editingConsulta muda
  useEffect(() => {
    if (editingExam && editedExam) {
      const date = parseFromYYMMDD(editedExam.data_agendamento);
      setCalendarDate(date);
      setInputValue(date ? formatForInput(date) : "");
      setInputError(null);
      setIsDateValid(date ? !isDateBeforeToday(date) : true);
      setDateValidationMessage(date && isDateBeforeToday(date) ? "Data anterior à data atual" : null);
      
      // Se a data for hoje, valida o horário
      if (date && isToday(date) && editedExam.hora_agendamento) {
        if (isTimeBeforeNow(date, editedExam.hora_agendamento)) {
          setTimeError(`Horário inválido para hoje. Hora atual: ${getCurrentTimeString()}`);
        } else {
          setTimeError(null);
        }
      }
    }
    
    if (editingConsulta && editedConsulta) {
      const date = parseFromYYMMDD(editedConsulta.data_agendamento);
      setCalendarDate(date);
      setInputValue(date ? formatForInput(date) : "");
      setInputError(null);
      setIsDateValid(date ? !isDateBeforeToday(date) : true);
      setDateValidationMessage(date && isDateBeforeToday(date) ? "Data anterior à data atual" : null);
      
      // Se a data for hoje, valida o horário
      if (date && isToday(date) && editedConsulta.hora_agendamento) {
        if (isTimeBeforeNow(date, editedConsulta.hora_agendamento)) {
          setTimeError(`Horário inválido para hoje. Hora atual: ${getCurrentTimeString()}`);
        } else {
          setTimeError(null);
        }
      }
    }
  }, [editingExam, editedExam, editingConsulta, editedConsulta]);

  // Limpa estados quando a modal fecha
  useEffect(() => {
    if (!isOpen) {
      setEditingExam(null);
      setEditingConsulta(null);
      setEditedExam(null);
      setEditedConsulta(null);
      setSelectedTechnician(null);
      setSelectedChief(null);
      setSelectedClinico(null);
      setCalendarDate(null);
      setInputValue("");
      setInputError(null);
      setIsSaveDisabled(true);
      setSaveDisabledReason(null);
      setIsDateValid(true);
      setDateValidationMessage(null);
      setTimeError(null);
    }
  }, [isOpen]);

  const updateExamMutation = useMutation({
    mutationFn: async (data: { examId: number; updates: Partial<EditableExam> }) => {
      const updatePayload: any = { ...data.updates };

      // Valida se a data é válida
      if (updatePayload.data_agendamento) {
        try {
          const date = parseFromYYMMDD(updatePayload.data_agendamento);
          if (!date || !isValid(date)) {
            throw new Error("Data inválida");
          }
          
          // Verifica se a data é anterior a hoje
          if (isDateBeforeToday(date)) {
            throw new Error("Não é possível agendar para uma data anterior à data atual.");
          }

          // Verifica se o horário é válido para datas de hoje
          if (isToday(date) && updatePayload.hora_agendamento) {
            if (isTimeBeforeNow(date, updatePayload.hora_agendamento)) {
              throw new Error(`Para hoje, não é possível agendar para um horário anterior ao atual (${getCurrentTimeString()})`);
            }
          }

          // Formato YYYY-MM-DD para o backend
          updatePayload.data_agendamento = format(date, "yyyy-MM-dd");
        } catch (error: any) {
          ___showErrorToastNotification({
            message: error.message || "Data inválida",
          });
          throw error;
        }
      }

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

      // Atualiza o cache
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });

      // Atualiza o estado local
      setLocalExams((prev) =>
        prev.map((exam) => {
          if (exam.id === variables.examId) {
            const updatedExam = { ...exam, ...variables.updates };

            // Formata a data para exibição
            if (variables.updates.data_agendamento) {
              try {
                const date = new Date(variables.updates.data_agendamento);
                if (isValid(date)) {
                  updatedExam.data_agendamento = formatToYYMMDD(date);
                  updatedExam.originalDate = date;
                }
              } catch (error) {
                console.error("Erro ao formatar data para exibição:", error);
                updatedExam.data_agendamento = formatToYYMMDD(new Date());
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
      setCalendarDate(null);
      setInputValue("");
      setInputError(null);
      setIsSaveDisabled(true);
      setSaveDisabledReason(null);
      setIsDateValid(true);
      setDateValidationMessage(null);
      setTimeError(null);
    },
    onError: (error: any) => {
      console.error("Update exam error:", error);
      ___showErrorToastNotification({
        message: error.response?.data?.message || error.message || "Erro ao atualizar exame.",
      });
    },
  });

  const updateConsultaMutation = useMutation({
    mutationFn: async (data: { consultaId: number; updates: Partial<EditableConsulta> }) => {
      const updatePayload: any = { ...data.updates };

      // Valida se a data é válida
      if (updatePayload.data_agendamento) {
        try {
          const date = parseFromYYMMDD(updatePayload.data_agendamento);
          if (!date || !isValid(date)) {
            throw new Error("Data inválida");
          }
          
          // Verifica se a data é anterior a hoje
          if (isDateBeforeToday(date)) {
            throw new Error("Não é possível agendar para uma data anterior à data atual.");
          }

          // Verifica se o horário é válido para datas de hoje
          if (isToday(date) && updatePayload.hora_agendamento) {
            if (isTimeBeforeNow(date, updatePayload.hora_agendamento)) {
              throw new Error(`Para hoje, não é possível agendar para um horário anterior ao atual (${getCurrentTimeString()})`);
            }
          }

          // Formato YYYY-MM-DD para o backend
          updatePayload.data_agendamento = format(date, "yyyy-MM-dd");
        } catch (error: any) {
          ___showErrorToastNotification({
            message: error.message || "Data inválida",
          });
          throw error;
        }
      }

      return await _axios.patch(`/consultas/${data.consultaId}`, updatePayload);
    },
    onSuccess: (response, variables) => {
      ___showSuccessToastNotification({ message: "Consulta atualizada com sucesso!" });

      // Atualiza o cache
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });

      // Atualiza o estado local
      setLocalConsultas((prev) =>
        prev.map((consulta) => {
          if (consulta.id === variables.consultaId) {
            const updatedConsulta = { ...consulta, ...variables.updates };

            // Formata a data para exibição
            if (variables.updates.data_agendamento) {
              try {
                const date = new Date(variables.updates.data_agendamento);
                if (isValid(date)) {
                  updatedConsulta.data_agendamento = formatToYYMMDD(date);
                  updatedConsulta.originalDate = date;
                }
              } catch (error) {
                console.error("Erro ao formatar data para exibição:", error);
                updatedConsulta.data_agendamento = formatToYYMMDD(new Date());
              }
            }

            return updatedConsulta;
          }
          return consulta;
        })
      );

      setEditingConsulta(null);
      setEditedConsulta(null);
      setCalendarDate(null);
      setInputValue("");
      setInputError(null);
      setIsSaveDisabled(true);
      setSaveDisabledReason(null);
      setIsDateValid(true);
      setDateValidationMessage(null);
      setTimeError(null);
    },
    onError: (error: any) => {
      console.error("Update consulta error:", error);
      ___showErrorToastNotification({
        message: error.response?.data?.message || error.message || "Erro ao atualizar consulta.",
      });
    },
  });

  const allocateTechnicianMutation = useMutation({
    mutationFn: async (data: { examId: number; technicianId: string }) => (await _axios.patch(`/exams/${data.examId}`, { id_tecnico_alocado: data.technicianId })).data,
    onSuccess: (response, variables) => {
      ___showSuccessToastNotification({ message: "Técnico alocado com sucesso!" });

      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });

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

  const allocateClinicoMutation = useMutation({
    mutationFn: async (data: { consultaId: number; clinicoId: string }) => (await _axios.patch(`/consultas/${data.consultaId}`, { id_clinico_alocado: data.clinicoId })).data,
    onSuccess: (response, variables) => {
      ___showSuccessToastNotification({ message: "Clínico alocado com sucesso!" });

      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });

      setLocalConsultas((prev) => prev.map((consulta) => (consulta.id === variables.consultaId ? { ...consulta, id_clinico_alocado: variables.clinicoId } : consulta)));

      setSelectedClinico(null);
    },
    onError: () => ___showErrorToastNotification({ message: "Erro ao alocar clínico." }),
  });

  const handleForceRefresh = async () => {
    try {
      setIsRefreshing(true);

      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["consultas"] });

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["completed-schedules"], type: "active" }),
        queryClient.refetchQueries({ queryKey: ["schedules"], type: "active" })
      ]);

      ___showSuccessToastNotification({
        message: "Dados atualizados com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      ___showErrorToastNotification({
        message: "Erro ao recarregar dados. Tente novamente.",
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (!schedule) return null;

  const hasPendingPayment = schedule.Exame?.some((exam) => exam.status_pagamento === "PENDENTE") || 
                           schedule.Consultas?.some((consulta) => consulta.status_pagamento === "PENDENTE");

  const calculateOverallScheduleStatus = () => {
    const exams = schedule.Exame || [];
    const consultas = schedule.Consultas || [];
    const allItems = [...exams, ...consultas];

    if (allItems.some((item) => item.status === "PENDENTE")) {
      return "PENDENTE";
    }

    if (allItems.every((item) => item.status === "CONCLUIDO")) {
      return "CONCLUIDO";
    }

    if (allItems.some((item) => item.status === "POR_REAGENDAR")) {
      return "POR_REAGENDAR";
    }

    if (allItems.every((item) => item.status === "CANCELADO")) {
      return "CANCELADO";
    }

    return "PENDENTE";
  };

  const overallStatus = calculateOverallScheduleStatus();
  const activeExams = localExams.length > 0 ? localExams : schedule.Exame?.filter((exam) => exam.status !== "CONCLUIDO") || [];
  const activeConsultas = localConsultas.length > 0 ? localConsultas : schedule.Consultas?.filter((consulta) => consulta.status !== "CONCLUIDO") || [];

  if (overallStatus === "CONCLUIDO") return null;

  const getPatientAge = () => {
    if (!schedule.Paciente?.data_nascimento) return "N/A";
    try {
      const birthDate = new Date(schedule.Paciente.data_nascimento);
      if (!isValid(birthDate)) return "N/A";

      const now = new Date();
      const diffYears = now.getFullYear() - birthDate.getFullYear();
      const hasHadBirthday = now.getMonth() > birthDate.getMonth() || (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());

      const age = hasHadBirthday ? diffYears : diffYears - 1;
      return `${age} ano${age !== 1 ? "s" : ""}`;
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

  const getItemStatusBadge = (status: string) => {
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

  const getClinicoName = (id: string | null) => {
    if (!id || !clinicos) return "Não alocado";
    return clinicos.find((c) => c.id === id)?.nome || "Clínico não encontrado";
  };

  const getFinanceiroStatusBadge = (status: string) => {
    const mapping = {
      PAGO: { text: "Pago", color: "green" },
      NAO_PAGO: { text: "Não Pago", color: "yellow" },
      ISENTO: { text: "Isento", color: "blue" },
    } as any;

    const info = mapping[status] || { text: status, color: "gray" };

    return (
      <Badge variant="outline" className={`border-${info.color}-200 bg-${info.color}-50 text-${info.color}-700 text-xs px-2 py-0.5`}>
        {info.text}
      </Badge>
    );
  };

  const getReembolsoStatusBadge = (status: string) => {
    const mapping = {
      REEMBOLSADO: { text: "Reembolsado", color: "green" },
      POR_REEMBOLSAR: { text: "Por Reembolsar", color: "orange" },
      SEM_REEMBOLSO: { text: "Sem Reembolso", color: "gray" },
    } as any;

    const info = mapping[status] || { text: status, color: "gray" };

    return (
      <Badge variant="outline" className={`border-${info.color}-200 bg-${info.color}-50 text-${info.color}-700 text-xs px-2 py-0.5`}>
        {info.text}
      </Badge>
    );
  };

  const totalValue = [...activeExams, ...activeConsultas]?.reduce((acc, item) => acc + (item.Tipo_Exame?.preco || item.Tipo_Consulta?.preco || 0), 0) || 0;

  const handleEditExam = (exam: any) => {
    setEditingExam(exam.id);
    setEditingConsulta(null);

    // Parse a data do exame
    const parsedDate = parseFromYYMMDD(exam.data_agendamento);

    // Formata para o input
    const displayDate = parsedDate ? formatForInput(parsedDate) : "";

    setEditedExam({
      id: exam.id,
      data_agendamento: exam.data_agendamento,
      hora_agendamento: exam.hora_agendamento,
      status: exam.status,
      status_financeiro: exam.status_financeiro || "NAO_PAGO",
      status_reembolso: exam.status_reembolso || "SEM_REEMBOLSO",
      id_tipo_exame: exam.id_tipo_exame || exam.Tipo_Exame?.id,
      id_tecnico_alocado: exam.id_tecnico_alocado || null,
    });

    // Atualiza o estado do calendar e input
    setCalendarDate(parsedDate);
    setInputValue(displayDate);
    setInputError(null);
    setIsDateValid(parsedDate ? !isDateBeforeToday(parsedDate) : true);
    setDateValidationMessage(parsedDate && isDateBeforeToday(parsedDate) ? "Data anterior à data atual" : null);
    
    // Valida o horário se a data for hoje
    if (parsedDate && isToday(parsedDate) && exam.hora_agendamento) {
      if (isTimeBeforeNow(parsedDate, exam.hora_agendamento)) {
        setTimeError(`Horário inválido para hoje. Hora atual: ${getCurrentTimeString()}`);
      } else {
        setTimeError(null);
      }
    } else {
      setTimeError(null);
    }
  };

  const handleEditConsulta = (consulta: any) => {
    setEditingConsulta(consulta.id);
    setEditingExam(null);

    // Parse a data da consulta
    const parsedDate = parseFromYYMMDD(consulta.data_agendamento);

    // Formata para o input
    const displayDate = parsedDate ? formatForInput(parsedDate) : "";

    setEditedConsulta({
      id: consulta.id,
      data_agendamento: consulta.data_agendamento,
      hora_agendamento: consulta.hora_agendamento,
      status: consulta.status,
      status_financeiro: consulta.status_financeiro || "NAO_PAGO",
      status_reembolso: consulta.status_reembolso || "SEM_REEMBOLSO",
      id_tipo_consulta: consulta.id_tipo_consulta || consulta.Tipo_Consulta?.id,
      id_clinico_alocado: consulta.id_clinico_alocado || null,
    });

    // Atualiza o estado do calendar e input
    setCalendarDate(parsedDate);
    setInputValue(displayDate);
    setInputError(null);
    setIsDateValid(parsedDate ? !isDateBeforeToday(parsedDate) : true);
    setDateValidationMessage(parsedDate && isDateBeforeToday(parsedDate) ? "Data anterior à data atual" : null);
    
    // Valida o horário se a data for hoje
    if (parsedDate && isToday(parsedDate) && consulta.hora_agendamento) {
      if (isTimeBeforeNow(parsedDate, consulta.hora_agendamento)) {
        setTimeError(`Horário inválido para hoje. Hora atual: ${getCurrentTimeString()}`);
      } else {
        setTimeError(null);
      }
    } else {
      setTimeError(null);
    }
  };

  const handleSaveExam = () => {
    if (!editedExam) return;

    // Verifica se o botão está desabilitado e mostra o motivo
    if (isSaveDisabled && saveDisabledReason) {
      ___showErrorToastNotification({
        message: saveDisabledReason,
      });
      return;
    }

    // Valida se a data não é anterior a hoje
    const selectedDate = parseFromYYMMDD(editedExam.data_agendamento);
    if (selectedDate && isDateBeforeToday(selectedDate)) {
      ___showErrorToastNotification({
        message: "Não é possível agendar para uma data anterior à data atual.",
      });
      return;
    }

    // Valida o horário se a data for hoje
    if (selectedDate && isToday(selectedDate)) {
      if (isTimeBeforeNow(selectedDate, editedExam.hora_agendamento)) {
        ___showErrorToastNotification({
          message: `Para hoje, não é possível agendar para um horário anterior ao atual (${getCurrentTimeString()})`,
        });
        return;
      }
    }

    updateExamMutation.mutate({
      examId: editedExam.id,
      updates: {
        data_agendamento: editedExam.data_agendamento,
        hora_agendamento: editedExam.hora_agendamento,
        status: editedExam.status,
        status_financeiro: editedExam.status_financeiro,
        status_reembolso: editedExam.status_reembolso,
        id_tipo_exame: editedExam.id_tipo_exame,
        id_tecnico_alocado: editedExam.id_tecnico_alocado,
      },
    });
  };

  const handleSaveConsulta = () => {
    if (!editedConsulta) return;

    // Verifica se o botão está desabilitado e mostra o motivo
    if (isSaveDisabled && saveDisabledReason) {
      ___showErrorToastNotification({
        message: saveDisabledReason,
      });
      return;
    }

    // Valida se a data não é anterior a hoje
    const selectedDate = parseFromYYMMDD(editedConsulta.data_agendamento);
    if (selectedDate && isDateBeforeToday(selectedDate)) {
      ___showErrorToastNotification({
        message: "Não é possível agendar para uma data anterior à data atual.",
      });
      return;
    }

    // Valida o horário se a data for hoje
    if (selectedDate && isToday(selectedDate)) {
      if (isTimeBeforeNow(selectedDate, editedConsulta.hora_agendamento)) {
        ___showErrorToastNotification({
          message: `Para hoje, não é possível agendar para um horário anterior ao atual (${getCurrentTimeString()})`,
        });
        return;
      }
    }

    updateConsultaMutation.mutate({
      consultaId: editedConsulta.id,
      updates: {
        data_agendamento: editedConsulta.data_agendamento,
        hora_agendamento: editedConsulta.hora_agendamento,
        status: editedConsulta.status,
        status_financeiro: editedConsulta.status_financeiro,
        status_reembolso: editedConsulta.status_reembolso,
        id_tipo_consulta: editedConsulta.id_tipo_consulta,
        id_clinico_alocado: editedConsulta.id_clinico_alocado,
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingExam(null);
    setEditingConsulta(null);
    setEditedExam(null);
    setEditedConsulta(null);
    setCalendarDate(null);
    setInputValue("");
    setInputError(null);
    setIsSaveDisabled(true);
    setSaveDisabledReason(null);
    setIsDateValid(true);
    setDateValidationMessage(null);
    setTimeError(null);
  };

  const handleExamFieldChange = (field: keyof EditableExam, value: any) => {
    if (!editedExam) return;

    if (field === "id_tipo_exame" && Array.isArray(examTypes)) {
      const selectedExamType = examTypes.find((et: ExamType) => et.id === parseInt(value));
      if (selectedExamType) {
        setEditedExam({
          ...editedExam,
          [field]: value,
        });

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

    // Se estiver alterando o horário e a data for hoje, valida
    if (field === "hora_agendamento" && calendarDate && isToday(calendarDate)) {
      if (isTimeBeforeNow(calendarDate, value)) {
        setTimeError(`Horário inválido para hoje. Hora atual: ${getCurrentTimeString()}`);
      } else {
        setTimeError(null);
      }
    }

    setEditedExam({ ...editedExam, [field]: value });
  };

  const handleConsultaFieldChange = (field: keyof EditableConsulta, value: any) => {
    if (!editedConsulta) return;

    if (field === "id_tipo_consulta" && Array.isArray(consultaTypes)) {
      const selectedConsultaType = consultaTypes.find((ct: ConsultaType) => ct.id === parseInt(value));
      if (selectedConsultaType) {
        setEditedConsulta({
          ...editedConsulta,
          [field]: value,
        });

        setLocalConsultas((prev) =>
          prev.map((consulta) => {
            if (consulta.id === editedConsulta.id) {
              return {
                ...consulta,
                Tipo_Consulta: selectedConsultaType,
                id_tipo_consulta: selectedConsultaType.id,
              };
            }
            return consulta;
          })
        );

        return;
      }
    }

    // Se estiver alterando o horário e a data for hoje, valida
    if (field === "hora_agendamento" && calendarDate && isToday(calendarDate)) {
      if (isTimeBeforeNow(calendarDate, value)) {
        setTimeError(`Horário inválido para hoje. Hora atual: ${getCurrentTimeString()}`);
      } else {
        setTimeError(null);
      }
    }

    setEditedConsulta({ ...editedConsulta, [field]: value });
  };

  const handleTimeChange = (time: string) => {
    if (editedExam) {
      // Valida o horário se a data for hoje
      if (calendarDate && isToday(calendarDate)) {
        if (isTimeBeforeNow(calendarDate, time)) {
          setTimeError(`Horário inválido para hoje. Hora atual: ${getCurrentTimeString()}`);
        } else {
          setTimeError(null);
        }
      }
      setEditedExam({ ...editedExam, hora_agendamento: time });
    }
    
    if (editedConsulta) {
      // Valida o horário se a data for hoje
      if (calendarDate && isToday(calendarDate)) {
        if (isTimeBeforeNow(calendarDate, time)) {
          setTimeError(`Horário inválido para hoje. Hora atual: ${getCurrentTimeString()}`);
        } else {
          setTimeError(null);
        }
      }
      setEditedConsulta({ ...editedConsulta, hora_agendamento: time });
    }
  };

  const canInitializeExam = (exam: any) => {
    if (exam.status_financeiro !== "PAGO" && exam.status_financeiro !== "ISENTO") return false;
    if (!isLabChief && !isLabTechnician) return false;
    return true;
  };

  const canInitializeConsulta = (consulta: any) => {
    if (consulta.status_financeiro !== "PAGO" && consulta.status_financeiro !== "ISENTO") return false;
    if (!isClinico) return false;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 z-[50]">
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
              {getItemStatusBadge(overallStatus)}
              <Button variant="ghost" size="sm" onClick={handleForceRefresh} className="h-8 px-2" title="Recarregar dados" disabled={isRefreshing}>
                {isRefreshing ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </Button>
              <DialogClose className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="px-6 py-4 space-y-4">
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      Status do Bloco
                    </div>
                    <div className="font-medium">{getItemStatusBadge(overallStatus)}</div>
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
                    <div className="font-medium text-green-600 text-sm">{new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(totalValue)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

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

            {isReceptionist && (
              <>
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
                              chiefId: selectedChief,
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

                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Clínico Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Clínico Atual</Label>
                        <p className="font-medium mt-1">{getClinicoName(schedule.id_clinico_alocado || null)}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Select value={selectedClinico || ""} onValueChange={setSelectedClinico}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecionar novo clínico" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(clinicos) &&
                              clinicos.map((clinico) => (
                                <SelectItem key={clinico.id} value={clinico.id}>
                                  {clinico.nome} - {clinico.tipo}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => {
                            // Implementar alocação de clínico
                            if (selectedClinico) {
                              ___showSuccessToastNotification({ message: "Funcionalidade em desenvolvimento" });
                            }
                          }}
                          disabled={!selectedClinico}
                          className="sm:w-auto"
                        >
                          Alocar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Exames */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Exames ({activeExams.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeExams.map((exam) => {
                  const currentPrice = exam.Tipo_Exame?.preco || 0;
                  const examCalendarDate = calendarDates.get(exam.id) || null;

                  return (
                    <div key={exam.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{exam.Tipo_Exame?.nome || "Exame não especificado"}</h4>
                          <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
                            <span>Status:</span>
                            {getItemStatusBadge(exam.status)}
                            <span>Financeiro:</span>
                            {getFinanceiroStatusBadge(exam.status_financeiro)}
                            <span>Reembolso:</span>
                            {getReembolsoStatusBadge(exam.status_reembolso)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {editingExam === exam.id ? (
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={handleSaveExam}
                                disabled={updateExamMutation.isPending || isSaveDisabled}
                                className={isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""}
                                title={isSaveDisabled && saveDisabledReason ? saveDisabledReason : "Salvar alterações"}
                              >
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                        {examType.nome} -{" "}
                                        {new Intl.NumberFormat("pt-AO", {
                                          style: "currency",
                                          currency: "AOA",
                                        }).format(examType.preco)}
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
                                  <SelectItem value="POR_REAGENDAR">Por Reagendar</SelectItem>
                                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                  {!isReceptionist && <SelectItem value="CONCLUIDO">Concluído</SelectItem>}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">Estado Financeiro</Label>
                              <Select value={editedExam.status_financeiro} onValueChange={(value) => handleExamFieldChange("status_financeiro", value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PAGO">Pago</SelectItem>
                                  <SelectItem value="NAO_PAGO">Não Pago</SelectItem>
                                  <SelectItem value="ISENTO">Isento</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">Estado de Reembolso</Label>
                              <Select value={editedExam.status_reembolso} onValueChange={(value) => handleExamFieldChange("status_reembolso", value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SEM_REEMBOLSO">Sem Reembolso</SelectItem>
                                  <SelectItem value="POR_REEMBOLSAR">Por Reembolsar</SelectItem>
                                  <SelectItem value="REEMBOLSADO">Reembolsado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm mb-2 block font-medium text-gray-700">Selecione a Data</Label>
                            <div className="mt-2 flex gap-2">
                              <div className="flex-1">
                                <div className="relative">
                                  <Input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    placeholder="dd/mm/aa"
                                    className={`w-full h-10 px-3 bg-white border rounded-md shadow-sm focus:ring-1 ${
                                      inputError
                                        ? "border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-500"
                                        : dateValidationMessage
                                        ? "border-amber-300 hover:border-amber-400 focus:border-amber-500 focus:ring-amber-500"
                                        : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                    }`}
                                  />
                                  <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                {inputError && <p className="text-xs text-red-500 mt-1">{inputError}</p>}
                                {dateValidationMessage && <p className="text-xs text-amber-600 mt-1">⚠️ {dateValidationMessage}</p>}
                                {!inputError && !dateValidationMessage && <p className="text-xs text-gray-500 mt-1">Formato: dd/mm/aa (ex: 25/12/24)</p>}
                              </div>

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
                                      disabled={(date) => isDateBeforeToday(date)}
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

                            {calendarDate && !inputError && (
                              <div className="mt-2 text-sm text-gray-700">
                                <span className="font-medium">Data selecionada:</span> {format(calendarDate, "dd/MM/yyyy")}
                                {isToday(calendarDate) && <span className="ml-2 text-blue-600">(Hoje)</span>}
                                {isDateBeforeToday(calendarDate) && <span className="ml-2 text-amber-600 font-medium">⚠️ Data anterior à atual</span>}
                              </div>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm">Selecione o Horário</Label>
                            <div className="mt-2">
                              <TimePicker 
                                value={editedExam.hora_agendamento} 
                                onChange={handleTimeChange} 
                                isToday={calendarDate ? isToday(calendarDate) : false}
                              />
                            </div>
                            {timeError && (
                              <p className="text-xs text-red-500 mt-1">{timeError}</p>
                            )}
                            {calendarDate && isToday(calendarDate) && !timeError && (
                              <p className="text-xs text-gray-500 mt-1">
                                Horário válido para hoje. Hora atual: {getCurrentTimeString()}
                              </p>
                            )}
                          </div>

                          {/* Mensagem de aviso sobre o botão de salvar */}
                          {isSaveDisabled && saveDisabledReason && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-amber-800">Atenção</p>
                                  <p className="text-xs text-amber-700 mt-1">
                                    O botão de salvar está bloqueado porque: <span className="font-semibold">{saveDisabledReason}</span>
                                  </p>
                                  <p className="text-xs text-amber-600 mt-1">Corrija os campos acima para poder salvar as alterações.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm pt-3 border-t">
                          <div>
                            <Label className="text-xs text-gray-500">Data e Hora</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <CalendarDays className="w-3 h-3 text-gray-500" />
                              <span className="font-medium">
                                {(() => {
                                  try {
                                    // Parse a string para Date
                                    const date = parseFromYYMMDD(exam.data_agendamento);
                                    if (date && isValid(date)) {
                                      return `${format(date, "dd/MM/yyyy")} às ${exam.hora_agendamento}`;
                                    }
                                    return `${exam.data_agendamento} às ${exam.hora_agendamento}`;
                                  } catch (error) {
                                    return `${exam.data_agendamento} às ${exam.hora_agendamento}`;
                                  }
                                })()}
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
                                  currency: "AOA",
                                }).format(currentPrice)}
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

            {/* Consultas */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Consultas ({activeConsultas.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeConsultas.map((consulta) => {
                  const currentPrice = consulta.Tipo_Consulta?.preco || 0;

                  return (
                    <div key={consulta.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{consulta.Tipo_Consulta?.nome || "Consulta não especificada"}</h4>
                          <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
                            <span>Status:</span>
                            {getItemStatusBadge(consulta.status)}
                            <span>Financeiro:</span>
                            {getFinanceiroStatusBadge(consulta.status_financeiro)}
                            <span>Reembolso:</span>
                            {getReembolsoStatusBadge(consulta.status_reembolso)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {editingConsulta === consulta.id ? (
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={handleSaveConsulta}
                                disabled={updateConsultaMutation.isPending || isSaveDisabled}
                                className={isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""}
                                title={isSaveDisabled && saveDisabledReason ? saveDisabledReason : "Salvar alterações"}
                              >
                                <Save className="w-3 h-3 mr-1" />
                                {updateConsultaMutation.isPending ? "Salvando..." : "Salvar"}
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={updateConsultaMutation.isPending}>
                                <X className="w-3 h-3 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleEditConsulta(consulta)}>
                              <Edit3 className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                          )}

                          {isClinico && canInitializeConsulta(consulta) && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                console.log("Inicializar consulta:", consulta.id);
                              }}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Iniciar
                            </Button>
                          )}
                        </div>
                      </div>

                      {editingConsulta === consulta.id && editedConsulta ? (
                        <div className="space-y-4 pt-3 border-t">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm">Tipo de Consulta</Label>
                              <Select value={editedConsulta.id_tipo_consulta?.toString() || ""} onValueChange={(value) => handleConsultaFieldChange("id_tipo_consulta", parseInt(value))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.isArray(consultaTypes) &&
                                    consultaTypes.map((consultaType: ConsultaType) => (
                                      <SelectItem key={consultaType.id} value={consultaType.id.toString()}>
                                        {consultaType.nome} -{" "}
                                        {new Intl.NumberFormat("pt-AO", {
                                          style: "currency",
                                          currency: "AOA",
                                        }).format(consultaType.preco)}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">Status</Label>
                              <Select value={editedConsulta.status} onValueChange={(value) => handleConsultaFieldChange("status", value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                                  <SelectItem value="POR_REAGENDAR">Por Reagendar</SelectItem>
                                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                  {!isReceptionist && <SelectItem value="CONCLUIDO">Concluído</SelectItem>}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">Estado Financeiro</Label>
                              <Select value={editedConsulta.status_financeiro} onValueChange={(value) => handleConsultaFieldChange("status_financeiro", value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PAGO">Pago</SelectItem>
                                  <SelectItem value="NAO_PAGO">Não Pago</SelectItem>
                                  <SelectItem value="ISENTO">Isento</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">Estado de Reembolso</Label>
                              <Select value={editedConsulta.status_reembolso} onValueChange={(value) => handleConsultaFieldChange("status_reembolso", value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SEM_REEMBOLSO">Sem Reembolso</SelectItem>
                                  <SelectItem value="POR_REEMBOLSAR">Por Reembolsar</SelectItem>
                                  <SelectItem value="REEMBOLSADO">Reembolsado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm mb-2 block font-medium text-gray-700">Selecione a Data</Label>
                            <div className="mt-2 flex gap-2">
                              <div className="flex-1">
                                <div className="relative">
                                  <Input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    placeholder="dd/mm/aa"
                                    className={`w-full h-10 px-3 bg-white border rounded-md shadow-sm focus:ring-1 ${
                                      inputError
                                        ? "border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-500"
                                        : dateValidationMessage
                                        ? "border-amber-300 hover:border-amber-400 focus:border-amber-500 focus:ring-amber-500"
                                        : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                    }`}
                                  />
                                  <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                {inputError && <p className="text-xs text-red-500 mt-1">{inputError}</p>}
                                {dateValidationMessage && <p className="text-xs text-amber-600 mt-1">⚠️ {dateValidationMessage}</p>}
                                {!inputError && !dateValidationMessage && <p className="text-xs text-gray-500 mt-1">Formato: dd/mm/aa (ex: 25/12/24)</p>}
                              </div>

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
                                      disabled={(date) => isDateBeforeToday(date)}
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

                            {calendarDate && !inputError && (
                              <div className="mt-2 text-sm text-gray-700">
                                <span className="font-medium">Data selecionada:</span> {format(calendarDate, "dd/MM/yyyy")}
                                {isToday(calendarDate) && <span className="ml-2 text-blue-600">(Hoje)</span>}
                                {isDateBeforeToday(calendarDate) && <span className="ml-2 text-amber-600 font-medium">⚠️ Data anterior à atual</span>}
                              </div>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm">Selecione o Horário</Label>
                            <div className="mt-2">
                              <TimePicker 
                                value={editedConsulta.hora_agendamento} 
                                onChange={handleTimeChange} 
                                isToday={calendarDate ? isToday(calendarDate) : false}
                              />
                            </div>
                            {timeError && (
                              <p className="text-xs text-red-500 mt-1">{timeError}</p>
                            )}
                            {calendarDate && isToday(calendarDate) && !timeError && (
                              <p className="text-xs text-gray-500 mt-1">
                                Horário válido para hoje. Hora atual: {getCurrentTimeString()}
                              </p>
                            )}
                          </div>

                          {/* Mensagem de aviso sobre o botão de salvar */}
                          {isSaveDisabled && saveDisabledReason && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-amber-800">Atenção</p>
                                  <p className="text-xs text-amber-700 mt-1">
                                    O botão de salvar está bloqueado porque: <span className="font-semibold">{saveDisabledReason}</span>
                                  </p>
                                  <p className="text-xs text-amber-600 mt-1">Corrija os campos acima para poder salvar as alterações.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm pt-3 border-t">
                          <div>
                            <Label className="text-xs text-gray-500">Data e Hora</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <CalendarDays className="w-3 h-3 text-gray-500" />
                              <span className="font-medium">
                                {(() => {
                                  try {
                                    // Parse a string para Date
                                    const date = parseFromYYMMDD(consulta.data_agendamento);
                                    if (date && isValid(date)) {
                                      return `${format(date, "dd/MM/yyyy")} às ${consulta.hora_agendamento}`;
                                    }
                                    return `${consulta.data_agendamento} às ${consulta.hora_agendamento}`;
                                  } catch (error) {
                                    return `${consulta.data_agendamento} às ${consulta.hora_agendamento}`;
                                  }
                                })()}
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
                                  currency: "AOA",
                                }).format(currentPrice)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Clínico Alocado</Label>
                            <p className="font-medium mt-1">{getClinicoName(consulta.id_clinico_alocado)}</p>
                          </div>
                        </div>
                      )}

                      {isReceptionist && editingConsulta !== consulta.id && (
                        <div className="pt-3 border-t">
                          <Label className="text-sm">Alocar Clínico</Label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Select value={selectedClinico || ""} onValueChange={setSelectedClinico}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Selecionar clínico" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.isArray(clinicos) &&
                                  clinicos.map((clinico) => (
                                    <SelectItem key={clinico.id} value={clinico.id}>
                                      {clinico.nome} - {clinico.tipo}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={() =>
                                selectedClinico &&
                                allocateClinicoMutation.mutate({
                                  consultaId: consulta.id,
                                  clinicoId: selectedClinico,
                                })
                              }
                              disabled={!selectedClinico || allocateClinicoMutation.isPending}
                              className="sm:w-auto"
                            >
                              {allocateClinicoMutation.isPending ? "Alocando..." : "Alocar"}
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