"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { ModalNewPatient } from "./components/ModalNewPatient";
import { _axios } from "@/Api/axios.config";
import { ___showErrorToastNotification, ___showSuccessToastNotification } from "@/lib/sonner";
import { schemaSchedule } from "./utils/schemaZodNewPatient";
import { PatientDetails } from "./components/PatientDetails";
import { ScheduleDetails, ScheduleItem } from "./components/ScheduleDetails";
import { Button } from "@/components/ui/button";
import { resetInputs } from "./utils/reset-inputs-func";
import { getAllDataInCookies } from "@/utils/get-data-in-cookies";
import { IItemTipoProps, IPaciente } from "@/module/types";
import { patientRoutes } from "@/Api/Routes/patients";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SchemaScheduleType = z.infer<typeof schemaSchedule>;

// Enum para tipos de itens
enum TipoItem {
  EXAME = "EXAME",
  CONSULTA = "CONSULTA",
}

// Interface para Clínico Geral
interface IClinicoGeral {
  id: string;
  nome: string;
  especialidade?: string;
  registro_profissional?: string;
  papel?: string;
}

export default function New() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableItems, setAvailableItems] = useState<IItemTipoProps[]>([]);
  const [availablePatients, setAvailablePatients] = useState<PatientType[]>([]);
  const [availableClinicos, setAvailableClinicos] = useState<IClinicoGeral[]>([]);
  const [patientAutoComplete, setPatientAutoComplete] = useState<{ value: string; id: string }[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<PatientType | undefined>();
  const [selectedClinicoGeral, setSelectedClinicoGeral] = useState<IClinicoGeral | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([{ item: null, tipo: TipoItem.EXAME, date: null, time: "" }]);
  const [selectedTipo, setSelectedTipo] = useState<TipoItem>(TipoItem.EXAME);
  const [resetPatient, setResetPatient] = useState(false);
  const [showReembolsoInfo, setShowReembolsoInfo] = useState(false);
  const unit_health = getAllDataInCookies().userdata.health_unit_ref || 1;
  const [hasFetchedData, setHasFetchedData] = useState(false);

  // Query para buscar clínicos gerais
  const { data: clinicoGeralData, isLoading: isLoadingClinicos } = useQuery({
    queryKey: ["clinico-geral"],
    queryFn: async () => {
      try {
        const response = await _axios.get("/general-practitioners");
        console.log("Resposta da API de clínicos:", response.data);
        return response.data;
      } catch (error) {
        console.error("Erro ao buscar clínicos:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Efeito para atualizar a lista de clínicos quando os dados são carregados
  useEffect(() => {
    if (clinicoGeralData && Array.isArray(clinicoGeralData)) {
      console.log("Dados dos clínicos recebidos:", clinicoGeralData);
      
      // Converter os dados da API para o formato IClinicoGeral
      const clinicosFormatados: IClinicoGeral[] = clinicoGeralData.map((clinico: any) => ({
        id: clinico.id?.toString() || clinico._id?.toString(),
        nome: clinico.nome || clinico.name || "Nome não disponível",
        especialidade: clinico.especialidade || "Clínico Geral",
        registro_profissional: clinico.registro_profissional || "Registro a definir",
        papel: clinico.papel || "CLINICO",
      }));

      console.log("Clínicos formatados:", clinicosFormatados);
      
      if (clinicosFormatados.length > 0) {
        setAvailableClinicos(clinicosFormatados);
        
        // Se há consultas e nenhum clínico selecionado, selecionar o primeiro
        const hasConsultas = schedules.some(schedule => schedule.tipo === TipoItem.CONSULTA);
        if (hasConsultas && !selectedClinicoGeral) {
          setSelectedClinicoGeral(clinicosFormatados[0]);
          ___showSuccessToastNotification({ 
            message: `Clínico ${clinicosFormatados[0].nome} automaticamente selecionado para as consultas.` 
          });
        }
      } else {
        console.warn("Nenhum clínico encontrado na resposta da API");
        setAvailableClinicos([]);
      }
    } else {
      console.warn("Dados dos clínicos inválidos ou não é um array:", clinicoGeralData);
    }
  }, [clinicoGeralData]);

  // Efeito para selecionar automaticamente o clínico quando há consultas
  useEffect(() => {
    const hasConsultas = schedules.some((schedule) => schedule.tipo === TipoItem.CONSULTA);
    
    if (hasConsultas && availableClinicos.length > 0) {
      // Se há consultas e ainda não tem clínico selecionado
      if (!selectedClinicoGeral) {
        setSelectedClinicoGeral(availableClinicos[0]);
        ___showSuccessToastNotification({ 
          message: `Clínico ${availableClinicos[0].nome} automaticamente selecionado para as consultas.` 
        });
      }
    } else if (!hasConsultas) {
      // Limpar seleção se não houver consultas
      setSelectedClinicoGeral(null);
    }
  }, [schedules, availableClinicos]);

  useEffect(() => {
    if (selectedPatientId) {
      setSelectedPatient(availablePatients.find((p) => p.id === selectedPatientId));
    }
  }, [selectedPatientId, availablePatients]);

  // Função para converter IPaciente para PatientType
  const convertToPatientType = (paciente: IPaciente): PatientType => {
    return {
      id: paciente.id.toString(),
      nome_completo: paciente.nome_completo,
      data_nascimento: paciente.data_nascimento,
      sexo: {
        id: paciente.sexo.id,
        nome: paciente.sexo.nome,
      },
      contacto_telefonico: paciente.contacto_telefonico,
      numero_identificacao: paciente.numero_identificacao,
      email: paciente.email,
      id_usuario: paciente.id,
      criado_aos: paciente.criado_aos,
      id_sexo: Number(paciente.sexo.id),
    };
  };

  const fetchAllData = async () => {
    if (hasFetchedData) return;

    try {
      setIsLoading(true);

      // Buscar pacientes
      const patientsResponse = await patientRoutes.getAllPacients();

      // Converter pacientes para PatientType
      const patientTypes: PatientType[] = patientsResponse.map((p: IPaciente) => convertToPatientType(p));

      setAvailablePatients(patientTypes);
      setPatientAutoComplete(patientTypes.map((p: PatientType) => ({ value: p.nome_completo, id: p.id })));

      // Buscar exames
      const examsResponse = await _axios.get("/exam-types");
      const examsRaw = examsResponse.data.data || [];

      const examsData = examsRaw.map((exam: any) => ({
        id: exam.id?.toString() || exam._id?.toString(),
        nome: exam.nome || exam.name,
        preco: exam.preco || exam.price || exam.valor || 0,
        tipo: TipoItem.EXAME,
        descricao: exam.descricao || exam.description || "",
      }));

      // Buscar consultas
      const consultationsResponse = await _axios.get("/consultation-types");
      const consultationsRaw = consultationsResponse.data.data || [];

      const consultationsData = consultationsRaw.map((cons: any) => ({
        id: cons.id?.toString() || cons._id?.toString(),
        nome: cons.nome || cons.name,
        preco: cons.preco || cons.price || cons.valor || 0,
        tipo: TipoItem.CONSULTA,
        descricao: cons.descricao || cons.description || "",
      }));

      // Combinar exames e consultas
      const allItems = [...examsData, ...consultationsData];

      setAvailableItems(allItems);
      setHasFetchedData(true);

      ___showSuccessToastNotification({ message: "Dados carregados com sucesso!" });
    } catch (error: any) {
      console.error("Erro ao buscar dados:", error);
      const msg = error?.response?.data?.message || "Erro ao buscar dados. Contate o suporte.";
      ___showErrorToastNotification({ message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllData();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Agora esta função aceita PatientType
  const handleSavePatient = (patient: PatientType) => {
    setPatientAutoComplete((prev) => [...prev, { value: patient.nome_completo, id: patient.id }]);
    setAvailablePatients((prev) => [...prev, patient]);
    setSelectedPatient(patient);
  };

  const getPatientAge = (birthDate: string) => {
    if (!birthDate) return "";
    const birth = new Date(birthDate);
    const today = new Date();
    const diff = today.getTime() - birth.getTime();
    const ageYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    if (ageYears > 0) return `${ageYears} ano${ageYears > 1 ? "s" : ""}`;
    const ageMonths = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    if (ageMonths > 0) return `${ageMonths} mês${ageMonths > 1 ? "es" : ""}`;
    const ageDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${ageDays} dia${ageDays > 1 ? "s" : ""}`;
  };

  // Determinar se deve mostrar campo de alocação de clínico geral
  const shouldShowClinicoGeralField = () => {
    return schedules.some((schedule) => schedule.tipo === TipoItem.CONSULTA);
  };

  // Calcular valor total dos itens
  const calculateTotalValue = () => {
    return schedules.reduce((sum, schedule) => {
      return sum + (schedule.item?.preco || 0);
    }, 0);
  };

  /** Validação atualizada */
  const validateSchedule = () => {
    const errors: string[] = [];
    const today = new Date();

    if (!selectedPatient) {
      errors.push("Nenhum paciente selecionado.");
    }

    // Verificar se há consultas
    const hasConsultas = schedules.some((schedule) => schedule.tipo === TipoItem.CONSULTA);
    
    // SE HÁ CONSULTAS, O CLÍNICO DEVE ESTAR SELECIONADO
    if (hasConsultas && !selectedClinicoGeral) {
      errors.push("Selecione um clínico geral para as consultas.");
    }

    schedules.forEach((schedule, index) => {
      if (!schedule.item) errors.push(`Agendamento ${index + 1}: ${schedule.tipo === TipoItem.EXAME ? "Exame" : "Consulta"} não selecionado.`);
      if (!schedule.date) errors.push(`Agendamento ${index + 1}: Data não preenchida.`);
      if (!schedule.time) errors.push(`Agendamento ${index + 1}: Hora não preenchida.`);

      if (schedule.date && schedule.time) {
        const scheduleDateTime = new Date(`${schedule.date}T${schedule.time}`);
        if (scheduleDateTime < today) errors.push(`Agendamento ${index + 1}: Data e hora devem ser futuras.`);
      }
    });

    if (errors.length > 0) {
      ___showErrorToastNotification({ messages: errors });
      return { isValid: false };
    }

    return { isValid: true };
  };

    const {data: process} = useQuery({
        queryKey: ["process"],
        queryFn: async () => {
          const response = await _axios.get("/schedulings")
          return response.data;
        }
      })
      console.log("Processos: ", process);

  const handleSubmit = async () => {
    if (isSaving) return;

    const validation = validateSchedule();
    if (!validation.isValid) return;

    setIsSaving(true);
    try {
      // Separar exames e consultas
      const consultas = schedules.filter(schedule => schedule.tipo === TipoItem.CONSULTA);
      const exames = schedules.filter(schedule => schedule.tipo === TipoItem.EXAME);

      // Preparar payload baseado no tipo de agendamento
      let payload: any;
      
      if (consultas.length > 0) {
        // Se tem consultas, usar o formato do endpoint fornecido
        // O CLÍNICO GERAL É OBRIGATÓRIO PARA CONSULTAS
        if (!selectedClinicoGeral) {
          ___showErrorToastNotification({ message: "Clínico geral é obrigatório para consultas." });
          setIsSaving(false);
          return;
        }
        payload = {
          id_paciente: Number(selectedPatient!.id),
          id_unidade_de_saude: unit_health.toString(),
          id_clinico_geral: selectedClinicoGeral.id, // ENVIAR COMO STRING
          consultas_paciente: consultas.map((schedule) => ({
            id_tipo_consulta: Number(schedule.item?.id),
            data_agendamento: schedule.date instanceof Date 
              ? schedule.date.toISOString().split("T")[0] 
              : schedule.date 
              ? new Date(schedule.date).toISOString().split("T")[0] 
              : new Date().toISOString().split("T")[0],
            hora_agendamento: schedule.time,
            status_pagamento: schedule.item && schedule.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
          })),
        };

        // Se também tem exames, podemos mostrar um aviso
        if (exames.length > 0) {
          ___showErrorToastNotification({ 
            message: "Não é possível agendar exames e consultas no mesmo processo. Por favor, crie processos separados." 
          });
          setIsSaving(false);
          return;
        }
      } else if (exames.length > 0) {
        // Se tem apenas exames, NÃO ENVIAR id_clinico_geral
        payload = {
          id_paciente: Number(selectedPatient!.id),
          id_unidade_de_saude: unit_health.toString(),
          // NÃO INCLUIR id_clinico_geral para exames
          exames_paciente: exames.map((schedule) => ({
            id_tipo_exame: Number(schedule.item?.id),
            data_agendamento: schedule.date instanceof Date 
              ? schedule.date.toISOString().split("T")[0] 
              : schedule.date 
              ? new Date(schedule.date).toISOString().split("T")[0] 
              : new Date().toISOString().split("T")[0],
            hora_agendamento: schedule.time,
            status_pagamento: schedule.item && schedule.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
          })),
        };
      } else {
        ___showErrorToastNotification({ message: "Nenhum item selecionado para agendamento." });
        setIsSaving(false);
        return;
      }

      console.log("Enviando payload para agendamento:", JSON.stringify(payload, null, 2));

    

      const response = await _axios.post("/schedulings/set-schedule", payload);

      if (response.status === 201) {
        ___showSuccessToastNotification({ message: "Processo de agendamento criado com sucesso!" });
        // Resetar todos os campos
        setSchedules([{ item: null, tipo: TipoItem.EXAME, date: null, time: "" }]);
        setSelectedPatient(undefined);
        setSelectedPatientId("");
        setSelectedClinicoGeral(null); // Limpar seleção
        setSelectedTipo(TipoItem.EXAME);
        resetInputs();
        setResetPatient(true);
      }
    } catch (error: any) {
      console.error("Erro ao criar processo:", error);
      console.error("Detalhes do erro:", error.response?.data);
      
      // Verificar se há mais detalhes no erro
      if (error?.response?.data) {
        console.error("Resposta completa do servidor:", error.response.data);
        
        if (error.response.data.errors) {
          const backendErrors = error.response.data.errors.map((e: any, i: number) => `Agendamento ${i + 1}: ${e.message}`);
          ___showErrorToastNotification({ messages: backendErrors });
        } else if (error.response.data.message) {
          ___showErrorToastNotification({ message: error.response.data.message });
        } else {
          ___showErrorToastNotification({ message: "Erro interno do servidor. Verifique os logs para mais detalhes." });
        }
      } else {
        const msg = error?.message || "Erro ao criar processo de agendamento. Contate o suporte.";
        ___showErrorToastNotification({ message: msg });
      }
      setResetPatient(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrar itens por tipo selecionado
  const filteredItems = availableItems.filter((item) => item.tipo === selectedTipo);

  return (
    <div className="min-h-screen px-6 py-2 pb-5 overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between pr-3 mb-4">
        <ModalNewPatient onPatientSaved={handleSavePatient} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex flex-col gap-6 w-full"
      >
        <div className="flex flex-col gap-6 w-full">
          {/* Seção Paciente */}
          <div className="p-4 bg-gray-100 rounded-lg border w-full">
            <PatientDetails 
              isLoading={isLoading} 
              selectedPatient={selectedPatient ?? undefined} 
              autoCompleteData={patientAutoComplete} 
              onPatientSelect={(patientId) => setSelectedPatientId(patientId)} 
              resetPatient={resetPatient} 
              getPatientAge={getPatientAge} 
            />
          </div>

          {/* Seletor de Tipo (Exame/Consulta) */}
          <div className="p-4 bg-gray-100 rounded-lg border">
            <div className="flex flex-col gap-3">
              <label className="font-bold text-lg">Tipo de Agendamento</label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={selectedTipo === TipoItem.EXAME ? "default" : "outline"}
                  onClick={() => {
                    setSelectedTipo(TipoItem.EXAME);
                    setSchedules([{ item: null, tipo: TipoItem.EXAME, date: null, time: "" }]);
                    setSelectedClinicoGeral(null); // Limpar seleção de clínico
                  }}
                  className="flex-1"
                >
                  Exames Laboratoriais
                </Button>
                <Button
                  type="button"
                  variant={selectedTipo === TipoItem.CONSULTA ? "default" : "outline"}
                  onClick={() => {
                    setSelectedTipo(TipoItem.CONSULTA);
                    setSchedules([{ item: null, tipo: TipoItem.CONSULTA, date: null, time: "" }]);
                    // O clínico será selecionado automaticamente no useEffect
                  }}
                  className="flex-1"
                >
                  Consultas Clínicas
                </Button>
              </div>
            </div>
          </div>

          {/* Campo de Alocação de Clínico Geral (aparece apenas se houver consultas) */}
          {shouldShowClinicoGeralField() && (
            <div className="p-4 bg-gray-100 rounded-lg border">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-lg">Alocação de Clínico Geral</label>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Obrigatório para consultas
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Selecione o clínico geral responsável pelas consultas deste processo
                </p>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Clínico Geral Responsável *</label>
                    
                    {isLoadingClinicos ? (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-gray-500">Carregando clínicos disponíveis...</p>
                      </div>
                    ) : availableClinicos.length > 0 ? (
                      <div className="relative">
                        <Select
                          value={selectedClinicoGeral?.id || ""}
                          onValueChange={(value) => {
                            console.log("Clínico selecionado - ID:", value);
                            const clinico = availableClinicos.find(c => c.id === value);
                            console.log("Clínico encontrado:", clinico);
                            setSelectedClinicoGeral(clinico || null);
                          }}
                          required
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um clínico geral" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableClinicos.map((clinico) => (
                              <SelectItem key={clinico.id} value={clinico.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{clinico.nome}</span>
                                  {clinico.especialidade && (
                                    <span className="text-xs text-gray-500">{clinico.especialidade}</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {selectedClinicoGeral && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{selectedClinicoGeral.nome}</p>
                                <p className="text-sm text-gray-600">
                                  {selectedClinicoGeral.especialidade || "Clínico Geral"}
                                  {selectedClinicoGeral.registro_profissional && 
                                    ` • ${selectedClinicoGeral.registro_profissional}`}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">ID: {selectedClinicoGeral.id}</p>
                              </div>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Selecionado
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-700 text-sm">
                          ⚠️ Nenhum clínico geral cadastrado no sistema. 
                          Entre em contato com o administrador para cadastrar um clínico geral.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p>Nota: O clínico selecionado será responsável por todas as consultas deste processo.</p>
                    <p className="text-red-500 mt-1">* Campo obrigatório quando há consultas</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informações do Estado de Reembolso (informacional) */}
          <div className="p-4 bg-gray-100 rounded-lg border">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowReembolsoInfo(!showReembolsoInfo)}>
                <label className="font-bold text-lg">Estado de Reembolso</label>
                <Badge variant="outline" className="bg-gray-50">
                  {showReembolsoInfo ? "Ocultar detalhes" : "Mostrar detalhes"}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  SEM REEMBOLSO
                </Badge>
                <span className="text-sm text-gray-600">(Estado inicial do processo)</span>
              </div>

              {showReembolsoInfo && (
                <Card className="mt-2">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Sobre o Estado de Reembolso:</h4>
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>
                        <strong>SEM REEMBOLSO:</strong> Nenhuma ação de reembolso é necessária (estado inicial)
                      </li>
                      <li>
                        <strong>POR REEMBOLSAR:</strong> Há devolução pendente e ação financeira necessária
                      </li>
                      <li>
                        <strong>REEMBOLSADO:</strong> Processo de reembolso concluído
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">Nota: O reembolso é sempre por bloco inteiro, nunca parcial.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Agendamentos */}
          <div className="p-4 bg-gray-100 rounded-lg border flex flex-col">
            {isLoading ? (
              <div className="p-4 text-center">
                <p>Carregando exames e consultas...</p>
                <p className="text-sm text-gray-500 mt-1">
                  {availableItems.length > 0 ? `${availableItems.length} itens carregados` : "Aguardando dados..."}
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-4 text-center border border-yellow-200 bg-yellow-50 rounded-md">
                <p className="font-medium text-yellow-800">
                  Nenhum {selectedTipo === TipoItem.EXAME ? "exame" : "consulta"} disponível
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  Por favor, contacte o administrador para adicionar {selectedTipo === TipoItem.EXAME ? "exames" : "consultas"} ao sistema.
                </p>
              </div>
            ) : (
              <ScheduleDetails 
                isLoading={isLoading} 
                items={filteredItems} 
                schedules={schedules} 
                onChange={setSchedules} 
                selectedTipo={selectedTipo} 
              />
            )}
          </div>

          {/* Resumo do Processo */}
          <div className="p-4 bg-blue-50 rounded-lg border">
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-lg">Resumo do Processo</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-sm text-gray-600">Valor Total</span>
                      <span className="text-2xl font-bold text-green-700">
                        {new Intl.NumberFormat("pt-AO", {
                          style: "currency",
                          currency: "AOA",
                        }).format(calculateTotalValue())}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-sm text-gray-600">Estado Financeiro Inicial</span>
                      <Badge 
                        variant={calculateTotalValue() > 0 ? "outline" : "default"} 
                        className={calculateTotalValue() > 0 ? "bg-yellow-50 text-yellow-800" : "bg-green-100 text-green-800"}
                      >
                        {calculateTotalValue() > 0 ? "NÃO PAGO" : "ISENTO"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-sm text-gray-600">Estado de Reembolso</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        SEM REEMBOLSO
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                <p>
                  <strong>Itens no processo:</strong> {schedules.length} {schedules.length === 1 ? "item" : "itens"}
                </p>
                <p>
                  <strong>{selectedTipo === TipoItem.EXAME ? "Exames" : "Consultas"} disponíveis:</strong> {filteredItems.length}
                </p>
                {shouldShowClinicoGeralField() && selectedClinicoGeral && (
                  <p>
                    <strong>Clínico geral alocado:</strong> {selectedClinicoGeral.nome}
                    <span className="block text-xs text-gray-500">ID: {selectedClinicoGeral.id}</span>
                  </p>
                )}
                {shouldShowClinicoGeralField() && !selectedClinicoGeral && (
                  <p className="text-red-500">
                    <strong>⚠️ Clínico geral:</strong> Não selecionado (obrigatório)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isSaving || (shouldShowClinicoGeralField() && !selectedClinicoGeral)} 
          className="bg-akin-turquoise hover:bg-akin-turquoise/80"
        >
          {isSaving ? "Criando Processo..." : "Criar Processo de Agendamento"}
        </Button>
      </form>
    </div>
  );
}