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
  const unit_health = getAllDataInCookies().userdata.health_unit_ref;

  useEffect(() => {
    fetchPatientsAndExams();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      setSelectedPatient(availablePatients.find((patient) => patient.id === selectedPatientId));
    }
  }, [selectedPatientId, availablePatients]);

  const fetchPatientsAndExams = async () => {
    try {
      const patientsResponse = await _axios.get("pacients");
      const patientsData = patientsResponse.data.map((patient: Patient) => ({ value: patient.nome_completo, id: patient.id }));
      setPatientAutoComplete(patientsData);
      setAvailablePatients(patientsResponse.data);

      const examsResponse = await _axios.get("/exam-types");
      setAvailableExams(examsResponse.data.data);

      ___showSuccessToastNotification({ message: "Dados obtidos com sucesso!" });
    } catch (error) {
      ___showErrorToastNotification({ message: "Erro ao buscar dados" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePatient = (patient: Patient) => {
    setPatientAutoComplete((prev) => [...prev, { value: patient.nome_completo, id: patient.id }]);
    setAvailablePatients((prev) => [...prev, patient]);
    setSelectedPatient(patient);
  };

  const validateSchedule = () => {
    const errors: string[] = [];
    const today = new Date();

    schedules.forEach((schedule, index) => {
      if (!schedule.exam) {
        errors.push(`Exame não selecionado para o agendamento ${index + 1}`);
      }

      const scheduleDateTime = new Date(`${schedule.date}T${schedule.time}`);
      if (scheduleDateTime < today) {
        errors.push(`A data e hora do agendamento ${index + 1} devem ser futuras.`);
      }
    });

    if (!selectedPatient) {
      errors.push("Nenhum paciente selecionado.");
    }

    if (errors.length > 0) {
      ___showErrorToastNotification({ messages: errors });
      return { isValid: false };
    }

    return {
      isValid: true,
      data: {
        id_paciente: selectedPatient!.id,
        id_unidade_de_saude: unit_health,
        exames_paciente: schedules.map((schedule) => {
          const date = schedule.date instanceof Date ? schedule.date : schedule.date ? new Date(schedule.date) : new Date();
          return {
            id_tipo_exame: schedule.exam,
            data_agendamento: date.toISOString().split("T")[0], // 'YYYY-MM-DD'
            hora_agendamento: schedule.time, // 'HH:mm'
          };
        }),
      },
    };
  };
  const handleSubmit = async () => {
    const validation = validateSchedule();
    if (!validation.isValid) return;
    setIsSaving(true);
    try {
      const response = await _axios.post("/schedulings/set-schedule", validation.data);
      if (response.status === 201) {
        ___showSuccessToastNotification({ message: "Agendamento marcado com sucesso" });
        setSchedules([]);
        setSelectedPatient(undefined);
        setSelectedPatientId("");
        resetInputs();
        setResetPatient(true);
      } else {
        ___showErrorToastNotification({ message: "Erro ao marcar agendamento. Tente novamente." });
        setResetPatient(false);
      }
    } catch (error) {
      ___showErrorToastNotification({ message: "Erro ao marcar agendamento. Contate o suporte." });
      setResetPatient(false);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="min-h-screen px-6 py-2 pb-5 overflow-x-hidden">
      {/* Cabeçalho */}
      <div className={"flex flex-col md:flex-row justify-between pr-3 mb-4"}>
        <ModalNewPatient onPatientSaved={handleSavePatient} />
      </div>

      {/* Formulário */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex flex-col gap-6 w-full"
      >
        {/* Detalhes do Paciente e Data */}
        <div className="flex flex-col gap-6 w-full ">
          <div className="p-4 bg-gray-100 rounded-lg border w-full">
            <PatientDetails isLoading={isLoading} selectedPatient={selectedPatient} autoCompleteData={patientAutoComplete} onPatientSelect={(patientId) => setSelectedPatientId(patientId)} resetPatient={resetPatient} />
          </div>

          <div className="p-4 bg-gray-100 rounded-lg border flex flex-col ">
            <ScheduleDetails isLoading={isLoading} exams={availableExams} schedules={schedules} onChange={setSchedules} />
          </div>
        </div>

        <Button type="submit" className="bg-akin-turquoise hover:bg-akin-turquoise/80">
          {isSaving ? "Agendando..." : "Agendar"}
        </Button>
      </form>
    </div>
  );
}
