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
import { IExamProps, Patient } from "@/module/types";
import { patientRoutes } from "@/Api/Routes/patients";

export type SchemaScheduleType = z.infer<typeof schemaSchedule>;

export default function New() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableExams, setAvailableExams] = useState<IExamProps[]>([]);
  const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);
  const [patientAutoComplete, setPatientAutoComplete] = useState<{ value: string; id: string }[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([{ exam: null, date: null, time: "" }]);
  const [resetPatient, setResetPatient] = useState(false);
  const unit_health = getAllDataInCookies().userdata.health_unit_ref || 1;

  useEffect(() => {
    if (selectedPatientId) {
      setSelectedPatient(availablePatients.find((p) => p.id === selectedPatientId));
    }
  }, [selectedPatientId, availablePatients]);

  const fetchPatientsAndExams = async () => {
    try {
      const patientsResponse = await patientRoutes.getAllPacients();
      setAvailablePatients(patientsResponse);
      setPatientAutoComplete(patientsResponse.map((p: Patient) => ({ value: p.nome_completo, id: p.id })));

      const examsResponse = await _axios.get("/exam-types");
      setAvailableExams(examsResponse.data.data);

      ___showSuccessToastNotification({ message: "Dados obtidos com sucesso!" });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao buscar dados. Contate o suporte.";
      ___showErrorToastNotification({ message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsAndExams();
  }, []);

  const handleSavePatient = (patient: Patient) => {
    setPatientAutoComplete((prev) => [...prev, { value: patient.nome_completo, id: patient.id }]);
    setAvailablePatients((prev) => [...prev, patient]);
    setSelectedPatient(patient);
  };

  const getPatientAge = (birthDate: string) => {
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

  /** Validação detalhada com mensagens específicas por exame */
  const validateSchedule = () => {
    const errors: string[] = [];
    const today = new Date();

    if (!selectedPatient) {
      errors.push("Nenhum paciente selecionado.");
    }

    schedules.forEach((schedule, index) => {
      if (!schedule.exam) errors.push(`Agendamento ${index + 1}: Exame não selecionado.`);
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
        exames_paciente: schedules.map((schedule) => ({
          id_tipo_exame: schedule.exam?.id,
          data_agendamento: schedule.date instanceof Date ? schedule.date.toISOString().split("T")[0] : schedule.date ? new Date(schedule.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          hora_agendamento: schedule.time,
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
      const response = await _axios.post("/schedulings/set-schedule", validation.data);
      if (response.status === 201) {
        ___showSuccessToastNotification({ message: "Agendamento marcado com sucesso" });
        setSchedules([{ exam: null, date: null, time: "" }]);
        setSelectedPatient(undefined);
        setSelectedPatientId("");
        resetInputs();
        setResetPatient(true);
      }
    } catch (error: any) {
      // Tratamento detalhado de erro do backend por exame
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors.map((e: any, i: number) => `Agendamento ${i + 1}: ${e.message}`);
        ___showErrorToastNotification({ messages: backendErrors });
      } else {
        const msg = error?.response?.data?.message || "Erro ao marcar agendamento. Contate o suporte.";
        ___showErrorToastNotification({ message: msg });
      }
      setResetPatient(false);
    } finally {
      setIsSaving(false);
    }
  };

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
              selectedPatient={selectedPatient}
              autoCompleteData={patientAutoComplete}
              onPatientSelect={(patientId) => setSelectedPatientId(patientId)}
              resetPatient={resetPatient}
              getPatientAge={getPatientAge}
            />
          </div>

          <div className="p-4 bg-gray-100 rounded-lg border flex flex-col">
            <ScheduleDetails isLoading={isLoading} exams={availableExams} schedules={schedules} onChange={setSchedules} />
          </div>
        </div>

        <Button type="submit" disabled={isSaving} className="bg-akin-turquoise hover:bg-akin-turquoise/80">
          {isSaving ? "Agendando..." : "Agendar"}
        </Button>
      </form>
    </div>
  );
}
