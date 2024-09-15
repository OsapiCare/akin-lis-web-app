import ExamsHistory from "./exam-history";
import { Button } from "@/components/button";
import { AppLayout } from "@/components/layout";
import { View } from "@/components/view";
import { Settings } from "lucide-react";
import Image from "next/image";
import ImageAvatat from "@/assets/images/avatar.png";
import { api } from "@/lib/axios";
import Avatar from "@/components/avatar";

interface IPatientById {
  params: {
    id: string;
  };
}

export default async function PatientById({ params }: IPatientById) {
  let patient: PatientType;
  let exames: ExamsType[] = [];
  try {
    patient = await api.get(`/pacients/${params.id}`).then((response) => response.data);
    // patient = await api.get(`/exams`).then((response) => response.data);

  } catch (error) {
    throw new Error(`Buscando Paciente com iD ${params.id}:${error}`);
  }

  return (
    <View.Vertical className="h-screen">
      <AppLayout.ContainerHeader goBack label="Perfil do Paciente" />
      <div className="flex gap-4 bg-sky-100 p-6  rounded-lg ">
        <PatientResumeInfo patient={patient} />
        {/* <div className=" flex flex-col gap-y-2">
          PROCURANDO IDEIA...
          <Button.Primary icon={<Settings className="animate-spin mr-1" />}>Desativar Perfil</Button.Primary>
          <Button.Primary icon={<Settings className="animate-spin mr-1" />}>Editar Perfil</Button.Primary>
        </div> */}
      </div>

      <div>
        <h1 className="font-bold text-2xl my-4 ">Histórico de Exames</h1>
        <hr />
      </div>

      <View.Scroll>
        <ExamsHistory />
      </View.Scroll>
    </View.Vertical>
  );
}


function PatientResumeInfo({ patient }: { patient: PatientType }) {
  return (
    <div className="flex flex-1 items-center gap-x-6">
      <Avatar userName={patient.nome} image={String(ImageAvatat)} size="xlarge" className="size-[144px]" />

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
