import ExamsHistory from "./exam-history";
import { AppLayout } from "@/components/layout";
import { View } from "@/components/view";
import { PackageOpen } from "lucide-react";
import ImageAvatat from "@/assets/images/avatar.png";
import { ___api } from "@/lib/axios";
import Avatar from "@/components/avatar";

interface IPatientById {
  params: {
    id: string;
  };
}


export default async function PatientById({ params }: IPatientById) {
  let patient: PatientType;

  try {
    patient = await ___api.get(`/pacients/${params.id}`).then((response) => response.data);
  } catch (error) {
    throw new Error(`Buscando Paciente com ID ${params.id}:${error}`);
  }

  const thereIsNoPatient = patient.id === undefined;

  return (
    <View.Vertical className="h-screen">
      <AppLayout.ContainerHeader goBack label="Perfil do Paciente" />

      {thereIsNoPatient ? (
        <div className="flex flex-col items-center justify-center text-sky-800 p-8 rounded  space-y-4 my-auto">
          <PackageOpen size={150} />
          <p className="text-center">
            Não foi encontrado paciente com iD: <span className="font-bold">{params.id}</span>
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-4 bg-akin-turquoise text-akin-white-smoke p-6  rounded-lg ">
            <PatientResumeInfo patient={patient} />
          </div>

          <div>
            <h1 className="font-bold text-2xl my-4 ">Histórico de Exames</h1>
            <hr />
          </div>

          <View.Scroll>
            <ExamsHistory patientId={patient.id} />
          </View.Scroll>
        </>
      )}
    </View.Vertical>
  );
}

function PatientResumeInfo({ patient }: { patient: PatientType }) {
  return (
    <div className="flex flex-1 items-center gap-x-6">
      <Avatar userName={patient.nome} image={String(ImageAvatat)} size="xlarge" className="border size-[144px]" />
      <div>
        <p className="font-bold text-akin-turquoise text-xl">{patient.nome}</p>
        <p>Nº do BI: {patient.numero_identificacao}</p>
        <p>Sexo: {patient.id_sexo === 1 ? "Masculino" : "Feminino"}</p>
        <p>idade: {2024 - Number(new Date(patient.data_nascimento).getFullYear())}</p>
        <p>Data de Nascumento: {new Date(patient.data_nascimento).toLocaleDateString()}</p>
        <p>Contacto: {patient.contacto_telefonico}</p>
        <p>Última Visita: {new Date(patient.data_ultima_visita).toLocaleString()}</p>
        <p>Registrado(a) em: {new Date(patient.data_ultima_visita).toLocaleString()}</p>
      </div>
    </div>
  );
}
