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
import { CircleX, Save, UserRoundPlus } from "lucide-react";
import { Calendar } from "primereact/calendar";

// import { AVALIABLE_EXAMES } from "../avaliablesExames";
import { Checkbox } from "primereact/checkbox";
import { View } from "@/components/view";
import { AVALIABLE_EXAMES } from "./avaliablesExames";
import { CheckBoxExam } from "./components/CheckBoxExam";
// import CheckBoxExam from "./components/CheckBoxExam";

interface INew {}

const genders = [
  { id: 1, value: "Masculino" },
  { id: 2, value: "Feminino" },
];

const schemaSchedule = z.object({
  patient_id: z.string().regex(/^\d{9}[A-Z]{2}\d{3}$/, {
    message: "Número de Bilhete de Identidade inválido",
  }),

  patient_name: z
    .string({ required_error: "Campo de 'nome' obrigatorio" })
    .min(5, "O nome deve ter pelo menos mais de 5 caracter")
    .regex(/^[a-zA-ZÀ-ú\s]+$/, "Apenas é permitido Letras no Nome"),

  patient_phone: z
    .string()
    .regex(/^[0-9]*$/, "Só é permitido números para o campo de Nº de Telemóvel")
    .length(9, "Você precisa ter nove (9) digitos no Nº de Telemóvel"),

  patient_birth_day: z
    .date({
      required_error: "Data de nascimento é obrigatório",
      invalid_type_error: "Data de nascimento é obrigatório",
    })
    .max(new Date(), "A data nascimento não pode ser superior ao dia de hoje."),
  patient_gender: z.enum(["Masculino", "Feminino"], {
    errorMap: () => ({ message: "Apenas é permitido Masculino ou Feminino" }),
  }),
});

export type SchemaScheduleType = z.infer<typeof schemaSchedule>;

export default function New({}: INew) {
  const [windowDialog, setWindowDialog] = useState(false);
  const [messageDialog, setMessageDialog] = useState(false);

  async function onSubmitFn(data: FormData) {
    const patient_id = data.get("identity") as string;
    const patient_phone = data.get("phone_number") as string;
    const patient_birth_day = new Date(data.get("birth_day") as string);
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

    const isToCreateSchedule = patient_schedule_date && patient_schedule_time;

    const validatedData = schemaSchedule.safeParse({
      patient_id,
      patient_phone,
      patient_birth_day,
      patient_name,
      patient_gender,
    });
    if (!validatedData.success) {
      console.log(patient_birth_day);

      const errorMessages = validatedData.error.errors.map((error) => error.message);
      //TODO
      // toast.error(errorMessages.join('\n'), {
      //   position: "top-right",
      //   autoClose: 5000,
      //   hideProgressBar: false,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      //   progress: undefined,
      // });

      // console.log("Errors:", errorMessages);
      // return;
    }

    if (isToCreateSchedule) {
      const errorsErrors: string[] = [];

      patient_newSelectedValue.length == 0 && errorsErrors.push("Selecione pelo menos um exame");

      const todayDate = new Date().toLocaleDateString();
      const todayTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

      const patient_date_to_local_date = new Date(patient_schedule_date).toLocaleDateString();
      const patient_date_to_local_time = new Date("2000-01-01 " + patient_schedule_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

      const patientScheduleDateIsBellowOfTodayData = patient_date_to_local_date < todayDate;
      const patientScheduleTimeIsBellowOfTodayData = patient_date_to_local_date == todayDate && patient_date_to_local_time < todayTime;

      patientScheduleDateIsBellowOfTodayData && errorsErrors.push("A data de agendamento não pode ser inferior a data de hoje");
      patientScheduleTimeIsBellowOfTodayData && errorsErrors.push("Agendamentos do dia presente não podem ter hora e minuto inferior ao momento presente. No momento são " + todayTime + ", e a data selecionada é " + patient_date_to_local_time);

      console.log("Errors:", errorsErrors);
      
      return
    }

    // console.log(validatedData);

    // try {
    //   console.log("Validation successful:", validatedData);
    // } catch (error) {
    //   if (error instanceof z.ZodError) {
    //     console.error("Validation failed:", error.errors);
    //   }
    // }

    // if(patient_schedule_date < new Date().toISOString().split("T")[0]) {
    // alert("A data de agendamento não pode ser inferior a data de hoje");
    // return;
    // }
    // if(patient_schedule_date === new Date().toISOString().split("T")[0] && patient_schedule_time < new Date().toISOString().split("T")[1]) {
    // alert("A data de agendamento não pode ser inferior a data de hoje");
    // return;
    // }
    // if(patient_schedule_date === new Date().toISOString().split("T")[0] && patient_schedule_time === new Date().toISOString().split("T")[1]) {
    // alert("A data de agendamento não pode ser inferior a data de hoje");
    // return;
    // }
    //

    //Exames de data de ontem são invalido
    //Validar se a data for de hoje então o exame deve ser de pelo menos 1H a frente

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

    // setMessageDialog(true);
    // console.log("🚀 ~ onSubmitFn ~ patient_data:", patient_data);
    console.log("🚀");
  }

  return (
    <div className=" h-screen px-4  ">
      <h1 className="font-light text-3xl my-6">Novo Agendamento</h1>
      <div className=" ">
        <form action={onSubmitFn} className="flex w-full gap-x-3 ">
          <div className="flex flex-col flex-1 gap-5 ">
            <div className="flex flex-col gap-3 ">
              <div className="flex flex-col gap-y-4 *:flex *:gap-x-2">
                <div className="flex border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0">
                  <AutoComplete placeholder="Nome completo do paciente" name="name" className="border-0 ring-0  flex-1" />
                  <div className="text-gray-400 hover:bg-akin-yellow-light transition ease-out  cursor-pointer p-3 hover:text-gray-800 rounded-lg h-fit" onClick={() => setWindowDialog(true)}>
                    <UserRoundPlus />
                  </div>
                </div>
                <div className=" *:flex-1">
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
          </div>

          <div className="  h-[29rem] w-[15rem] flex flex-col border-2 border-akin-yellow-light  rounded-lg bg-akin-yellow-light/20 ">
            <div className="space-y-4 flex-1 p-2  ">
              <div className="space-y-2 model p-4  h-[24rem]">
                <h1 className="font-bold text-xl -mx-4">Exames Disponíveis</h1>
                <View.Scroll className="max-h-full overflow-y-auto space-y-2">
                  {AVALIABLE_EXAMES.map((exame, index) => (
                    <CheckBoxExam key={index} description={exame.nome} value={String(exame.id)} />
                  ))}
                </View.Scroll>
              </div>
            </div>

            <Button.Primary className="m-2" type="submit" label="Agendar" />
          </div>
        </form>
      </div>

      <DialogWindow.Window modalTitle="Confirmação" visible={windowDialog} setVisible={setWindowDialog}>
        <form action={onSubmitFn} className="flex flex-col gap-y-4 *:flex *:gap-x-2">
          <Input.InputText placeholder="Nome do Paciente" name="name" />
          <div className=" *:flex-1">
            <Input.CalenderDate noUseLabel placeholder="Data de Nascimento" maxDate={new Date()} name="birth_day" />
            <Input.Dropdown data={genders} name="gender" placeholder="Selecione o sexo" />
          </div>

          <Input.InputText placeholder="Contacto telefónico" name="phone_number" type="number" />
          <Input.InputText placeholder="Bilhete de Identidade" maxLength={14} name="identity" />

          <div className="space-x-2 flex justify-end mt-4">
            <Button.Primary icon={<Save />} type="submit" className="bg-green-700">
              Registar
            </Button.Primary>
            <Button.Primary icon={<CircleX />} onClick={() => setWindowDialog(false)} className="bg-red-700">
              Cancelar
            </Button.Primary>
          </div>
        </form>
      </DialogWindow.Window>

      <DialogWindow.Message type="Sucesso" visible={messageDialog} setVisible={setMessageDialog} />
      {/* <DialogWindow.Message type="Sucesso" visible={messageDialog} setVisible={setMessageDialog} /> */}
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
