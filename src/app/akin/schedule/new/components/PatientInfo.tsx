import { Input } from "@/components/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Patient } from "@/module/types";

interface PatientInfoProps {
  patient: Patient | undefined;
  isLoading: boolean;
  getPatientAge?: (birthDate: string) => string;
}

export function PatientInfo({ patient, isLoading, getPatientAge }: PatientInfoProps) {
  const parseDate = (date?: string | null) => {
    if (!date) return null;
    return new Date(date.includes("T") ? date : date + "T00:00:00");
  };

  const calculateAge = (birthDate?: string | null) => {
    if (!birthDate) return "-";
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = now.getTime() - birth.getTime();

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = now.getMonth() - birth.getMonth() + (12 * (now.getFullYear() - birth.getFullYear()));
    const diffYears = now.getFullYear() - birth.getFullYear();

    if (diffYears > 0) return `${diffYears} ano${diffYears > 1 ? "s" : ""}`;
    if (diffMonths > 0) return `${diffMonths} mês${diffMonths > 1 ? "es" : ""}`;
    return `${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  };

  return (
    <div className="flex flex-nowrap gap-2">
      {isLoading ? (
        <div className="w-full space-y-3">
          <Skeleton className="w-full h-[250px]" />
        </div>
      ) : (
        <div className="space-y-6 w-full p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <Input.CalenderDate
              disabled
              name="calendario"
              noUseLabel
              placeholder="Data de Nascimento"
              maxDate={new Date()}
              valueDate={parseDate(patient?.data_nascimento)}
              className="flex-1 h-12 px-3 lg:w-[400px] w-full bg-white text-sm border rounded-md"
            />
            <input
              disabled
              name="gender"
              placeholder="Sexo"
              className="rounded-lg bg-white h-12 px-3 text-gray-400 text-sm border"
              value={patient?.sexo?.nome ?? ""}
            />
          </div>

          <div className="flex gap-4">
            <Input.InputText
              placeholder="Idade"
              name="age"
              value={calculateAge(patient?.data_nascimento)}
              disabled
              className="w-1/3 bg-white border border-gray-200 text-sm"
            />
            <Input.InputText
              placeholder="Contacto Telefónico"
              id="text"
              name="phone_number"
              value={patient?.contacto_telefonico ?? ""}
              disabled
              className="flex-1 bg-white border border-gray-200 text-sm"
            />
          </div>

          <Input.InputText
            placeholder="Bilhete de Identidade"
            name="identity"
            value={patient?.numero_identificacao ?? ""}
            disabled
            className="w-full bg-white border border-gray-200 text-sm"
          />
        </div>
      )}
    </div>
  );
}
