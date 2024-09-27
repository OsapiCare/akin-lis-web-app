"use client";

import { FormProvider, useForm } from "react-hook-form";
// import PatientFormSave from "./components/PatientFormSave";
import ExamForm from "./components/ExamForm";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { DialogWindow } from "@/components/dialog";
import { Button } from "@/components/button";
import { AddPatientForm } from "./components/AddPatientForm";
import { Input } from "@/components/input";
import AutoComplete from "@/components/auto-complete";
import { UserRoundPlus } from "lucide-react";

interface INew {}

const schemaSchedule = z.object({
  name: z.string({ required_error: "Campo obrigatorio" }).min(3, "nome invalido"),
  gender: z.string(),
  birth_day: z.string(),
  phone_number: z.string(),
  identity: z.string(),
});
export type schemaScheduleType = z.infer<typeof schemaSchedule>;

export default function New({}: INew) {
  const [messageDialog, setMessageDialog] = useState(false);
  const [windowDialog, setWindowDialog] = useState(false);

  const form = useForm<schemaScheduleType>({
    resolver: zodResolver(schemaSchedule),
  });

  function handleSubmitFn(data: schemaScheduleType) {
    console.log("created", data);
  }

  return (
    <div className=" h-screen px-4  ">
      <h1 className="font-light text-3xl my-6">Novo Agendamento</h1>
      <div className=" ">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitFn)} className="flex w-full gap-x-3 ">
            {/* <PatientFormSave  /> */}

            <div className="flex flex-col flex-1 gap-5 ">
              {/* <AddPatientForm showAddPatientFormButton onClick={() => setWindowDialog(true)} /> */}
              <div className="flex flex-col gap-3 ">
                {/* <AddPatientForm /> */}
                <div className="flex flex-col gap-y-4 *:flex *:gap-x-2">
                  <div className="flex border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0">
                    <AutoComplete placeholder="Nome completo do paciente" {...form.register("name")} className="border-0 ring-0  flex-1" />

                    <div className="text-gray-400 hover:bg-akin-yellow-light transition ease-out  cursor-pointer p-3 hover:text-gray-800 rounded-lg h-fit" onClick={() => setWindowDialog(true)}>
                      <UserRoundPlus />
                    </div>
                  </div>
                  <div className=" *:flex-1">
                    <Input.InputText type="number" placeholder="Data de Nascimento" {...form.register("birth_day")}/>
                    <Input.Dropdown data={[]} {...form.register("gender")}/>
                  </div>

                  <div className="">
                    <Input.InputText className="flex-1" placeholder="Contacto telefónico" {...form.register("phone_number")}/>
                  </div>
                  <div>
                    <Input.InputText className="" placeholder="Bilhete de Identidade" maxLength={14} {...form.register("identity")} />
                  </div>
                </div>
                <div className="space-x-2 flex justify-end mt-4">
                  <Button.Primary onClick={() => setMessageDialog(true)} className="bg-green-700">
                    Guardar
                  </Button.Primary>
                  <Button.Primary onClick={() => setWindowDialog(false)} className="bg-red-700">
                    Cancelar
                  </Button.Primary>
                </div>
              </div>

              <div className="flex gap-2 mt-4"></div>
              <DialogWindow.Message type="Sucesso" visible={messageDialog} setVisible={setMessageDialog} />
            </div>

            <ExamForm />
          </form>
        </FormProvider>
      </div>
      <DialogWindow.Window modalTitle="Confirmação" visible={windowDialog} setVisible={setWindowDialog}>
        <div className="flex flex-col gap-y-4 *:flex *:gap-x-2">
          <div className="flex border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0">
            <Input.InputText className="flex-1 border-0 ring-0" />
          </div>
          <div className=" *:flex-1">
            <Input.InputText type="number" placeholder="Data de Nascimento" />
            <Input.Dropdown data={[]} />
          </div>

          <div className="">
            <Input.InputText className="flex-1" placeholder="Contacto telefónico" />
          </div>
          <div>
            <Input.InputText className="" placeholder="Bilhete de Identidade" maxLength={14} />
          </div>
        </div>
      </DialogWindow.Window>
    </div>
  );
}

// function AddPatient() {
// return (
// <>
{
  /* <DialogWindow.Window modalTitle="Confirmação" visible={windowDialog} setVisible={setWindowDialog}> */
}
{
  /* <div className="flex flex-col gap-3 "> */
}
// <AddPatientForm />
{
  /* <div className="flex flex-col gap-y-4 *:flex *:gap-x-2"> */
}
{
  /* <div className="flex border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0"> */
}
{
  /* <AutoComplete placeholder="Nome completo do paciente" className="border-0 ring-0  flex-1" /> */
}
{
  /*  */
}
{
  /* <div className="text-gray-400 hover:bg-akin-yellow-light transition ease-out  cursor-pointer p-3 hover:text-gray-800 rounded-lg h-fit" onClick={onClick}> */
}
{
  /* <UserRoundPlus /> */
}
{
  /* </div> */
}
{
  /* </div> */
}
{
  /* <div className=" *:flex-1"> */
}
{
  /* <Input.InputText type="number" placeholder="Data de Nascimento" /> */
}
{
  /* <Input.Dropdown data={[]} /> */
}
{
  /* </div> */
}
{
  /*  */
}
{
  /* <div className=""> */
}
{
  /* <Input.InputText className="flex-1" placeholder="Contacto telefónico" /> */
}
{
  /* </div> */
}
{
  /* <div> */
}
{
  /* <Input.InputText className="" placeholder="Bilhete de Identidade" maxLength={14} /> */
}
{
  /* </div> */
}
{
  /* </div> */
}
{
  /* <div className="space-x-2 flex justify-end mt-4"> */
}
{
  /* <Button.Primary onClick={() => setMessageDialog(true)} className="bg-green-700"> */
}
{
  /* Guardar */
}
{
  /* </Button.Primary> */
}
{
  /* <Button.Primary onClick={() => setWindowDialog(false)} className="bg-red-700"> */
}
{
  /* Cancelar */
}
{
  /* </Button.Primary> */
}
{
  /* </div> */
}
{
  /* </div> */
}
{
  /* </DialogWindow.Window> */
}
{
  /* </> */
}
// );
// }
