"use client";

import { FormProvider, useForm } from "react-hook-form";
// import PatientFormSave from "./components/PatientFormSave";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { DialogWindow } from "@/components/dialog";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import AutoComplete from "@/components/auto-complete";
import { UserRoundPlus } from "lucide-react";
import { Calendar } from "primereact/calendar";

// import { AVALIABLE_EXAMES } from "../avaliablesExames";
import { Checkbox } from "primereact/checkbox";
import { View } from "@/components/view";
import { AVALIABLE_EXAMES } from "./avaliablesExames";
import { CheckBoxExam } from "./components/CheckBoxExam";
// import CheckBoxExam from "./components/CheckBoxExam";

interface INew {}

// const schemaSchedule = z.object({
// name: z.string({ required_error: "Campo obrigatorio" }).min(3, "nome invalido"),
// gender: z.string(),
// birth_day: z.string(),
// phone_number: z.string(),
// identity: z.string(),
// });
// export type SchemaScheduleType = z.infer<typeof schemaSchedule>;

export default function New({}: INew) {
  // const [messageDialog, setMessageDialog] = useState(false);
  const [windowDialog, setWindowDialog] = useState(false);
  const [step, setStep] = useState(1);
  const [messageDialog, setMessageDialog] = useState(false);

  function handleClickNextStep() {
    setStep((state) => (state < 2 ? state + 1 : state - 1));
  }

  const [date, setDate] = useState<Date | null>();

  // const form = useForm<SchemaScheduleType>({
  // resolver: zodResolver(schemaSchedule),
  // });
  //
  // function handleSubmitFn(data: SchemaScheduleType) {
  // console.log("created", data);
  // }

  // const {
  // register,
  // handleSubmit,
  // formState: { errors },
  // } = useForm<SchemaScheduleType>({
  // resolver: zodResolver(schemaSchedule),
  // });

  const genders = [
    { id: 1, value: "Masculino" },
    { id: 2, value: "Femenino" },
  ];

  async function onSubmitFn(data: FormData) {
    const patient_id = data.get("identity") as string;
    const patient_phone = data.get("phone_number") as string;
    const patient_birth_day = data.get("birth_day") as string;
    const patient_name = data.get("name") as string;
    const patient_gender = data.get("gender") as string;
    const patient_schedule_time = data.get("schedule_time") as string;
    const patient_schedule_date = data.get("schedule_date") as string;

    const patient_checkboxes = document.querySelectorAll('input[name="opc_checkbox"]:checked');
    const patient_selectedValue = Array.from(patient_checkboxes).map((checkbox) => (checkbox as HTMLInputElement).value);
    const patient_newSelectedValue = patient_selectedValue.map((value) => {
      const id = value.split("_")[0];
      const exame = value.split("_")[1];
      return {
        id,
        exame,
      };
    });

    //data de amanha invalido, ou de hoje com hora superior ao agora é invalido

    //Exames de data de ontem são invalido
    //Validar se a data for de hoje então o exame deve ser de pelo menos 1H a frente
    
    //Horas permitidas de exames?
    // Validar nome, bi, numero tel


    const patient_data = {
      patient_id,
      patient_phone,
      patient_birth_day,
      patient_name,
      patient_gender,
      patient_schedule_time,
      patient_schedule_date,
      patient_newSelectedValue,
    };
    console.log("🚀 ~ onSubmitFn ~ patient_data:", patient_data)
  }

  return (
    <div className=" h-screen px-4  ">
      <h1 className="font-light text-3xl my-6">Novo Agendamento</h1>
      <div className=" ">
        {/* <FormProvider {}> */}
        <form action={onSubmitFn} className="flex w-full gap-x-3 ">
          {/* <PatientFormSave  /> */}

          <div className="flex flex-col flex-1 gap-5 ">
            {/* <AddPatientForm showAddPatientFormButton onClick={() => setWindowDialog(true)} /> */}
            <div className="flex flex-col gap-3 ">
              <div className="flex flex-col gap-y-4 *:flex *:gap-x-2">
                {/* Nome Completo */}
                <div className="flex border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0">
                  <AutoComplete placeholder="Nome completo do paciente" name="name" className="border-0 ring-0  flex-1" />
                  <div className="text-gray-400 hover:bg-akin-yellow-light transition ease-out  cursor-pointer p-3 hover:text-gray-800 rounded-lg h-fit" onClick={() => setWindowDialog(true)}>
                    <UserRoundPlus />
                  </div>
                </div>
                {/* Data Nascimento & Género */}
                <div className=" *:flex-1">
                  {/* <Input.InputText type="number" placeholder="Data de Nascimento" name="birth_day" /> */}
                  <Input.CalenderDate noUseLabel placeholder="Data de Nascimento" maxDate={new Date()} name="birth_day" />
                  <Input.Dropdown data={genders} name="gender" placeholder="Selecione o sexo" />
                </div>

                <Input.InputText placeholder="Contacto telefónico" name="phone_number" type="number" />
                <Input.InputText placeholder="Bilhete de Identidade" maxLength={14} name="identity" />
              </div>
            </div>
            <div className="">
              <h2 className="font-bold">Data do Agendamento</h2>
              <hr />
              <div className="flex gap-2 mt-4 *:flex-1">
                <Input.CalenderDate minDateToBeToday minDate={new Date()} name="schedule_date" />
                <Input.CalenderTime name="schedule_time" />
              </div>
            </div>

            <DialogWindow.Message type="Sucesso" visible={messageDialog} setVisible={setMessageDialog} />
          </div>

          <div className="  h-[29rem] w-[15rem] flex flex-col border-2 border-akin-yellow-light  rounded-lg bg-akin-yellow-light/20 ">
            <div className="space-y-4 flex-1 p-2  ">
              <div className="space-y-2 model p-4  h-[24rem]">
                <h1 className="font-bold text-xl -mx-4">Exames Disponíveis</h1>
                <View.Scroll className="max-h-full overflow-y-auto space-y-2">
                  {AVALIABLE_EXAMES.map((exame, index) => (
                    // <CheckBoxExam key={index} checked={false} description={exame.nome} value={String(exame.id)} onChangecheck={() => alert("")} />

                    <>
                      <CheckBoxExam key={index} description={exame.nome} value={String(exame.id)} />
                    </>
                  ))}
                </View.Scroll>
              </div>
            </div>

            <Button.Primary className="m-2" type="submit" label="Agendar" />
            {/* <Button.Primary className="m-2" onClick={handleClickNextStep} label={step == 1 ? "Próximo" : "Voltar"} /> */}
            <DialogWindow.Message type="Sucesso" visible={messageDialog} setVisible={setMessageDialog} />
          </div>
        </form>
        {/* </FormProvider> */}
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
          <div className="space-x-2 flex justify-end mt-4">
            <Button.Primary onClick={() => setMessageDialog(true)} className="bg-green-700">
              Guardar
            </Button.Primary>
            <Button.Primary onClick={() => setWindowDialog(false)} className="bg-red-700">
              Cancelar
            </Button.Primary>
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
