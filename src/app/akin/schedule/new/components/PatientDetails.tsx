import Autocomplete from "@/components/ui/autocomplete";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientInfo } from "./PatientInfo";
import { Patient } from "@/module/types";

interface PatientDetailsProps {
  isLoading: boolean;
  selectedPatient?: Patient;
  onPatientSelect: (id: string) => void;
  autoCompleteData: {
    value: string;
    id: string;
  }[];
  resetPatient: boolean;
  /** Função opcional para calcular idade detalhada */
  getPatientAge?: (birthDate: string) => string;
}

export function PatientDetails({
  isLoading,
  selectedPatient,
  onPatientSelect,
  autoCompleteData,
  resetPatient,
  getPatientAge
}: PatientDetailsProps) {
  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <div className="flex justify-between gap-5 w-[650px]">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
        </div>
      ) : (
        <div className="flex rounded-lg gap-5">
          <Autocomplete
            suggestions={autoCompleteData}
            onSelect={(id) => id && onPatientSelect(id)}
            placeholder={selectedPatient?.nome_completo || "Nome completo do paciente"}
            reset={resetPatient}
          />
        </div>
      )}

      {/* Informações detalhadas do paciente */}
      <PatientInfo
        patient={selectedPatient}
        isLoading={isLoading}
        getPatientAge={getPatientAge} // <-- passa a função para mostrar idade detalhada
      />
    </div>
  );
}
