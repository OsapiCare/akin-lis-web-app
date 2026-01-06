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
import { Combobox } from "@/components/combobox/comboboxExam";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type SchemaScheduleType = z.infer<typeof schemaSchedule>;

// Enum para tipos de itens
enum TipoItem {
  EXAME = "EXAME",
  CONSULTA = "CONSULTA"
}

// Interface para Clínico Geral
interface IClinicoGeral {
  id: string;
  nome: string;
  especialidade?: string;
  registro_profissional?: string;
}

export default function New() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableItems, setAvailableItems] = useState<IItemTipoProps[]>([]);
  const [availablePatients, setAvailablePatients] = useState<IPaciente[]>([]);
  const [availableClinicos, setAvailableClinicos] = useState<IClinicoGeral[]>([]);
  const [patientAutoComplete, setPatientAutoComplete] = useState<{ value: string; id: string }[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<IPaciente | undefined>();
  const [selectedClinicoGeral, setSelectedClinicoGeral] = useState<IClinicoGeral | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([{ item: null, tipo: TipoItem.EXAME, date: null, time: "" }]);
  const [selectedTipo, setSelectedTipo] = useState<TipoItem>(TipoItem.EXAME);
  const [resetPatient, setResetPatient] = useState(false);
  const [showReembolsoInfo, setShowReembolsoInfo] = useState(false);
  const unit_health = getAllDataInCookies().userdata.health_unit_ref || 1;
  const [hasFetchedData, setHasFetchedData] = useState(false); // Novo estado para controlar fetch

  useEffect(() => {
    if (selectedPatientId) {
      setSelectedPatient(availablePatients.find((p) => p.id === selectedPatientId));
    }
  }, [selectedPatientId, availablePatients]);

  const fetchAllData = async () => {
    // Evitar chamadas duplicadas
    if (hasFetchedData) return;
    
    try {
      setIsLoading(true);
      
      // Buscar pacientes
      const patientsResponse = await patientRoutes.getAllPacients();
      setAvailablePatients(patientsResponse);
      setPatientAutoComplete(patientsResponse.map((p: IPaciente) => ({ value: p.nome_completo, id: p.id })));

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

      // Buscar clínicos gerais
      try {
        const clinicosResponse = await _axios.get("/schedulings/general-practitioner");
        const clinicosRaw = clinicosResponse.data.data || clinicosResponse.data || [];
        setAvailableClinicos(clinicosRaw.map((clinico: any) => ({
          id: clinico.id || clinico._id,
          nome: clinico.nome || clinico.name,
          especialidade: clinico.especialidade || clinico.specialty,
          registro_profissional: clinico.registro_profissional || clinico.registration
        })));
      } catch (clinicoError: any) {
        console.warn("Aviso: Endpoint de clínicos não disponível:", clinicoError.message);
        // Não é crítico, o usuário pode continuar sem selecionar clínico se não houver consultas
      }

      // Combinar exames e consultas
      const allItems = [...examsData, ...consultationsData];
      
      setAvailableItems(allItems);
      setHasFetchedData(true); // Marcar que já fez o fetch
      
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
    // Usar um timeout para garantir que o componente está montado
    const timer = setTimeout(() => {
      fetchAllData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Array de dependências vazio para executar apenas uma vez

  const handleSavePatient = (patient: IPaciente) => {
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
    return schedules.some(schedule => schedule.tipo === TipoItem.CONSULTA);
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

    // Verificar se há consultas sem clínico geral alocado
    const hasConsultas = schedules.some(schedule => schedule.tipo === TipoItem.CONSULTA);
    if (hasConsultas && !selectedClinicoGeral) {
      errors.push("Para agendar consultas, é necessário selecionar um clínico geral responsável.");
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

    return {
      isValid: true,
      data: {
        id_paciente: selectedPatient!.id,
        id_unidade_de_saude: unit_health,
        // Estado inicial conforme PDF
        estado_clinico: "ATIVO",
        estado_financeiro: calculateTotalValue() > 0 ? "NAO_PAGO" : "ISENTO",
        estado_reembolso: "SEM_REEMBOLSO",
        valor_total: calculateTotalValue(),
        valor_pago: 0,
        valor_a_pagar: calculateTotalValue(),
        // Campos de alocação
        id_clinico_geral_alocado: selectedClinicoGeral?.id,
        // Itens do processo
        itens: schedules.map((schedule) => ({
          id_tipo_item: schedule.item?.id,
          tipo: schedule.tipo,
          data_agendamento: schedule.date instanceof Date ? schedule.date.toISOString().split("T")[0] : schedule.date ? new Date(schedule.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          hora_agendamento: schedule.time,
          // Estados iniciais do item conforme PDF
          estado_clinico: "PENDENTE",
          estado_financeiro: schedule.item && schedule.item.preco > 0 ? "NAO_PAGO" : "ISENTO",
          estado_reembolso: "SEM_REEMBOLSO"
        })),
      },
    };
  };

  const handleSubmit = async () => {
    if (isSaving) return;

    const validation = validateSchedule();
    if (!validation.isValid) return;

    setIsSaving(true);
    try {
      // Usar endpoint existente ou criar novo
      const response = await _axios.post("/schedulings/set-schedule", validation.data);
      
      if (response.status === 201) {
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
      console.error("Erro ao criar processo:", error);
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors.map((e: any, i: number) => `Agendamento ${i + 1}: ${e.message}`);
        ___showErrorToastNotification({ messages: backendErrors });
      } else {
        const msg = error?.response?.data?.message || "Erro ao criar processo de agendamento. Contate o suporte.";
        ___showErrorToastNotification({ message: msg });
      }
      setResetPatient(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrar itens por tipo selecionado
  const filteredItems = availableItems.filter(item => item.tipo === selectedTipo);

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
                    setSchedules(prev => prev.map(s => ({ ...s, tipo: TipoItem.EXAME, item: s.tipo === TipoItem.EXAME ? s.item : null })));
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
                    setSchedules(prev => prev.map(s => ({ ...s, tipo: TipoItem.CONSULTA, item: s.tipo === TipoItem.CONSULTA ? s.item : null })));
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
                  <Badge variant="outline" className="bg-blue-50">
                    Obrigatório para consultas
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Selecione o clínico geral responsável pelas consultas deste processo
                </p>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Clínico Geral Responsável</label>
                    <Combobox 
                      data={availableClinicos} 
                      displayKey="nome" 
                      selectedValue={selectedClinicoGeral} 
                      onSelect={(clinico) => setSelectedClinicoGeral(clinico)} 
                      placeholder="Selecionar clínico geral"
                      clearLabel="Limpar seleção"
                    />
                  </div>
                  
                  {selectedClinicoGeral && (
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Nome:</span>
                            <span>{selectedClinicoGeral.nome}</span>
                          </div>
                          {selectedClinicoGeral.especialidade && (
                            <div className="flex justify-between">
                              <span className="font-medium">Especialidade:</span>
                              <span>{selectedClinicoGeral.especialidade}</span>
                            </div>
                          )}
                          {selectedClinicoGeral.registro_profissional && (
                            <div className="flex justify-between">
                              <span className="font-medium">Registro:</span>
                              <span>{selectedClinicoGeral.registro_profissional}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
                      <li><strong>SEM REEMBOLSO:</strong> Nenhuma ação de reembolso é necessária (estado inicial)</li>
                      <li><strong>POR REEMBOLSAR:</strong> Há devolução pendente e ação financeira necessária</li>
                      <li><strong>REEMBOLSADO:</strong> Processo de reembolso concluído</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      Nota: O reembolso é sempre por bloco inteiro, nunca parcial.
                    </p>
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
                          currency: "AOA"
                        }).format(calculateTotalValue())}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-sm text-gray-600">Estado Financeiro Inicial</span>
                      <Badge variant={calculateTotalValue() > 0 ? "outline" : "default"} 
                        className={calculateTotalValue() > 0 ? "bg-yellow-50 text-yellow-800" : "bg-green-100 text-green-800"}>
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
                <p><strong>Itens no processo:</strong> {schedules.length} {schedules.length === 1 ? 'item' : 'itens'}</p>
                <p><strong>{selectedTipo === TipoItem.EXAME ? "Exames" : "Consultas"} disponíveis:</strong> {filteredItems.length}</p>
                {shouldShowClinicoGeralField() && selectedClinicoGeral && (
                  <p><strong>Clínico geral alocado:</strong> {selectedClinicoGeral.nome}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isSaving} className="bg-akin-turquoise hover:bg-akin-turquoise/80">
          {isSaving ? "Criando Processo..." : "Criar Processo de Agendamento"}
        </Button>
      </form>
    </div>
  );
}