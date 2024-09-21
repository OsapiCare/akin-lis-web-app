"use client";

import { FormProvider, useForm } from "react-hook-form";
import PatientFormSave from "./components/PatientFormSave";
import ExameForm from "./components/ExamForm";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface INew {}

const schemmaSchedule = z.object({
  name: z.string({ required_error: "Campo obrigatorio" }).min(3, "nome invalido"),
  gender: z.string(),
});
export type schemmaScheduleCreateType = z.infer<typeof schemmaSchedule>;

export default function New({}: INew) {
  const form = useForm<schemmaScheduleCreateType>({
    resolver: zodResolver(schemmaSchedule),
  });
  function handleSubmit(data: schemmaScheduleCreateType) {
    console.log("created");
  }
  return (
    <div className=" h-screen px-4  ">
      <h1 className="font-light text-3xl my-6">Novo Agendamento</h1>
      <div className=" ">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex w-full gap-x-3 ">
            <PatientFormSave />
            <ExameForm />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
