import ExamsHistory from "./exam-history";
import { Button } from "@/components/button";
import { AppLayout } from "@/components/layout";
import { View } from "@/components/view";
import { Settings } from "lucide-react";
import Image from "next/image";
import ImageAvatat from "@/assets/images/avatar.png";

interface IPatientById {
  params: {
    id: string;
  };
}

export default function PatientById({ params }: IPatientById) {
  return (
    <View.Vertical className="h-screen">
      <AppLayout.ContainerHeader goBack label="Perfil do Paciente" />
      <div className="flex gap-4 bg-akin-turquoise/10 p-6  rounded-lg ">
        <PatientResumeInfo />
        <div className=" flex flex-col gap-y-2">
          PROCURANDO IDEIA...
          <Button.Primary icon={<Settings className="animate-spin mr-1" />}>Desativar Perfil</Button.Primary>
          <Button.Primary icon={<Settings className="animate-spin mr-1" />}>Editar Perfil</Button.Primary>
        </div>
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

function PatientResumeInfo() {
  return (
    <div className="flex flex-1 gap-x-6">
      <Image src={ImageAvatat} alt="Avatar do Paciente" className="rounded-full border border-dashed border-akin-turquoise" width={144} height={144} />

      <div>
        <p className="font-bold text-akin-turquoise text-xl">Paulina Paul</p>
        <p>idade: 25</p>
        <p>Sexo: Feminino</p>
        <p>Contacto: +49 258 926 0099</p>
        <p>Email: paulina.paul@gmail.com</p>
        <p>Registrado(a) em: 12/12/2022</p>
      </div>
    </div>
  );
}
