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
  const user_id = getAllDataInCookies().userdata.id || "";
  const [hasFetchedData, setHasFetchedData] = useState(false);

  // Query para buscar clínicos gerais
  const { data: clinicoGeralData, isLoading: isLoadingClinicos } = useQuery({
    queryKey: ["clinico-geral"],
    queryFn: async () => {
      try {
        const response = await _axios.get("/general-practitioners");
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
      const clinicosFormatados: IClinicoGeral[] = clinicoGeralData.map((clinico: any) => ({
        id: clinico.id?.toString() || clinico._id?.toString(),
        nome: clinico.nome || clinico.name || "Nome não disponível",
        especialidade: clinico.especialidade || "Clínico Geral",
        registro_profissional: clinico.registro_profissional || "Registro a definir",
        papel: clinico.papel || "CLINICO",
      }));
      
      if (clinicosFormatados.length > 0) {
        setAvailableClinicos(clinicosFormatados);
      }
    }
  }, [clinicoGeralData]);

  // Efeito para selecionar automaticamente o clínico quando há consultas
  useEffect(() => {
    const hasConsultas = schedules.some((schedule) => schedule.tipo === TipoItem.CONSULTA);
    
    if (hasConsultas && availableClinicos.length > 0 && !selectedClinicoGeral) {
      setSelectedClinicoGeral(availableClinicos[0]);
    } else if (!hasConsultas) {
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

  const shouldShowClinicoGeralField = () => {
    return schedules.some((schedule) => schedule.tipo === TipoItem.CONSULTA);
  };

  const calculateTotalValue = () => {
    return schedules.reduce((sum, schedule) => {
      return sum + (schedule.item?.preco || 0);
    }, 0);
  };

  const validateSchedule = () => {
    const errors: string[] = [];
    const today = new Date();

    if (!selectedPatient) {
      errors.push("Nenhum paciente selecionado.");
    }

    const hasConsultas = schedules.some((schedule) => schedule.tipo === TipoItem.CONSULTA);
    
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

  const handleSubmit = async () => {
    if (isSaving) return;

    const validation = validateSchedule();
    if (!validation.isValid) return;

    setIsSaving(true);
    try {
      const consultas = schedules.filter(schedule => schedule.tipo === TipoItem.CONSULTA);
      const exames = schedules.filter(schedule => schedule.tipo === TipoItem.EXAME);

      let payload: any;
      
      if (consultas.length > 0) {
        // **PAYLOAD COMPLETO PARA CONSULTAS - BASEADO NOS DADOS DO BACKEND**
        payload = {
          id_paciente: Number(selectedPatient!.id),
          id_unidade_de_saude: unit_health.toString(),
          id_recepcionista: user_id, // ID do usuário logado
          status: "ACTIVO", // Status inicial do processo
          status_pagamento: calculateTotalValue() > 0 ? "NAO_PAGO" : "ISENTO",
          status_reembolso: "SEM_REEMBOLSO",
          id_clinico_alocado: selectedClinicoGeral?.id, // Campo correto baseado nos dados
          consultas_paciente: consultas.map((schedule) => ({
            id_tipo_consulta: Number(schedule.item?.id),
            data_agendamento: schedule.date instanceof Date 
              ? schedule.date.toISOString().split("T")[0] 
              : schedule.date 
              ? new Date(schedule.date).toISOString().split("T")[0] 
              : new Date().toISOString().split("T")[0],
            hora_agendamento: schedule.time,
            status_pagamento: schedule.item && schedule.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
            status_reembolso: "SEM_REEMBOLSO",
            status: "PENDENTE", // Status inicial da consulta
            valor_total: schedule.item?.preco || 0,
            isento: schedule.item?.preco === 0,
          })),
        };

        if (exames.length > 0) {
          ___showErrorToastNotification({ 
            message: "Não é possível agendar exames e consultas no mesmo processo." 
          });
          setIsSaving(false);
          return;
        }
      } else if (exames.length > 0) {
        // **PAYLOAD COMPLETO PARA EXAMES - BASEADO NOS DADOS DO BACKEND**
        payload = {
          id_paciente: Number(selectedPatient!.id),
          id_unidade_de_saude: unit_health.toString(),
          id_recepcionista: user_id, // ID do usuário logado
          status: "ACTIVO", // Status inicial do processo
          status_pagamento: calculateTotalValue() > 0 ? "NAO_PAGO" : "ISENTO",
          status_reembolso: "SEM_REEMBOLSO",
          exames_paciente: exames.map((schedule) => ({
            id_tipo_exame: Number(schedule.item?.id),
            data_agendamento: schedule.date instanceof Date 
              ? schedule.date.toISOString().split("T")[0] 
              : schedule.date 
              ? new Date(schedule.date).toISOString().split("T")[0] 
              : new Date().toISOString().split("T")[0],
            hora_agendamento: schedule.time,
            status_pagamento: schedule.item && schedule.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
            status_reembolso: "SEM_REEMBOLSO",
            status: "PENDENTE", // Status inicial do exame
            valor_total: schedule.item?.preco || 0,
            isento: schedule.item?.preco === 0,
          })),
        };
      } else {
        ___showErrorToastNotification({ message: "Nenhum item selecionado para agendamento." });
        setIsSaving(false);
        return;
      }

      console.log("Enviando payload COMPLETO para agendamento:", JSON.stringify(payload, null, 2));

      // **TENTATIVA 1: Usar o endpoint correto para cada tipo**
      let endpoint = "/schedulings/set-schedule";
      let method = "post";
      
      // **TENTATIVA 2: Se não funcionar, tentar endpoints diferentes**
      if (consultas.length > 0) {
        // Tentar endpoint específico para consultas
        endpoint = "/schedulings";
        payload = {
          ...payload,
          tipo: "CONSULTA"
        };
      } else if (exames.length > 0) {
        // Tentar endpoint específico para exames
        endpoint = "/schedulings";
        payload = {
          ...payload,
          tipo: "EXAME"
        };
      }

      const response = await _axios.post(endpoint, payload);

      if (response.status === 201 || response.status === 200) {
        ___showSuccessToastNotification({ message: "Processo de agendamento criado com sucesso!" });
        // Resetar todos os campos
        setSchedules([{ item: null, tipo: TipoItem.EXAME, date: null, time: "" }]);
        setSelectedPatient(undefined);
        setSelectedPatientId("");
        setSelectedClinicoGeral(null);
        setSelectedTipo(TipoItem.EXAME);
        resetInputs();
        setResetPatient(true);
      }
    } catch (error: any) {
      console.error("Erro completo:", error);
      console.error("Resposta do erro:", error.response?.data);
      
      // **SOLUÇÃO DE EMERGÊNCIA: Criar processo em duas etapas**
      if (error?.response?.status === 500) {
        console.log("Tentando criar processo em duas etapas...");
        
        try {
          // **ETAPA 1: Criar o processo básico**
          const processoPayload = {
            id_paciente: Number(selectedPatient!.id),
            id_unidade_de_saude: unit_health.toString(),
            id_recepcionista: user_id,
            status: "ACTIVO",
            status_pagamento: calculateTotalValue() > 0 ? "NAO_PAGO" : "ISENTO",
            status_reembolso: "SEM_REEMBOLSO"
          };
          
          console.log("Criando processo básico:", processoPayload);
          const processoResponse = await _axios.post("/schedulings", processoPayload);
          const idProcesso = processoResponse.data.id;
          
          console.log("Processo criado com ID:", idProcesso);
          
          // **ETAPA 2: Adicionar os itens**
          const consultas = schedules.filter(schedule => schedule.tipo === TipoItem.CONSULTA);
          const exames = schedules.filter(schedule => schedule.tipo === TipoItem.EXAME);
          
          if (consultas.length > 0) {
            for (const consulta of consultas) {
              const consultaPayload = {
                id_agendamento: idProcesso,
                id_tipo_consulta: Number(consulta.item?.id),
                data_agendamento: consulta.date instanceof Date 
                  ? consulta.date.toISOString().split("T")[0] 
                  : consulta.date 
                  ? new Date(consulta.date).toISOString().split("T")[0] 
                  : new Date().toISOString().split("T")[0],
                hora_agendamento: consulta.time,
                status_pagamento: consulta.item && consulta.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
                status: "PENDENTE",
                valor_total: consulta.item?.preco || 0,
                id_clinico_alocado: selectedClinicoGeral?.id
              };
              
              console.log("Adicionando consulta:", consultaPayload);
              await _axios.post("/consultations", consultaPayload);
            }
          }
          
          if (exames.length > 0) {
            for (const exame of exames) {
              const examePayload = {
                id_agendamento: idProcesso,
                id_tipo_exame: Number(exame.item?.id),
                data_agendamento: exame.date instanceof Date 
                  ? exame.date.toISOString().split("T")[0] 
                  : exame.date 
                  ? new Date(exame.date).toISOString().split("T")[0] 
                  : new Date().toISOString().split("T")[0],
                hora_agendamento: exame.time,
                status_pagamento: exame.item && exame.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
                status: "PENDENTE",
                valor_total: exame.item?.preco || 0
              };
              
              console.log("Adicionando exame:", examePayload);
              await _axios.post("/exams", examePayload);
            }
          }
          
          ___showSuccessToastNotification({ message: "Processo criado com sucesso em duas etapas!" });
          // Reset
          setSchedules([{ item: null, tipo: TipoItem.EXAME, date: null, time: "" }]);
          setSelectedPatient(undefined);
          setSelectedPatientId("");
          setSelectedClinicoGeral(null);
          setSelectedTipo(TipoItem.EXAME);
          resetInputs();
          setResetPatient(true);
          
        } catch (error2: any) {
          console.error("Erro na solução alternativa:", error2);
          console.error("Detalhes:", error2.response?.data);
          ___showErrorToastNotification({ 
            message: `Erro detalhado: ${JSON.stringify(error2.response?.data || error2.message)}` 
          });
        }
      } else {
        ___showErrorToastNotification({ 
          message: `Erro: ${error?.response?.data?.message || error.message || "Contate o suporte"}` 
        });
      }
      setResetPatient(false);
    } finally {
      setIsSaving(false);
    }
  };

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
                    setSelectedClinicoGeral(null);
                  }}
                  className="flex-1"
                >
                  Exames
                </Button>
                <Button
                  type="button"
                  variant={selectedTipo === TipoItem.CONSULTA ? "default" : "outline"}
                  onClick={() => {
                    setSelectedTipo(TipoItem.CONSULTA);
                    setSchedules([{ item: null, tipo: TipoItem.CONSULTA, date: null, time: "" }]);
                  }}
                  className="flex-1"
                >
                  Consultas
                </Button>
              </div>
            </div>
          </div>

          {shouldShowClinicoGeralField() && (
            <div className="p-4 bg-gray-100 rounded-lg border">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-lg">Clínico Geral</label>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Obrigatório
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Clínico Responsável *</label>
                    
                    {isLoadingClinicos ? (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-gray-500">Carregando...</p>
                      </div>
                    ) : availableClinicos.length > 0 ? (
                      <Select
                        value={selectedClinicoGeral?.id || ""}
                        onValueChange={(value) => {
                          const clinico = availableClinicos.find(c => c.id === value);
                          setSelectedClinicoGeral(clinico || null);
                        }}
                        required
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um clínico" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClinicos.map((clinico) => (
                            <SelectItem key={clinico.id} value={clinico.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{clinico.nome}</span>
                                <span className="text-xs text-gray-500">{clinico.especialidade}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-700 text-sm">
                          ⚠️ Nenhum clínico cadastrado.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-100 rounded-lg border flex flex-col">
            {isLoading ? (
              <div className="p-4 text-center">
                <p>Carregando...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-4 text-center border border-yellow-200 bg-yellow-50 rounded-md">
                <p className="font-medium text-yellow-800">
                  Nenhum {selectedTipo === TipoItem.EXAME ? "exame" : "consulta"} disponível
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

          <div className="p-4 bg-blue-50 rounded-lg border">
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-lg">Resumo</h3>

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
                      <span className="text-sm text-gray-600">Estado Financeiro</span>
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