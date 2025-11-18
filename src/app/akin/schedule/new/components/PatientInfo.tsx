import { Input } from "@/components/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Patient } from "@/module/types";

export function PatientInfo({ patient, isLoading }: { patient: Patient | undefined; isLoading: boolean }) {
  const parseDate = (date?: string | null) => {
    if (!date) return null;
    return new Date(date.includes("T") ? date : date + "T00:00:00");
  };

  return (
    <div className="flex flex-nowrap gap-2 ">
      {isLoading ? (
        <div className="w-full space-y-3">
          <Skeleton className="w-full h-[250px]" />
        </div>
      ) : (
        <div className="space-y-6 w-full p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <Input.CalenderDate disabled name="calendario" noUseLabel placeholder="Data de Nascimento" maxDate={new Date()} valueDate={parseDate(patient?.data_nascimento)} className="flex-1 h-12 px-3 lg:w-[400px] w-full bg-white text-sm border rounded-md" />
            <input disabled name="gender" placeholder="Sexo" className="rounded-lg bg-white h-12 px-3 text-gray-400 text-sm border" value={patient?.sexo?.nome ?? ""} />
          </div>

          <Input.InputText placeholder="Contacto Telefónico" id="text" name="phone_number" value={patient?.contacto_telefonico ?? ""} disabled className="w-full bg-white border border-gray-200 text-sm" />

          <Input.InputText placeholder="Bilhete de Identidade" name="identity" value={patient?.numero_identificacao ?? ""} disabled className="w-full bg-white border-gray-200 border text-sm" />
        </div>
      )}
    </div>
  );
}
