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
import { Grid3X3, List, RefreshCw, Calendar, Users, Clock, AlertTriangle, CheckCircle, TrendingUp, BarChart3, AlertCircle, XCircle, Stethoscope, UserCheck, FileText } from "lucide-react";
import { consultaRoutes, scheduleRoutes } from "@/Api/Routes/schedule/index.routes";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { ScheduleStats } from "@/components/schedule/ScheduleStats";
import { BulkActions } from "@/components/schedule/BulkActions";
import { useScheduleFilters } from "@/hooks/useScheduleFilters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    // Se for nulo ou indefinido
    if (!data) return [];

    // Se já for array
    if (Array.isArray(data)) return data;

    // Se for objeto, procurar por propriedades array comuns
    if (typeof data === "object") {
      const possibleArrayProps = ["data", "results", "records", "items", "list", "array"];

      for (const prop of possibleArrayProps) {
        if (data[prop] && Array.isArray(data[prop])) {
          return data[prop];
        }
      }

      // Se for um objeto com valores que são arrays
      const values = Object.values(data);
      if (values.length > 0 && Array.isArray(values[0])) {
        return values[0];
      }

      // Se for um objeto iterável (como Map ou Set)
      if (data[Symbol.iterator]) {
        return Array.from(data);
      }
    }

    // Se nada funcionar, retornar array vazio
    return [];
  };

  // Converter para arrays
  const examesArray = toArray(exames);
  const consultasArray = toArray(consultas);

  console.log("Exames para processar (", examesArray.length, "):", examesArray);
  console.log("Consultas para processar (", consultasArray.length, "):", consultasArray);

  // Processar exames
  for (const exame of examesArray) {
    try {
      // Para exames, o paciente está em exame.Paciente
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

        if (exame.status === "PENDENTE") {
          paciente.status = "PENDENTE";
        }
      }
    } catch (error) {
      console.error("Erro ao processar exame:", exame, error);
    }
  }

  // Processar consultas - CORREÇÃO CRÍTICA AQUI!
  for (const consulta of consultasArray) {
    try {
      // Para consultas, o paciente está em consulta.Agendamento.Paciente
      const pacienteInfo = consulta?.Agendamento?.Paciente;
      
      if (pacienteInfo) {
        const pacienteId = pacienteInfo.id;
        const pacienteNome = pacienteInfo.nome_completo || "Paciente";

        if (!pacientesMap.has(pacienteId)) {
          pacientesMap.set(pacienteId, {
            id_paciente: pacienteId,
            paciente_nome: pacienteNome,
            paciente_data_nascimento: "", // Não está na resposta da consulta
            paciente_sexo: pacienteInfo.id_sexo === 1 ? "Masculino" : pacienteInfo.id_sexo === 2 ? "Feminino" : "Não informado",
            paciente_contacto: "", // Não está na resposta da consulta
            paciente_numero_identificacao: "", // Não está na resposta da consulta
            exames: [],
            consultas: [],
            status: consulta.status || "PENDENTE",
            criado_aos: consulta.criado_aos || new Date().toISOString(),
          });
        }

        const paciente = pacientesMap.get(pacienteId)!;
        paciente.consultas.push(consulta);

        if (consulta.status === "PENDENTE") {
          paciente.status = "PENDENTE";
        }
      }
    } catch (error) {
      console.error("Erro ao processar consulta:", consulta, error);
    }
  }

  const resultado = Array.from(pacientesMap.values());
  console.log("Pacientes agrupados com sucesso:", resultado.length);
  return resultado;
};

export default function Request() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Buscar exames pendentes
  const {
    data: schedules = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
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
      console.log("Resposta de consultas:", response);
      
      if (Array.isArray(response)) {
        console.log("Consulta já é array com", response.length, "itens");
        return response;
      }
      
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
            console.log("Encontrado array em valores do objeto com", value.length, "itens");
            return value;
          }
        }
      }
      
      console.warn("Formato inesperado para consultas:", response);
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
    const pacientes = agruparPorPaciente(schedules, consultas);
    return pacientes;
  }, [schedules, consultas]);

  const { filteredSchedules: filteredPacientes, filters, handleSearch, handleFilterChange } = useScheduleFilters(pacientesAgendamentos as any);

  const totalPacientes = pacientesAgendamentos.length;
  const totalExames = schedules.length || 0;
  const totalConsultas = consultas.length || 0;

  const totalRevenue = useMemo(() => {
    let revenue = 0;

    if (Array.isArray(schedules)) {
      schedules.forEach((schedule: any) => {
        if (schedule?.Exame) {
          const examesArray = Array.isArray(schedule.Exame) ? schedule.Exame : [schedule.Exame];
          examesArray.forEach((exame: any) => {
            revenue += exame?.Tipo_Exame?.preco || 0;
          });
        }
      });
    }

    if (Array.isArray(consultas)) {
      consultas.forEach((consulta: any) => {
        revenue += consulta?.Tipo_Consulta?.preco || 0;
      });
    }

    return revenue;
  }, [schedules, consultas]);

  const todaySchedules = useMemo(() => {
    const today = new Date().toDateString();

    return pacientesAgendamentos.filter((paciente) => {
      const hasTodayExame = paciente.exames.some((exame: any) => {
        const exameDate = exame?.Exame?.[0]?.data_agendamento || exame?.data_agendamento;
        if (!exameDate) return false;
        return new Date(exameDate).toDateString() === today;
      });

      const hasTodayConsulta = paciente.consultas.some((consulta: any) => {
        const consultaDate = consulta?.data_agendamento;
        if (!consultaDate) return false;
        return new Date(consultaDate).toDateString() === today;
      });

      return hasTodayExame || hasTodayConsulta;
    });
  }, [pacientesAgendamentos]);

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

  const handleAccept = (pacienteId: number) => {
    const paciente = pacientesAgendamentos.find((p) => p.id_paciente === pacienteId);
    if (paciente) {
      paciente.exames.forEach((exame: any) => {
        acceptMutation.mutate(exame.id);
      });

      paciente.consultas.forEach((consulta: any) => {
      });
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

  const renderPacienteCard = (paciente: PacienteAgendamento) => {
    const hasExames = paciente.exames.length > 0;
    const hasConsultas = paciente.consultas.length > 0;
    const totalItems = paciente.exames.length + paciente.consultas.length;

    const precoTotal =
      paciente.exames.reduce((total, exame: any) => {
        const examePreco = exame?.Exame?.reduce((subTotal: number, item: any) => subTotal + (item?.Tipo_Exame?.preco || 0), 0) || 0;
        return total + examePreco;
      }, 0) + paciente.consultas.reduce((total, consulta: any) => total + (consulta?.Tipo_Consulta?.preco || 0), 0);

    return (
      <Card key={paciente.id_paciente} className="w-full transition-shadow duration-200 hover:shadow-lg border-l-4 border-l-blue-500">
        <CardHeader className="p-4">
          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {paciente.paciente_nome
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {hasExames && hasConsultas && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <Stethoscope className="w-3 h-3 mr-1" />
                      <FileText className="w-3 h-3 mr-1" />
                      Exames + Consultas
                    </Badge>
                  )}
                  {hasExames && !hasConsultas && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Stethoscope className="w-3 h-3 mr-1" />
                      Exames
                    </Badge>
                  )}
                  {!hasExames && hasConsultas && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <FileText className="w-3 h-3 mr-1" />
                      Consultas
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {totalItems} {totalItems === 1 ? "item" : "itens"}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{paciente.paciente_nome}</h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 truncate">
                  {paciente.paciente_numero_identificacao && (
                    <>
                      <span className="inline-flex items-center gap-1">ID: {paciente.paciente_numero_identificacao}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{paciente.paciente_sexo}</span>
                  {paciente.paciente_contacto && (
                    <>
                      <span>•</span>
                      <span>{paciente.paciente_contacto}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold border bg-yellow-100 text-yellow-800 border-yellow-200">
                <AlertCircle className="w-3 h-3" />
                <span className="whitespace-nowrap">{paciente.status}</span>
              </span>
              <span className="text-xs text-gray-500">Paciente #{paciente.id_paciente}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          {/* Resumo dos Itens */}
          <div className="space-y-3">
            {/* Exames */}
            {hasExames && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center text-sm font-semibold text-gray-700">
                    <div className="p-1.5 mr-2 rounded-md bg-blue-100">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    </div>
                    <p>Exames ({paciente.exames.length})</p>
                  </Label>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {paciente.exames.map((exame: any, index: number) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-100 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {exame?.Exame?.[0]?.Tipo_Exame?.nome || "Exame"}
                          </p>
                          {exame?.Exame?.[0]?.data_agendamento && (
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(exame.Exame[0].data_agendamento), "dd/MM/yyyy")}
                              {exame.Exame[0].hora_agendamento && ` • ${exame.Exame[0].hora_agendamento}`}
                            </p>
                          )}
                        </div>
                        {exame?.Exame?.[0]?.Tipo_Exame?.preco && (
                          <span className="text-sm font-semibold text-blue-700">
                            {new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA",
                            }).format(exame.Exame[0].Tipo_Exame.preco)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consultas - AGORA VAI APARECER! */}
            {hasConsultas && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center text-sm font-semibold text-gray-700">
                    <div className="p-1.5 mr-2 rounded-md bg-green-100">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <p>Consultas ({paciente.consultas.length})</p>
                  </Label>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {paciente.consultas.map((consulta: any, index: number) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-100 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {consulta?.Tipo_Consulta?.nome || "Consulta"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {consulta?.data_agendamento && (
                              <>
                                {format(new Date(consulta.data_agendamento), "dd/MM/yyyy")}
                                {consulta.hora_agendamento && ` • ${consulta.hora_agendamento}`}
                              </>
                            )}
                          </p>
                        </div>
                        {consulta?.Tipo_Consulta?.preco && (
                          <span className="text-sm font-semibold text-green-700">
                            {new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA",
                            }).format(consulta.Tipo_Consulta.preco)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Valor Total */}
          {precoTotal > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <span className="flex items-center gap-2 text-sm font-semibold text-green-800">
                <div className="p-1.5 bg-green-500 rounded text-white">
                  <TrendingUp className="w-4 h-4" />
                </div>
                Valor Total
              </span>
              <span className="text-xl font-bold text-green-700">
                {new Intl.NumberFormat("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                }).format(precoTotal)}
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 flex flex-col sm:flex-row gap-2 bg-gray-50 border-t">
          <Button onClick={() => handleAccept(paciente.id_paciente)} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2" disabled={acceptMutation.isPending}>
            <CheckCircle className="w-4 h-4" />
            {acceptMutation.isPending ? "Processando..." : "Aceitar Tudo"}
          </Button>

          <Button variant="destructive" onClick={() => openRejectDialog(paciente.id_paciente)} className="w-full flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Recusar
          </Button>
        </CardFooter>
      </Card>
    );
  };

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

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos Pendentes</h1>
          <p className="text-gray-600 mt-1">Gerencie exames e consultas agrupados por paciente</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
          </Badge>

          <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            {showStats ? "Ocultar" : "Mostrar"} Estatísticas
          </Button>

          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
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
            <div className="text-2xl font-bold text-orange-600">{isLoading ? <Skeleton className="h-8 w-16" /> : totalPacientes}</div>
            <p className="text-xs text-muted-foreground">com agendamentos pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{isLoading ? <Skeleton className="h-8 w-16" /> : todaySchedules.length}</div>
            <p className="text-xs text-muted-foreground">pacientes com agendamentos hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Itens Pendentes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? <Skeleton className="h-8 w-16" /> : totalExames + totalConsultas}</div>
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

        <Separator className="my-4" />

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredPacientes.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-gray-600 mb-4">
                {totalPacientes === 0 ? "Não há agendamentos pendentes no momento." : "Tente ajustar os filtros para encontrar agendamentos."}
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
            <TabsContent value="grid" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {(filteredPacientes as unknown as PacienteAgendamento[])?.map((paciente: PacienteAgendamento) => 
                  renderPacienteCard(paciente)
                )}
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Valor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(filteredPacientes as unknown as PacienteAgendamento[]).map((paciente: PacienteAgendamento) => {
                      const hasExames = paciente.exames.length > 0;
                      const hasConsultas = paciente.consultas.length > 0;
                      const totalItems = paciente.exames.length + paciente.consultas.length;

                      // Calcular preço total
                      const precoTotal =
                        paciente.exames.reduce((total, exame: any) => {
                          const examePreco = exame?.Exame?.reduce((subTotal: number, item: any) => subTotal + (item?.Tipo_Exame?.preco || 0), 0) || 0;
                          return total + examePreco;
                        }, 0) + paciente.consultas.reduce((total, consulta: any) => total + (consulta?.Tipo_Consulta?.preco || 0), 0);

                      return (
                        <tr key={paciente.id_paciente} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm mr-3">
                                {paciente.paciente_nome
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{paciente.paciente_nome}</div>
                                <div className="text-xs text-gray-500">{paciente.paciente_contacto || "Sem contacto"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {hasExames && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                  {paciente.exames.length} exame{paciente.exames.length > 1 ? "s" : ""}
                                </Badge>
                              )}
                              {hasConsultas && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                  {paciente.consultas.length} consulta{paciente.consultas.length > 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {totalItems} {totalItems === 1 ? "item" : "itens"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600 hidden lg:table-cell">
                            {new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA",
                            }).format(precoTotal)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {paciente.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleAccept(paciente.id_paciente)} 
                                disabled={acceptMutation.isPending} 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white px-3"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>

                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => openRejectDialog(paciente.id_paciente)} 
                                disabled={rejectMutation.isPending} 
                                className="px-3"
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
            <DialogDescription>Por favor, forneça um motivo para recusar todos os agendamentos deste paciente.</DialogDescription>
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