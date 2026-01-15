"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Grid3X3, List, RefreshCw, Calendar, Users, Clock, AlertTriangle, CheckCircle, TrendingUp, BarChart3, AlertCircle, XCircle, Stethoscope, FileText, Phone, IdCard, User, CalendarDays, DollarSign, Clock4, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { consultaRoutes, scheduleRoutes } from "@/Api/Routes/schedule/index.routes";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { ScheduleStats } from "@/components/schedule/ScheduleStats";
import { BulkActions } from "@/components/schedule/BulkActions";
import { useScheduleFilters } from "@/hooks/useScheduleFilters";
import { format, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { examRoutes } from "@/Api/Routes/Exam/index.route";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Interface para agrupamento por paciente
interface PacienteAgendamento {
  id_paciente: number;
  paciente_nome: string;
  paciente_data_nascimento: string;
  paciente_sexo: string;
  paciente_contacto: string;
  paciente_numero_identificacao: string;
  exames: any[];
  consultas: any[];
  status: string;
  criado_aos: string;
}

// Função para agrupar agendamentos por paciente
const agruparPorPaciente = (exames: any, consultas: any): PacienteAgendamento[] => {
  const pacientesMap = new Map<number, PacienteAgendamento>();

  // Função auxiliar para garantir que temos um array
  const toArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object") {
      const possibleArrayProps = ["data", "results", "records", "items", "list", "array"];
      for (const prop of possibleArrayProps) {
        if (data[prop] && Array.isArray(data[prop])) {
          return data[prop];
        }
      }
      const values = Object.values(data);
      if (values.length > 0 && Array.isArray(values[0])) {
        return values[0];
      }
      if (data[Symbol.iterator]) {
        return Array.from(data);
      }
    }
    return [];
  };

  const examesArray = toArray(exames);
  const consultasArray = toArray(consultas);

  // Processar exames
  examesArray.forEach((exame) => {
    try {
      const pacienteInfo = exame?.Paciente;
      if (pacienteInfo) {
        const pacienteId = pacienteInfo.id;
        const pacienteNome = pacienteInfo.nome_completo || "Paciente";
        
        if (!pacientesMap.has(pacienteId)) {
          pacientesMap.set(pacienteId, {
            id_paciente: pacienteId,
            paciente_nome: pacienteNome,
            paciente_data_nascimento: pacienteInfo.data_nascimento || "",
            paciente_sexo: pacienteInfo.id_sexo === 1 ? "Masculino" : pacienteInfo.id_sexo === 2 ? "Feminino" : "Não informado",
            paciente_contacto: pacienteInfo.contacto_telefonico || "",
            paciente_numero_identificacao: pacienteInfo.numero_identificacao || "",
            exames: [],
            consultas: [],
            status: exame.status || "PENDENTE",
            criado_aos: exame.criado_aos || new Date().toISOString(),
          });
        }
        const paciente = pacientesMap.get(pacienteId)!;
        paciente.exames.push(exame);
        if (exame.status === "PENDENTE") paciente.status = "PENDENTE";
      }
    } catch (error) {
      console.error("Erro ao processar exame:", exame, error);
    }
  });

  // Processar consultas
  consultasArray.forEach((consulta) => {
    try {
      const pacienteInfo = consulta?.Agendamento?.Paciente;
      if (pacienteInfo) {
        const pacienteId = pacienteInfo.id;
        const pacienteNome = pacienteInfo.nome_completo || "Paciente";
        
        if (!pacientesMap.has(pacienteId)) {
          pacientesMap.set(pacienteId, {
            id_paciente: pacienteId,
            paciente_nome: pacienteNome,
            paciente_data_nascimento: "",
            paciente_sexo: pacienteInfo.id_sexo === 1 ? "Masculino" : pacienteInfo.id_sexo === 2 ? "Feminino" : "Não informado",
            paciente_contacto: "",
            paciente_numero_identificacao: "",
            exames: [],
            consultas: [],
            status: consulta.status || "PENDENTE",
            criado_aos: consulta.criado_aos || new Date().toISOString(),
          });
        }
        const paciente = pacientesMap.get(pacienteId)!;
        paciente.consultas.push(consulta);
        if (consulta.status === "PENDENTE") paciente.status = "PENDENTE";
      }
    } catch (error) {
      console.error("Erro ao processar consulta:", consulta, error);
    }
  });

  return Array.from(pacientesMap.values());
};

export default function Request() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  // Buscar dados
  const { data: schedules = [], isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["pending-schedules"],
    queryFn: () => scheduleRoutes.getPendingSchedules(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: consultasRaw, isLoading: isLoadingConsultas } = useQuery({
    queryKey: ["pending-consultas"],
    queryFn: async () => {
      try {
        const response = await consultaRoutes.getPendingConsultas();
        if (Array.isArray(response)) return response;
        if (response && typeof response === "object") {
          const possibleDataProps = ["data", "results", "records", "items", "consultas"];
          for (const prop of possibleDataProps) {
            if (response[prop] && Array.isArray(response[prop])) {
              return response[prop];
            }
          }
          const values = Object.values(response);
          for (const value of values) {
            if (Array.isArray(value)) {
              return value;
            }
          }
        }
        return [];
      } catch (error) {
        console.error("Erro ao buscar consultas:", error);
        return [];
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const consultas = useMemo(() => {
    if (!consultasRaw) return [];
    if (Array.isArray(consultasRaw)) return consultasRaw;
    return [];
  }, [consultasRaw]);

  const pacientesAgendamentos = useMemo(() => {
    return agruparPorPaciente(schedules, consultas);
  }, [schedules, consultas]);

  const { filteredSchedules: filteredPacientes, filters, handleSearch, handleFilterChange } = useScheduleFilters(pacientesAgendamentos as any);

  // Estatísticas
  const totalPacientes = pacientesAgendamentos.length;
  const totalExames = pacientesAgendamentos.reduce((total, paciente) => total + paciente.exames.length, 0);
  const totalConsultas = pacientesAgendamentos.reduce((total, paciente) => total + paciente.consultas.length, 0);

  const totalRevenue = useMemo(() => {
    let revenue = 0;
    
    pacientesAgendamentos.forEach((paciente) => {
      // Calcular receita de exames
      paciente.exames.forEach((exame: any) => {
        const examesArray = exame?.Exame || [];
        examesArray.forEach((item: any) => {
          revenue += item?.Tipo_Exame?.preco || 0;
        });
      });
      
      // Calcular receita de consultas
      paciente.consultas.forEach((consulta: any) => {
        revenue += consulta?.Tipo_Consulta?.preco || 0;
      });
    });
    
    return revenue;
  }, [pacientesAgendamentos]);

  const todaySchedules = useMemo(() => {
    const today = new Date().toDateString();
    return pacientesAgendamentos.filter((paciente) => {
      const hasTodayExame = paciente.exames.some((exame: any) => {
        const examesArray = exame?.Exame || [];
        return examesArray.some((item: any) => {
          const itemDate = item?.data_agendamento;
          return itemDate && new Date(itemDate).toDateString() === today;
        });
      });
      
      const hasTodayConsulta = paciente.consultas.some((consulta: any) => {
        const consultaDate = consulta?.data_agendamento;
        return consultaDate && new Date(consultaDate).toDateString() === today;
      });
      
      return hasTodayExame || hasTodayConsulta;
    });
  }, [pacientesAgendamentos]);

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: (scheduleId: number) => scheduleRoutes.acceptSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["pending-consultas"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ scheduleId }: { scheduleId: number }) => scheduleRoutes.rejectSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["pending-consultas"] });
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedScheduleId(null);
    },
  });

  // Handlers
  const toggleCardExpansion = (pacienteId: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(pacienteId)) {
      newExpanded.delete(pacienteId);
    } else {
      newExpanded.add(pacienteId);
    }
    setExpandedCards(newExpanded);
  };

  const handleAccept = (pacienteId: number) => {
    const paciente = pacientesAgendamentos.find((p) => p.id_paciente === pacienteId);
    if (paciente) {
      paciente.exames.forEach((exame: any) => {
        acceptMutation.mutate(exame.id);
      });
      // Aqui você precisaria adicionar lógica para aceitar consultas
    }
  };

  const openRejectDialog = (pacienteId: number) => {
    setSelectedScheduleId(pacienteId);
    setShowRejectDialog(true);
  };

  const handleConfirmReject = () => {
    if (selectedScheduleId && rejectReason.trim()) {
      rejectMutation.mutate({
        scheduleId: selectedScheduleId,
      });
    }
  };

  // Componente de Bloco de Exames
  const ExamesBlock = ({ exames, pacienteId }: { exames: any[], pacienteId: number }) => {
    if (exames.length === 0) return null;

    const isExpanded = expandedCards.has(pacienteId);
    const totalExames = exames.reduce((total, exame) => total + (exame?.Exame?.length || 0), 0);
    const totalValor = exames.reduce((total, exame) => {
      const examesArray = exame?.Exame || [];
      return total + examesArray.reduce((subTotal: number, item: any) => 
        subTotal + (item?.Tipo_Exame?.preco || 0), 0);
    }, 0);

    return (
      <Card className="w-full border-blue-200 border-l-4">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-blue-800">
                  Exames ({totalExames})
                </CardTitle>
                <p className="text-sm text-gray-600">Agendamentos de exames laboratoriais</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {totalValor > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-xl font-bold text-green-700">
                    {new Intl.NumberFormat("pt-AO", {
                      style: "currency",
                      currency: "AOA",
                    }).format(totalValor)}
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCardExpansion(pacienteId)}
                className="p-1"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                {exames.map((exame, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    {/* Informações do agendamento */}
                    <div className="mb-4 pb-3 border-b border-blue-200">
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                          Agendamento #{exame.id}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {exame.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            Criado: {format(new Date(exame.criado_aos), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                        {exame.id_unidade_de_saude && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              Unidade: {exame.id_unidade_de_saude}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            Pagamento: {exame.status_pagamento}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Itens de exame */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-800">Itens Agendados:</h4>
                      {(exame.Exame || []).map((item: any, itemIndex: number) => (
                        <div key={itemIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-2">
                                <div className="mt-1">
                                  <Stethoscope className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-gray-900">
                                    {item?.Tipo_Exame?.nome || "Exame não especificado"}
                                  </h5>
                                  {item?.Tipo_Exame?.descricao && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {item.Tipo_Exame.descricao}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                                {item.data_agendamento && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">
                                      {format(new Date(item.data_agendamento), "dd/MM/yyyy")}
                                    </span>
                                  </div>
                                )}
                                
                                {item.hora_agendamento && (
                                  <div className="flex items-center gap-2">
                                    <Clock4 className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{item.hora_agendamento}</span>
                                  </div>
                                )}
                                
                                {item.status && (
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="outline" 
                                      className={`${
                                        item.status === "PENDENTE" 
                                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                          : item.status === "CONCLUIDO"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : "bg-gray-50 text-gray-700 border-gray-200"
                                      }`}
                                    >
                                      {item.status}
                                    </Badge>
                                  </div>
                                )}
                                
                                {item.valor_total > 0 && (
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-green-700">
                                      {new Intl.NumberFormat("pt-AO", {
                                        style: "currency",
                                        currency: "AOA",
                                      }).format(item.valor_total)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="md:w-48 flex flex-col gap-2">
                              {item.isento && (
                                <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                                  ISENTO
                                </Badge>
                              )}
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Status Pagamento</p>
                                <Badge 
                                  variant="outline" 
                                  className={`mt-1 ${
                                    item.status_pagamento === "PAGO"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-red-50 text-red-700 border-red-200"
                                  }`}
                                >
                                  {item.status_pagamento || "NÃO PAGO"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // Componente de Bloco de Consultas
  const ConsultasBlock = ({ consultas, pacienteId }: { consultas: any[], pacienteId: number }) => {
    if (consultas.length === 0) return null;

    const isExpanded = expandedCards.has(pacienteId);
    const totalValor = consultas.reduce((total, consulta) => 
      total + (consulta?.Tipo_Consulta?.preco || 0), 0);

    return (
      <Card className="w-full border-green-200 border-l-4 mt-4 mb-5">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-green-800">
                  Consultas ({consultas.length})
                </CardTitle>
                <p className="text-sm text-gray-600">Agendamentos de consultas médicas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {totalValor > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-xl font-bold text-green-700">
                    {new Intl.NumberFormat("pt-AO", {
                      style: "currency",
                      currency: "AOA",
                    }).format(totalValor)}
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCardExpansion(pacienteId)}
                className="p-1"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                {consultas.map((consulta, index) => (
                  <div key={index} className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="mt-1">
                            <FileText className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900 text-lg">
                              {consulta?.Tipo_Consulta?.nome || "Consulta não especificada"}
                            </h5>
                            {consulta?.Tipo_Consulta?.descricao && (
                              <p className="text-sm text-gray-600 mt-1">
                                {consulta.Tipo_Consulta.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {consulta.data_agendamento && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700">Data</span>
                              </div>
                              <p className="text-base font-bold text-gray-900">
                                {format(new Date(consulta.data_agendamento), "dd/MM/yyyy")}
                              </p>
                              {isToday(new Date(consulta.data_agendamento)) && (
                                <Badge className="mt-1 bg-blue-100 text-blue-700">
                                  Hoje
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {consulta.hora_agendamento && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock4 className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700">Hora</span>
                              </div>
                              <p className="text-base font-bold text-gray-900">
                                {consulta.hora_agendamento}
                              </p>
                            </div>
                          )}
                          
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Status</span>
                            </div>
                            <Badge 
                              className={`font-bold ${
                                consulta.status === "PENDENTE"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : consulta.status === "CONCLUIDO"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              }`}
                            >
                              {consulta.status}
                            </Badge>
                          </div>
                          
                          {consulta?.Tipo_Consulta?.preco > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700">Valor</span>
                              </div>
                              <p className="text-base font-bold text-green-700">
                                {new Intl.NumberFormat("pt-AO", {
                                  style: "currency",
                                  currency: "AOA",
                                }).format(consulta.Tipo_Consulta.preco)}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Informações adicionais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <h6 className="font-semibold text-gray-700 mb-2">Informações do Pagamento</h6>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Status:</span>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    consulta.status_pagamento === "PAGO"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-red-50 text-red-700 border-red-200"
                                  }
                                >
                                  {consulta.status_pagamento}
                                </Badge>
                              </div>
                              {consulta.isento && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Isenção:</span>
                                  <Badge className="bg-gray-100 text-gray-800">
                                    ISENTO
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {consulta.Agendamento && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <h6 className="font-semibold text-gray-700 mb-2">Dados do Agendamento</h6>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Criado em:</span>
                                  <span className="text-sm font-medium">
                                    {format(new Date(consulta.criado_aos), "dd/MM/yyyy HH:mm")}
                                  </span>
                                </div>
                                {consulta.Agendamento.id_unidade_de_saude && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Unidade:</span>
                                    <span className="text-sm font-medium">
                                      {consulta.Agendamento.id_unidade_de_saude}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // Componente de Cabeçalho do Paciente
  const PacienteHeader = ({ paciente }: { paciente: PacienteAgendamento }) => {
    const hasExames = paciente.exames.length > 0;
    const hasConsultas = paciente.consultas.length > 0;
    const totalItens = paciente.exames.reduce((total, exame) => 
      total + (exame?.Exame?.length || 0), 0) + paciente.consultas.length;

    return (
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {paciente.paciente_nome
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {paciente.paciente_nome}
                </h2>
                
                <div className="flex flex-wrap gap-2">
                  {hasExames && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-300">
                      <Stethoscope className="w-3 h-3 mr-1" />
                      {paciente.exames.reduce((total, exame) => total + (exame?.Exame?.length || 0), 0)} Exame(s)
                    </Badge>
                  )}
                  {hasConsultas && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-300">
                      <FileText className="w-3 h-3 mr-1" />
                      {paciente.consultas.length} Consulta(s)
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-gray-300">
                    {totalItens} Itens
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {paciente.paciente_numero_identificacao && (
                  <div className="flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">BI:</span> {paciente.paciente_numero_identificacao}
                    </span>
                  </div>
                )}
                
                {paciente.paciente_sexo && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">Sexo:</span> {paciente.paciente_sexo}
                    </span>
                  </div>
                )}
                {paciente.paciente_contacto && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">Contacto:</span> 
                      {paciente.paciente_contacto}
                    </span>
                  </div>
                )}
                
                {paciente.paciente_data_nascimento && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">Nascimento:</span>{" "}
                      {format(new Date(paciente.paciente_data_nascimento), "dd/MM/yyyy")}
                    </span>
                  </div>
                )}
                
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Status Geral</p>
              <Badge 
                className={`text-sm font-bold ${
                  paciente.status === "PENDENTE"
                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                    : paciente.status === "APROVADO"
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                }`}
              >
                {paciente.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Principal do Card do Paciente
  const PacienteCard = ({ paciente }: { paciente: PacienteAgendamento }) => {
    return (
      <div className="space-y-4">
        <Card className="w-full px-5 overflow-hidden border border-gray-300 shadow-lg">
          {/* Cabeçalho do Paciente */}
          <PacienteHeader paciente={paciente} />
          
          <CardContent className="p-0">
            {/* Bloco de Exames */}
            <ExamesBlock 
              exames={paciente.exames} 
              pacienteId={paciente.id_paciente} 
            />
            
            {/* Bloco de Consultas */}
            <ConsultasBlock 
              consultas={paciente.consultas} 
              pacienteId={paciente.id_paciente} 
            />

             <div className="flex gap-2 mb-3">
              <Button
                onClick={() => handleAccept(paciente.id_paciente)}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
                disabled={acceptMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {acceptMutation.isPending ? "Processando..." : "Aceitar Tudo"}
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => openRejectDialog(paciente.id_paciente)}
                className="px-6"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Recusar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renderização condicional de erro
  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar agendamentos pendentes.
            <Button variant="link" className="p-0 h-auto ml-2" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Renderização principal
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos Pendentes</h1>
          <p className="text-gray-600 mt-1">Gerencie exames e consultas agrupados por paciente</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="text-sm py-2 px-4">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
          </Badge>

          <Button variant="outline" onClick={() => setShowStats(!showStats)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            {showStats ? "Ocultar" : "Mostrar"} Estatísticas
          </Button>

          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalPacientes}
            </div>
            <p className="text-xs text-muted-foreground">com agendamentos pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? <Skeleton className="h-8 w-16" /> : todaySchedules.length}
            </div>
            <p className="text-xs text-muted-foreground">pacientes com agendamentos hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Itens Pendentes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalExames + totalConsultas}
            </div>
            <div className="text-xs text-muted-foreground flex gap-2">
              <span>{totalExames} exames</span>
              <span>•</span>
              <span>{totalConsultas} consultas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Potencial</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                new Intl.NumberFormat("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                  notation: "compact",
                  maximumFractionDigits: 0,
                }).format(totalRevenue)
              )}
            </div>
            <p className="text-xs text-muted-foreground">valor total pendente</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics (conditionally shown) */}
      {showStats && <ScheduleStats schedules={pacientesAgendamentos as any} isLoading={isLoading} />}

      {/* Bulk Actions */}
      {!isLoading && filteredPacientes.length > 0 && (
        <BulkActions 
          schedules={filteredPacientes as any} 
          selectedSchedules={selectedSchedules} 
          onSelectionChange={setSelectedSchedules} 
        />
      )}

      {/* Filters */}
      <ScheduleFilters 
        onSearch={handleSearch} 
        onFilterChange={handleFilterChange} 
        totalSchedules={totalPacientes} 
        filteredCount={filteredPacientes.length} 
      />

      {/* View Toggle and Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          <div className="text-sm text-gray-600">
            {filteredPacientes.length} pacientes • {totalExames + totalConsultas} itens pendentes
          </div>
        </div>

        <Separator className="my-6" />

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : filteredPacientes.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-gray-600 mb-4">
                {totalPacientes === 0 
                  ? "Não há agendamentos pendentes no momento." 
                  : "Tente ajustar os filtros para encontrar agendamentos."}
              </p>
              {filters.searchQuery && (
                <Button variant="outline" onClick={() => handleSearch("")}>
                  Limpar busca
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            <TabsContent value="grid" className="space-y-8">
              {(filteredPacientes as unknown as PacienteAgendamento[]).map((paciente: PacienteAgendamento) => (
                <PacienteCard key={paciente.id_paciente} paciente={paciente} />
              ))}
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Itens
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(filteredPacientes as unknown as PacienteAgendamento[]).map((paciente: PacienteAgendamento) => {
                      const totalExamesPaciente = paciente.exames.reduce((total, exame) => 
                        total + (exame?.Exame?.length || 0), 0);
                      const totalConsultasPaciente = paciente.consultas.length;
                      const totalItens = totalExamesPaciente + totalConsultasPaciente;

                      const precoTotal = paciente.exames.reduce((total, exame) => {
                        const examesArray = exame?.Exame || [];
                        return total + examesArray.reduce((subTotal: number, item: any) => 
                          subTotal + (item?.Tipo_Exame?.preco || 0), 0);
                      }, 0) + paciente.consultas.reduce((total, consulta: any) => 
                        total + (consulta?.Tipo_Consulta?.preco || 0), 0);

                      return (
                        <tr key={paciente.id_paciente} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm mr-3">
                                {paciente.paciente_nome
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {paciente.paciente_nome}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {paciente.paciente_contacto || "Sem contacto"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {totalExamesPaciente > 0 && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                  {totalExamesPaciente} exame{totalExamesPaciente > 1 ? "s" : ""}
                                </Badge>
                              )}
                              {totalConsultasPaciente > 0 && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                  {totalConsultasPaciente} consulta{totalConsultasPaciente > 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {totalItens} {totalItens === 1 ? "item" : "itens"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 hidden lg:table-cell">
                            {new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA",
                            }).format(precoTotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {paciente.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAccept(paciente.id_paciente)}
                                disabled={acceptMutation.isPending}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white px-4"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openRejectDialog(paciente.id_paciente)}
                                disabled={rejectMutation.isPending}
                                className="px-4"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Recusar Agendamentos</DialogTitle>
            <DialogDescription>
              Por favor, forneça um motivo para recusar todos os agendamentos deste paciente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Motivo da recusa</Label>
              <Textarea
                id="reject-reason"
                placeholder="Digite o motivo da recusa..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
                setSelectedScheduleId(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Recusando..." : "Confirmar Recusa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}