import AutoComplete from "@/components/auto-complete";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientInfo } from "./PatientInfo";
import Autocomplete from "@/components/ui/autocomplete";
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
}

export function PatientDetails({ isLoading, selectedPatient, onPatientSelect, autoCompleteData, resetPatient }: PatientDetailsProps) {
  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <div className="flex justify-between gap-5  w-[650px] ">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
        </div>
      ) : (
        <div className="flex rounded-lg gap-5 ">
          {/* <AutoComplete
            placeholder={selectedPatient?.nome_completo || "Nome completo do paciente"}
            name="name"
            id="idname"
            lookingFor="paciente"
            dataFromServer={autoCompleteData}
            setSelectedItemId={onPatientSelect }
            className="w-full bg-white "
          /> */}

          <Autocomplete 
          suggestions={autoCompleteData}
           onSelect={(id)=> id  && onPatientSelect(id)} 
           placeholder={
            selectedPatient?.nome_completo || 
            "Nome completo do paciente"
            } 
            reset={resetPatient}
            />
        </div>
      )}
      <PatientInfo patient={selectedPatient} isLoading={isLoading} />
    </div>
  );
}
