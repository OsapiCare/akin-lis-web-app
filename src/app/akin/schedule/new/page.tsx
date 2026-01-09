"use client";

import { useEffect, useState } from "react";
import { ModalNewPatient } from "./components/ModalNewPatient";
import { _axios } from "@/Api/axios.config";
import { ___showErrorToastNotification, ___showSuccessToastNotification } from "@/lib/sonner";
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
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Efeito para atualizar a lista de clínicos quando os dados são carregados
  useEffect(() => {
    if (clinicoGeralData && Array.isArray(clinicoGeralData)) {
      const clinicosFormatados: IClinicoGeral[] = clinicoGeralData.map((clinico: any) => ({
        id: clinico.id?.toString() || clinico._id?.toString() || Math.random().toString(),
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
      const examsRaw = examsResponse.data?.data || examsResponse.data || [];

      const examsData = examsRaw.map((exam: any) => ({
        id: exam.id?.toString() || exam._id?.toString() || Math.random().toString(),
        nome: exam.nome || exam.name || "Exame",
        preco: exam.preco || exam.price || exam.valor || 0,
        tipo: TipoItem.EXAME,
        descricao: exam.descricao || exam.description || "",
      }));

      // Buscar consultas
      const consultationsResponse = await _axios.get("/consultation-types");
      const consultationsRaw = consultationsResponse.data?.data || consultationsResponse.data || [];

      const consultationsData = consultationsRaw.map((cons: any) => ({
        id: cons.id?.toString() || cons._id?.toString() || Math.random().toString(),
        nome: cons.nome || cons.name || "Consulta",
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

  // Função para agendar CONSULTAS usando o novo endpoint
  const handleSubmitConsultas = async () => {
    try {
      const consultas = schedules.filter((schedule) => schedule.tipo === TipoItem.CONSULTA);

      if (consultas.length === 0) {
        ___showErrorToastNotification({ message: "Nenhuma consulta para agendar." });
        return;
      }

      // **PAYLOAD PARA O NOVO ENDPOINT /schedulings/set-schedules**
      const payload = {
        id_paciente: Number(selectedPatient!.id),
        id_unidade_de_saude: unit_health.toString(),
        consultas_paciente: consultas.map((schedule) => ({
          id_tipo_consulta: Number(schedule.item?.id),
          data_agendamento: schedule.date instanceof Date ? schedule.date.toISOString().split("T")[0] : schedule.date ? new Date(schedule.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          hora_agendamento: schedule.time,
          status_reembolso: schedule.item && schedule.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
        })),
      };

      console.log("Enviando consultas para /schedulings/set-schedule:", JSON.stringify(payload, null, 2));

      const response = await _axios.post("/schedulings/set-schedule", payload);

      if (response.status === 201 || response.status === 200) {
        ___showSuccessToastNotification({
          message: `${consultas.length} consulta(s) agendada(s) com sucesso!`,
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Erro ao agendar consultas:", error);
      console.error("Resposta do erro:", error.response?.data);

      // Tentar endpoint alternativo se o principal falhar
      try {
        console.log("Tentando endpoint alternativo /schedulings...");
        const payload = {
          id_paciente: Number(selectedPatient!.id),
          id_unidade_de_saude: unit_health.toString(),
          id_recepcionista: user_id,
          status: "ACTIVO",
          status_pagamento: "NAO_PAGO",
          status_reembolso: "SEM_REEMBOLSO",
          consultas_paciente: schedules
            .filter((schedule) => schedule.tipo === TipoItem.CONSULTA)
            .map((schedule) => ({
              id_tipo_consulta: Number(schedule.item?.id),
              data_agendamento: schedule.date instanceof Date ? schedule.date.toISOString().split("T")[0] : schedule.date ? new Date(schedule.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
              hora_agendamento: schedule.time,
              status_pagamento: schedule.item && schedule.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
            })),
        };

        const responseAlt = await _axios.post("/schedulings", payload);

        if (responseAlt.status === 201 || responseAlt.status === 200) {
          ___showSuccessToastNotification({
            message: "Consultas agendadas com endpoint alternativo!",
          });
          return true;
        }
      } catch (error2: any) {
        console.error("Erro no endpoint alternativo:", error2);
      }

      throw error;
    }
  };

  // Função para agendar EXAMES usando o endpoint tradicional
  const handleSubmitExames = async () => {
    try {
      const exames = schedules.filter((schedule) => schedule.tipo === TipoItem.EXAME);

      if (exames.length === 0) {
        ___showErrorToastNotification({ message: "Nenhum exame para agendar." });
        return false;
      }

      const payload = {
        id_paciente: Number(selectedPatient!.id),
        id_unidade_de_saude: unit_health.toString(),
        id_recepcionista: user_id,
        status: "ACTIVO",
        status_pagamento: calculateTotalValue() > 0 ? "NAO_PAGO" : "ISENTO",
        status_reembolso: "SEM_REEMBOLSO",
        exames_paciente: exames.map((schedule) => ({
          id_tipo_exame: Number(schedule.item?.id),
          data_agendamento: schedule.date instanceof Date ? schedule.date.toISOString().split("T")[0] : schedule.date ? new Date(schedule.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          hora_agendamento: schedule.time,
          status_pagamento: schedule.item && schedule.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
          status_reembolso: "SEM_REEMBOLSO",
          status: "PENDENTE",
          valor_total: schedule.item?.preco || 0,
          isento: schedule.item?.preco === 0,
        })),
      };

      console.log("Enviando exames para /schedulings:", JSON.stringify(payload, null, 2));

      const response = await _axios.post("/schedulings", payload);

      if (response.status === 201 || response.status === 200) {
        ___showSuccessToastNotification({
          message: `${exames.length} exame(s) agendado(s) com sucesso!`,
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Erro ao agendar exames:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (isSaving) return;

    const validation = validateSchedule();
    if (!validation.isValid) return;

    setIsSaving(true);
    try {
      const consultas = schedules.filter((schedule) => schedule.tipo === TipoItem.CONSULTA);
      const exames = schedules.filter((schedule) => schedule.tipo === TipoItem.EXAME);

      let success = false;

      // Verificar se está tentando agendar ambos os tipos
      if (consultas.length > 0 && exames.length > 0) {
        ___showErrorToastNotification({
          message: "Não é possível agendar exames e consultas no mesmo processo. Selecione apenas um tipo.",
        });
        setIsSaving(false);
        return;
      }

      // Agendar CONSULTAS usando o novo endpoint
      if (consultas.length > 0) {
        success = (await handleSubmitConsultas()) ?? true;
      }
      // Agendar EXAMES usando o endpoint tradicional
      else if (exames.length > 0) {
        success = await handleSubmitExames();
      } else {
        ___showErrorToastNotification({ message: "Nenhum item selecionado para agendamento." });
        setIsSaving(false);
        return;
      }

      if (success) {
        // Resetar todos os campos
        setSchedules([{ item: null, tipo: TipoItem.EXAME, date: null, time: "" }]);
        setSelectedPatient(undefined);
        setSelectedPatientId("");
        setSelectedTipo(TipoItem.EXAME);
        resetInputs();
        setResetPatient(true);
      }
    } catch (error: any) {
      console.error("Erro completo:", error);
      console.error("Resposta do erro:", error.response?.data);

      // **SOLUÇÃO DE EMERGÊNCIA: Criar processo em duas etapas se falhar**
      try {
        console.log("Tentando solução de emergência...");

        // **ETAPA 1: Criar o processo básico**
        const processoPayload = {
          id_paciente: Number(selectedPatient!.id),
          id_unidade_de_saude: unit_health.toString(),
          id_recepcionista: user_id,
          status: "ACTIVO",
          status_pagamento: calculateTotalValue() > 0 ? "NAO_PAGO" : "ISENTO",
          status_reembolso: "SEM_REEMBOLSO",
        };

        console.log("Criando processo básico:", processoPayload);
        const processoResponse = await _axios.post("/schedulings", processoPayload);
        const idProcesso = processoResponse.data.id;

        console.log("Processo criado com ID:", idProcesso);

        // **ETAPA 2: Adicionar os itens**
        const consultas = schedules.filter((schedule) => schedule.tipo === TipoItem.CONSULTA);
        const exames = schedules.filter((schedule) => schedule.tipo === TipoItem.EXAME);

        if (consultas.length > 0) {
          for (const consulta of consultas) {
            const consultaPayload = {
              id_agendamento: idProcesso,
              id_tipo_consulta: Number(consulta.item?.id),
              data_agendamento: consulta.date instanceof Date ? consulta.date.toISOString().split("T")[0] : consulta.date ? new Date(consulta.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
              hora_agendamento: consulta.time,
              status_pagamento: consulta.item && consulta.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
              status: "PENDENTE",
              valor_total: consulta.item?.preco || 0,
            };

            console.log("Adicionando consulta:", consultaPayload);
            await _axios.post("/consultations", consultaPayload);
          }

          ___showSuccessToastNotification({
            message: `${consultas.length} consulta(s) agendada(s) com sucesso em duas etapas!`,
          });
        }

        if (exames.length > 0) {
          for (const exame of exames) {
            const examePayload = {
              id_agendamento: idProcesso,
              id_tipo_exame: Number(exame.item?.id),
              data_agendamento: exame.date instanceof Date ? exame.date.toISOString().split("T")[0] : exame.date ? new Date(exame.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
              hora_agendamento: exame.time,
              status_pagamento: exame.item && exame.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
              status: "PENDENTE",
              valor_total: exame.item?.preco || 0,
            };

            console.log("Adicionando exame:", examePayload);
            await _axios.post("/exams", examePayload);
          }

          ___showSuccessToastNotification({
            message: `${exames.length} exame(s) agendado(s) com sucesso em duas etapas!`,
          });
        }

        // Reset
        setSchedules([{ item: null, tipo: TipoItem.EXAME, date: null, time: "" }]);
        setSelectedPatient(undefined);
        setSelectedPatientId("");
        setSelectedTipo(TipoItem.EXAME);
        resetInputs();
        setResetPatient(true);
      } catch (error2: any) {
        console.error("Erro na solução alternativa:", error2);
        console.error("Detalhes:", error2.response?.data);
        ___showErrorToastNotification({
          message: `Erro: ${error2?.response?.data?.message || error2.message || "Contate o suporte"}`,
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
            <PatientDetails isLoading={isLoading} selectedPatient={selectedPatient ?? undefined} autoCompleteData={patientAutoComplete} onPatientSelect={(patientId) => setSelectedPatientId(patientId)} resetPatient={resetPatient} getPatientAge={getPatientAge} />
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
                  }}
                  className={`flex-1 ${selectedTipo === TipoItem.EXAME ? "bg-akin-turquoise hover:bg-akin-turquoise/90" : ""}`}
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
                  className={`flex-1 ${selectedTipo === TipoItem.CONSULTA ? "bg-akin-turquoise hover:bg-akin-turquoise/90" : ""}`}
                >
                  Consultas
                </Button>
              </div>
            </div>
          </div>

          {selectedTipo === TipoItem.CONSULTA && availableClinicos.length > 0 && (
            <div className="p-4 bg-gray-100 rounded-lg border">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-lg">Clínico Geral Disponível</label>
                 
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Clínico Responsável</label>

                    {isLoadingClinicos ? (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-gray-500">Carregando...</p>
                      </div>
                    ) : (
                      <Select defaultValue={availableClinicos[0]?.id || ""}>
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
                <p className="font-medium text-yellow-800">Nenhum {selectedTipo === TipoItem.EXAME ? "exame" : "consulta"} disponível</p>
              </div>
            ) : (
              <ScheduleDetails isLoading={isLoading} items={filteredItems} schedules={schedules} onChange={setSchedules} selectedTipo={selectedTipo} />
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
                      <Badge variant={calculateTotalValue() > 0 ? "outline" : "default"} className={calculateTotalValue() > 0 ? "bg-yellow-50 text-yellow-800" : "bg-green-100 text-green-800"}>
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

        <Button type="submit" disabled={isSaving || !selectedPatient} className="bg-akin-turquoise hover:bg-akin-turquoise/80">
          {isSaving ? "Criando Agendamento..." : selectedTipo === TipoItem.CONSULTA ? "Agendar Consulta(s)" : "Agendar Exame(s)"}
        </Button>
      </form>
    </div>
  );
}
