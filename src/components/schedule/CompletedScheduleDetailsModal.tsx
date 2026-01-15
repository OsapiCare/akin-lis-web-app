"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Mail,
  Users,
  Save,
  X,
  DollarSign,
  CreditCard,
  Shield,
  ChevronDown,
  ClipboardList,
  RefreshCw,
  FileText,
  Calendar,
  Sparkles,
  Zap,
  Activity,
  Heart,
  Brain,
  Eye,
  Thermometer,
  Pill,
  Syringe,
  Microscope,
} from "lucide-react";
import { format, parse, isValid, isBefore, startOfDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { _axios } from "@/Api/axios.config";
import { ___showSuccessToastNotification, ___showErrorToastNotification } from "@/lib/sonner";
import { getAllDataInCookies } from "@/utils/get-data-in-cookies";
import { labTechniciansRoutes } from "@/Api/Routes/lab-technicians/index.routes";
import { labChiefRoutes } from "@/Api/Routes/lab-chief/index.routes";
import { examRoutes } from "@/Api/Routes/Exam/index.route";
import TimePicker from "@/components/ui/timepicker";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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

const parseFromYYMMDD = (dateString: string): Date | null => {
  if (!dateString || dateString?.trim() === "") return null;

  try {
    const trimmedString = dateString.trim();

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

    // Tenta formatos comuns
    const formats = ["dd/MM/yy", "dd/MM/yyyy", "dd-MM-yyyy", "yyyy-MM-dd"];

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

const formatToYYMMDD = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) return "";

  try {
    return format(date, "yy/M/d");
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "";
  }
};

const formatForDisplay = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) return "";
  return format(date, "dd/MM/yyyy");
};

const formatForInput = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) return "";
  try {
    return format(date, "dd/MM/yy");
  } catch (error) {
    console.error("Erro ao formatar data para input:", error);
    return "";
  }
};

const isDateBeforeToday = (date: Date): boolean => {
  const today = startOfDay(new Date());
  const selectedDate = startOfDay(date);
  return isBefore(selectedDate, today);
};

const isTimeBeforeNow = (date: Date, time: string): boolean => {
  if (!date || !time) return false;

  try {
    const [hours, minutes] = time.split(":").map(Number);
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();

    return isBefore(selectedDateTime, now);
  } catch (error) {
    console.error("Erro ao verificar horário:", error);
    return false;
  }
};

const getCurrentTimeString = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// ======================== COMPONENTES DE UI ========================

const StatusBadge = ({ status, type }: { status: string; type: "item" | "financeiro" | "reembolso" }) => {
  // Definir tipos para as configurações
  type StatusConfig = {
    text: string;
    variant: "default" | "outline" | "secondary" | "destructive";
    className: string;
  };

  type ConfigType = Record<string, StatusConfig>;

  const configs: Record<string, ConfigType> = {
    item: {
      PENDENTE: {
        text: "Pendente",
        variant: "outline",
        className: "border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700",
      },
      CANCELADO: {
        text: "Cancelado",
        variant: "outline",
        className: "border-red-200 bg-gradient-to-r from-red-50 to-red-100 text-red-700",
      },
      POR_REAGENDAR: {
        text: "Por Reagendar",
        variant: "outline",
        className: "border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700",
      },
      EM_ANDAMENTO: {
        text: "Em Andamento",
        variant: "default",
        className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
      },
      CONCLUIDO: {
        text: "Concluído",
        variant: "default",
        className: "bg-gradient-to-r from-green-500 to-green-600 text-white",
      },
    },
    financeiro: {
      PAGO: {
        text: "Pago",
        variant: "default",
        className: "bg-gradient-to-r from-green-500 to-green-600 text-white",
      },
      NAO_PAGO: {
        text: "Não Pago",
        variant: "outline",
        className: "border-red-200 bg-gradient-to-r from-red-50 to-red-100 text-red-700",
      },
      PENDENTE: {
        text: "Pendente",
        variant: "outline",
        className: "border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700",
      },
      ISENTO: {
        text: "Isento",
        variant: "outline",
        className: "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700",
      },
    },
    reembolso: {
      REEMBOLSADO: {
        text: "Reembolsado",
        variant: "default",
        className: "bg-gradient-to-r from-green-500 to-green-600 text-white",
      },
      POR_REEMBOLSAR: {
        text: "Por Reembolsar",
        variant: "outline",
        className: "border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700",
      },
      SEM_REEMBOLSO: {
        text: "Sem Reembolso",
        variant: "outline",
        className: "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700",
      },
    },
  };

  // Acessar a configuração de forma segura
  const typeConfig = configs[type];
  const config = typeConfig?.[status] || {
    text: status,
    variant: "outline" as const,
    className: "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700",
  };

  return (
    <Badge variant={config.variant} className={`text-xs px-3 py-1 font-medium ${config.className}`}>
      {config.text}
    </Badge>
  );
};

const InfoCard = ({ icon, title, value, className = "" }: { icon: React.ReactNode; title: string; value: React.ReactNode; className?: string }) => (
  <div className={`bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 ${className}`}>
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">{icon}</div>
      <span className="text-sm font-medium text-gray-600">{title}</span>
    </div>
    <div className="text-lg font-semibold text-gray-800">{value}</div>
  </div>
);

const PatientInfoItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <span className="text-gray-500">{icon}</span>
      <Label className="text-xs text-gray-500">{label}</Label>
    </div>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
);

// ======================== COMPONENTE PRINCIPAL ========================

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
  const [calendarDates, setCalendarDates] = useState<Map<number, Date | null>>(new Map());
  const [activeTab, setActiveTab] = useState<string>("overview");

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
    queryFn: async () => (await _axios.get("/general-practitioners")).data,
    enabled: isReceptionist || isClinico,
  });

  const { data: examTypesResponse } = useQuery({
    queryKey: ["exam-types"],
    queryFn: async () => await examRoutes.getExamTypes(),
    enabled: isReceptionist || isLabChief || isLabTechnician,
  });

  const { data: consultaTypesResponse } = useQuery({
    queryKey: ["consulta-types"],
    queryFn: async () => (await _axios.get("/consultation-types")).data,
    enabled: isReceptionist || isClinico,
  });

  const consultaType = consultaTypesResponse?.data || [];

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

    if (schedule?.Consulta) {
      const activeConsultas = schedule.Consulta.filter((consulta: any) => consulta.status !== "CONCLUIDO");

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

  const handleForceRefresh = async () => {
    try {
      setIsRefreshing(true);
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["consultas"] });

      await Promise.all([queryClient.invalidateQueries({ queryKey: ["completed-schedules"] }), queryClient.invalidateQueries({ queryKey: ["schedules"] }), queryClient.invalidateQueries({ queryKey: ["exams"] }), queryClient.invalidateQueries({ queryKey: ["consultas"] })]);

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
  const hasPendingPayment = schedule.Exame?.some((exam) => exam.status_pagamento === "PENDENTE") || schedule.Consulta?.some((consulta: any) => consulta.status_pagamento === "PENDENTE");

  const calculateOverallScheduleStatus = () => {
    const exams = schedule?.Exame || [];
    const consultas = schedule?.Consulta || [];
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
  const activeExams = localExams.length > 0 ? localExams : schedule?.Exame?.filter((exam) => exam.status !== "CONCLUIDO") || [];
  const activeConsultas = localConsultas.length > 0 ? localConsultas : schedule?.Consulta?.filter((consulta: any) => consulta.status !== "CONCLUIDO") || [];

  if (overallStatus === "CONCLUIDO") return null;
  const getPatientAge = () => {
    if (!schedule?.Paciente?.data_nascimento) return "N/A";
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
    (schedule?.Paciente?.nome_completo || "")
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
    return clinicos.find((c: any) => c.id === id)?.nome || "Clínico não encontrado";
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





  // ======================== RENDERIZAÇÃO ========================

  if (!schedule) return null;

  // ======================== FUNÇÕES DE VALIDAÇÃO ========================

  const canInitializeExam = (exam: any, isLabChief: boolean, isLabTechnician: boolean): boolean => {
    if (exam.status_financeiro !== "PAGO" && exam.status_financeiro !== "ISENTO") return false;
    if (!isLabChief && !isLabTechnician) return false;
    return true;
  };

  const canInitializeConsulta = (consulta: any, isClinico: boolean): boolean => {
    if (consulta.status_financeiro !== "PAGO" && consulta.status_financeiro !== "ISENTO") return false;
    if (!isClinico) return false;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[100vh] overflow-hidden p-0 z-[100]">
        {/* HEADER MODERNIZADO */}
        <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-800">
                  Agendamento <span className="text-blue-600">#{schedule.id}</span>
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-700">{schedule.Paciente?.nome_completo}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{getPatientAge()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={overallStatus} type="item" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleForceRefresh}
                  // disabled={isRefreshing}
                  className="h-9 w-9 hover:bg-white/50 border border-gray-200 rounded-lg"
                  title="Recarregar dados"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
              <DialogClose className="p-2 hover:bg-white/50 border border-gray-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        {/* CONTEÚDO PRINCIPAL */}
        <ScrollArea className="h-[calc(90vh-73px)]">
          <div className="p-6 space-y-6">
            {/* CARDS DE RESUMO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard icon={<Activity className="w-5 h-5 text-blue-600" />} title="Status do Bloco" value={<StatusBadge status={overallStatus} type="item" />} />
              <InfoCard icon={<CreditCard className="w-5 h-5 text-green-600" />} title="Status Pagamento" value={<StatusBadge status={schedule.status_pagamento} type="financeiro" />} />
              <InfoCard icon={<CalendarDays className="w-5 h-5 text-purple-600" />} title="Criado em" value={format(new Date(schedule.criado_aos), "dd/MM/yyyy HH:mm", { locale: ptBR })} />
              <InfoCard icon={<DollarSign className="w-5 h-5 text-emerald-600" />} title="Valor Total" value={<span className="text-emerald-700 font-bold">{new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(totalValue)}</span>} />
            </div>

            {/* TABS PARA NAVEGAÇÃO */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-6 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg">
                  <User className="w-4 h-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="exams" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Exames ({activeExams.length})
                </TabsTrigger>
                <TabsTrigger value="consultations" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Consultas ({activeConsultas.length})
                </TabsTrigger>
              </TabsList>

              {/* ABA DE VISÃO GERAL */}
              <TabsContent value="overview" className="space-y-6">
                {/* INFORMAÇÕES DO PACIENTE */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        Informações do Paciente
                      </CardTitle>
                      <Badge variant="outline" className="border-blue-200 text-blue-600">
                        ID: {schedule.Paciente?.numero_identificacao || "N/A"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                          <AvatarImage src="" alt={schedule.Paciente?.nome_completo} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">{getPatientInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="mt-4 text-center">
                          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-full">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium text-gray-700">{schedule.Paciente?.sexo?.nome || "Não informado"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <div className="space-y-4">
                          <PatientInfoItem label="Nome Completo" value={schedule.Paciente?.nome_completo} icon={<User className="w-4 h-4" />} />
                          <PatientInfoItem label="Idade" value={getPatientAge()} icon={<Calendar className="w-4 h-4" />} />
                          <PatientInfoItem label="BI/Identificação" value={schedule.Paciente?.numero_identificacao || "Não informado"} icon={<FileText className="w-4 h-4" />} />
                        </div>
                        <div className="space-y-4">
                          <PatientInfoItem label="Telefone" value={schedule.Paciente?.contacto_telefonico ?? "Não Informado"} icon={<Phone className="w-4 h-4" />} />
                          <PatientInfoItem label="Email" value={schedule.Paciente?.email || "Não informado"} icon={<Mail className="w-4 h-4" />} />
                          <div className="flex items-center gap-2 pt-2">
                            <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                              <Zap className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Status Geral</Label>
                              <StatusBadge status={overallStatus} type="item" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SEÇÃO DE ALOCAÇÕES (APENAS RECEPCIONISTA) */}
                {isReceptionist && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="borde shadow-sm bg-gradient-to-br from-white to-blue-50 mb-11">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          Chefe de Laboratório
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                            <Label className="text-sm font-medium text-gray-700 mb-2">Chefe Atual</Label>
                            <p className="font-semibold text-gray-800 text-lg">{getChiefName(schedule.id_chefe_alocado || null)}</p>
                          </div>
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">Alocar Novo Chefe</Label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Select value={selectedChief ?? ""} onValueChange={setSelectedChief}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Selecionar chefe..." />
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
                                className="sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                              >
                                <Users className="w-4 h-4 mr-2" />
                                {allocateChiefMutation.isPending ? "Alocando..." : "Alocar"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50 mb-11">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          Clínico Geral
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                            <Label className="text-sm font-medium text-gray-700 mb-2">Clínico Atual</Label>
                            <p className="font-semibold text-gray-800 text-lg">{getClinicoName(schedule.id_clinico_alocado ?? "")}</p>
                          </div>
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">Alocar Novo Clínico</Label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Select value={selectedClinico || ""} onValueChange={setSelectedClinico}>
                                <SelectTrigger className="flex-1 border-gray-300">
                                  <SelectValue placeholder="Selecionar clínico..." />
                                </SelectTrigger>
                                <SelectContent className="bg-red-500 text-white">
                                  {Array.isArray(clinicos) &&
                                    clinicos.map((clinico) => (
                                      <SelectItem className="bg-red-500 text-white" key={clinico.id} value={clinico.id}>
                                           {clinico.nome} -  {clinico.tipo}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={() => {
                                  if(selectedClinico){
                              ___showSuccessToastNotification({ message: "Funcionalidade em desenvolvimento" });
                                  }
                                }}
                                disabled={!selectedClinico}
                                className="sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Alocar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* ABA DE EXAMES */}
              <TabsContent value="exams" className="space-y-4 mb-5">
                {activeExams.length === 0 ? (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="py-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                        <Stethoscope className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-700 text-lg mb-2">Nenhum exame pendente</h3>
                      <p className="text-gray-500">Todos os exames foram concluídos ou cancelados.</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeExams.map((exam) => <ExamItem key={exam.id} exam={exam} editing={editingExam === exam.id} editedExam={editedExam} />)
                )}
              </TabsContent>

              {/* ABA DE CONSULTAS */}
              <TabsContent value="consultations" className="space-y-4 mb-5">
                {activeConsultas.length === 0 ? (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="py-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                        <ClipboardList className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-700 text-lg mb-2">Nenhuma consulta pendente</h3>
                      <p className="text-gray-500">Todas as consultas foram concluídas ou canceladas.</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeConsultas.map((consulta) => (
                    <ConsultaItem
                      key={consulta.id}
                      consulta={consulta}
                      editing={editingConsulta === consulta.id}
                      editedConsulta={editedConsulta}
                      // ... outras props necessárias
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ======================== COMPONENTES DE ITEM ========================

const ExamItem = ({ exam, editing, editedExam, ...props }: any) => {
  const [editingExam, setEditingExam] = useState<number | null>(null);
  const [editingConsulta, setEditingConsulta] = useState<number | null>(null);
  const [, setEditedExam] = useState<EditableExam | null>(null);
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isDateValid, setIsDateValid] = useState<boolean>(true);
  const [dateValidationMessage, setDateValidationMessage] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

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
      // status_pagamento: exam.status_pagamento,
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

  // Queries (mantidas)
  const { data: technicians } = useQuery({
    queryKey: ["lab-technicians"],
    queryFn: async () => (await labTechniciansRoutes.getAllLabTechnicians()).data,
  });

  function getTechnicianName(id: string | null): string {
    if (!id) return "Não alocado";

    // Se você tiver acesso ao array de técnicos, use esta lógica:
    if (technicians && Array.isArray(technicians)) {
      const technician = technicians.find((t: any) => t.id === id);
      return technician?.nome || "Técnico não encontrado";
    }

    return "Técnico não encontrado";
  }

  const getExamIcon = (examName: string) => {
    const name = examName.toLowerCase();
    if (name.includes("sangue") || name.includes("hemograma")) return <Syringe className="w-5 h-5 text-red-500" />;
    if (name.includes("raio") || name.includes("x")) return <Eye className="w-5 h-5 text-blue-500" />;
    if (name.includes("urina")) return <Thermometer className="w-5 h-5 text-yellow-500" />;
    if (name.includes("coração") || name.includes("cardio")) return <Heart className="w-5 h-5 text-red-500" />;
    if (name.includes("cérebro") || name.includes("neuro")) return <Brain className="w-5 h-5 text-purple-500" />;
    return <Microscope className="w-5 h-5 text-green-500" />;
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-11">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">{getExamIcon(exam.Tipo_Exame?.nome || "Exame")}</div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{exam.Tipo_Exame?.nome || "Exame não especificado"}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={exam.status} type="item" />
                  <StatusBadge status={exam.status_financeiro} type="financeiro" />
                  <StatusBadge status={exam.status_reembolso} type="reembolso" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editing ? (
                <div className="flex gap-2">
                  <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  // onClick={handleSaveExam}
                  // title={isSav}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm">
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => handleEditExam(exam)} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Edit3 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              )}

              <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Clock className="w-4 h-4 mr-1" />
                Iniciar
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Conteúdo do exame */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-medium">Data e Hora</Label>
              <div className="flex items-center gap-2 text-gray-800">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">
                  {formatForDisplay(parseFromYYMMDD(exam.data_agendamento))} às {exam.hora_agendamento}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-medium">Preço</Label>
              <div className="flex items-center gap-2 text-emerald-700">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="font-bold">{formatCurrency(exam.Tipo_Exame?.preco || 0)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-medium">Técnico Alocado</Label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">{getTechnicianName(exam.id_tecnico_alocado)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ConsultaItem = ({ consulta, editing, editedConsulta, ...props }: any) => {
  const [editingConsulta, setEditingConsulta] = useState<number | null>(null);
  const [editingExam, setEditingExam] = useState<EditableExam | null>(null);
  const [, setEditedConsulta] = useState<EditableConsulta | null>(null);
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isDateValid, setIsDateValid] = useState<boolean>(true);
  const [dateValidationMessage, setDateValidationMessage] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

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

  const { data: clinicos } = useQuery({
    queryKey: ["clinicos"],
    queryFn: async () => (await _axios.get("/general-practitioners")).data,
  });

  function getClinicoName(id: string | null): string {
    if (!id) return "Não alocado";

    // Se você tiver acesso ao array de clínicos, use esta lógica:
    if (clinicos && Array.isArray(clinicos)) {
      const clinico = clinicos.find((c: any) => c.id === id);
      return clinico?.nome || "Clínico não encontrado";
    }

    return "Clínico não encontrado";
  }
  return (
    <Card className="border-0 shadow-lg mb-11 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Heart className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{consulta.Tipo_Consulta?.nome || "Consulta não especificada"}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={consulta.status} type="item" />
                  <StatusBadge status={consulta.status_financeiro} type="financeiro" />
                  <StatusBadge status={consulta.status_reembolso} type="reembolso" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editing ? (
                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                    <Save className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm">
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                  <Edit3 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              )}

              <Button variant="default" size="sm" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                <Clock className="w-4 h-4 mr-1" />
                Iniciar
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Conteúdo da consulta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-medium">Data e Hora</Label>
              <div className="flex items-center gap-2 text-gray-800">
                <CalendarDays className="w-4 h-4 text-green-500" />
                <span className="font-semibold">
                  {formatForDisplay(parseFromYYMMDD(consulta.data_agendamento))} às {consulta.hora_agendamento}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-medium">Preço</Label>
              <div className="flex items-center gap-2 text-emerald-700">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="font-bold">{formatCurrency(consulta.Tipo_Consulta?.preco || 0)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-medium">Clínico Alocado</Label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">{getClinicoName(consulta.id_clinico_alocado)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
