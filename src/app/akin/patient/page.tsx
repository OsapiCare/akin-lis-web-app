import { Input } from "@/components/input";
import { AppLayout } from "@/components/layout";
import { APP_CONFIG } from "@/config/app";
import { Search } from "lucide-react";
import Link from "next/link";
import BasicDemo from "./lista-beta";
import { View } from "@/components/view";

interface IPatient {}

export default function Patient({}: IPatient) {
  return (
    <View.Vertical className=" h-screen ">
      <AppLayout.ContainerHeader label="Pacientes" />

      <View.Scroll>
        {Array.from({ length: 1 }).map((_, index) => (
          <Link key={index} href={APP_CONFIG.ROUTES.PATIENT.INDIVIDUAL_PATIENT_LINK(index)}>
            <p>Clica aqui para testar - Paciente {index + 1}</p>
          </Link>
        ))}

        <BasicDemo />
      </View.Scroll>
    </View.Vertical>
  );
}
