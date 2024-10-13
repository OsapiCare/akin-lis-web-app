import { AppLayout } from "@/components/layout";
import { APP_CONFIG } from "@/config/app";
import Link from "next/link";
import { View } from "@/components/view";
import { ___api } from "@/lib/axios";

export default async function Patient() {
  let patients: PatientType[] = [];

  // revalidatePath("/akin/patient");

  try {
    patients = await ___api.get("/pacients").then((response) => response.data);
  } catch (error) {
    throw new Error(`Buscando Pacientes:${error}`);
  }

  return (
    <View.Vertical className=" h-screen ">
      <AppLayout.ContainerHeader label="Pacientes" />
      <View.Scroll>
        <PatientTableData patients={patients} />
      </View.Scroll>
    </View.Vertical>
  );
}

interface PatientTableDataProps {
  patients: PatientType[];
}

function PatientTableData({ patients }: PatientTableDataProps) {
  return (
    <>
      <div className="overflow-x-auto p-4">
        {patients.length > 0 ? (
          <>
            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
              <thead className=" bg-sky-300 *:text-left text-sky-800 ">
                <tr className="*:whitespace-nowrap *:py-2 *:p-2 *:font-bold">
                  <th>Nome do Paciente</th>
                  <th>Nº do BI</th>
                  <th>Idade</th>
                  <th>Data de Nascimento</th>
                  <th>Contacto</th>
                  <th></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {patients.map((patient, index) => (
                  <tr className="*:p-2 even:bg-sky-100 odd:bg-sky-50">
                    <td>{patient.nome}</td>
                    <td>{patient.numero_identificacao}</td>
                    <td>{2024 - Number(new Date(patient.data_nascimento).getFullYear())}</td>
                    <td>{new Date(patient.data_nascimento).toLocaleDateString()}</td>
                    <td>{patient.contacto_telefonico}</td>

                    <td>
                      <Link key={patient.id} href={APP_CONFIG.ROUTES.PATIENT.INDIVIDUAL_PATIENT_LINK(patient.id)} className="inline-block rounded bg-sky-600 px-4 py-2 text-xs font-medium text-white hover:bg-sky-700">
                        <p>Ver Paciente</p>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <p className="text-center text-gray-500">Nenhum Paciente encontrado</p>
          </>
        )}
      </div>
    </>
  );
}
