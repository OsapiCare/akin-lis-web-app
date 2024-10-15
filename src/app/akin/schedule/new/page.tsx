"use client";

import { FormProvider, set, useForm } from "react-hook-form";
// import PatientFormSave from "./components/PatientFormSave";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { DialogWindow } from "@/components/dialog";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import AutoComplete from "@/components/auto-complete";
import { CircleX, LoaderCircle, Save, UserRoundPlus } from "lucide-react";
import { Calendar } from "primereact/calendar";

import { Checkbox } from "primereact/checkbox";
import { View } from "@/components/view";
import { CheckBoxExam } from "./components/CheckBoxExam";
import { ___showErrorToastNotification, ___showSuccessToastNotification } from "@/lib/sonner";
import { ___api } from "@/lib/axios";
import { ProgressSpinner } from "primereact/progressspinner";
// import CheckBoxExam from "./components/CheckBoxExam";

interface INew {}

//TODO generos precisam vir do back-end e depois listados no campo de genero
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avaliableExams, setAvaliableExams] = useState<AvaliableExamsType[]>([]);
  const [availablePatients, setAvailablePatients] = useState<PatientType[]>([]);
  const [availablePatientsAutoComplete, setAvailablePatientsAutoComplete] = useState<{ value: string; id: string }[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<PatientType>();
  //TODO Get user on localSorage
  const [loggedUser, setLoggedUser] = useState({ id: "cm27g9oa00001lg20jnnzb0wr", name: "João Silva", id_unidade_de_saude: 1 });

  useEffect(() => {
    ___api
      .get("pacients")
      .then((res) => {
        const pacients = res.data.map((pacient: PatientType) => {
          return {
            value: pacient.nome,
            id: pacient.id,
          };
        });
        setAvailablePatientsAutoComplete(pacients);
        setAvailablePatients(res.data);
      })
      .finally(() => {
        ___api
          .get("/exam-types")
          .then((res) => {
            setAvaliableExams(res.data.data);
            setIsLoading(false);
            ___showSuccessToastNotification({ message: "Dados obtidos com sucesso!" });
          })
          .catch((e) => {
            ___showErrorToastNotification({ message: "Erro inesperado ocorreu ao buscar os dados" });
          });
      });
  }, []);

  useEffect(() => {
    if (selectedItemId) {
      const patientFinded = availablePatients.find((patient) => patient.id === selectedItemId);

      // console.log("BOMMM ", patientFinded);
      setSelectedPatient(patientFinded);
    }
  }, [selectedItemId]);

  async function onSubmitFn(data: FormData) {
    const patient_id = data.get("identity") as string;
    const patient_phone = data.get("phone_number") as string;
    const patient_birth_day = new Date(data.get("birth_day") as string).toLocaleDateString("en-CA");
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
        id: Number(id),
        // exame,
      };
    });

    const isToCreateSchedule = patient_schedule_date && patient_schedule_time;

    const validatedData = schemaSchedule.safeParse({
      patient_id,
      patient_phone,
      patient_birth_day: new Date(patient_birth_day),
      patient_name,
      patient_gender,
    });

    if (!validatedData.success) {
      const errosMessages = validatedData.error.errors.map((error) => error.message);
      ___showErrorToastNotification({ messages: errosMessages });
      return;
    }

    const patient_gender_id = genders.find((gender) => gender.value === (data.get("gender") as string))!.id;

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

      if (errorsErrors.length > 0) {
        ___showErrorToastNotification({ messages: errorsErrors });
        return;
      }

      const patient_data = {
        id_paciente: selectedPatient!.id,
        id_unidade_de_saude: loggedUser.id_unidade_de_saude,
        data_agendamento: patient_schedule_date.replace(/\//g, "-"),
        hora_agendamento: patient_schedule_time,
        exames_paciente: patient_newSelectedValue,
      };

      // console.log(patient_data);
      // return;

      setIsSaving(true);
      ___api
        .post("/schedulings/set-schedule", patient_data)
        .then((res) => {
          if (res.status == 201) {
            ___showSuccessToastNotification({ message: "Agendamento marcado com sucesso" });
            setSelectedPatient(undefined);
            setWindowDialog(false);
          } else {
            ___showErrorToastNotification({ message: "Erro ao marcar Agendamento.\nTente novamente, mas se o erro persistir, entre em contato com o suporte." });
          }
        })
        .catch((err) => {
          ___showErrorToastNotification({ message: "Erro ao marcar Agendamento... Tente novamente, mas se o erro persistir, entre em contato com o suporte." });

          console.log("🚀 ~ file: page.tsx:207 ~ .then ~ err:", err);
        })
        .finally(() => setIsSaving(false));
      return;
    }

    const patient_data = {
      numero_identificacao: patient_id,
      nome: patient_name,
      data_nascimento: patient_birth_day,
      contacto_telefonico: patient_phone,
      id_sexo: patient_gender_id,
      id_usuario: loggedUser.id,
    };

    // console.log(patient_data);

    setIsSaving(true);
    ___api
    .post("/pacients", patient_data)
    .then((res) => {
      if (res.status == 201) {
          setMessageDialog(true)
          // ___showSuccessToastNotification({ message: "Paciente cadastrado com sucesso" });
          
        } else {
          ___showErrorToastNotification({ message: "Erro ao cadastrar paciente.\nTente novamente, mas se o erro persistir, entre em contato com o suporte." });
        }
      })
      .catch((err) => {
        ___showErrorToastNotification({ message: "Erro ao cadastrar paciente... Tente novamente, mas se o erro persistir, entre em contato com o suporte." });

        console.log("🚀 ~ file: page.tsx:207 ~ .then ~ err:", err);
      })
      .finally(() => setIsSaving(false));
  }

  return (
    <div className=" h-screen px-4  ">
      <h1 className="font-light text-3xl my-6">Novo Agendamento</h1>
      <div className=" ">
        <form action={onSubmitFn} className="flex w-full gap-x-3 ">
          <div className="flex flex-col flex-1 gap-5 ">
            <div className="flex flex-col gap-3 ">
              <div className="flex flex-col gap-y-4 *:flex *:gap-x-2">
                {isLoading ? (
                  <p>
                    <LoaderCircle className="animate-spin" /> Carregando lista de pacientes...
                  </p>
                ) : (
                  <div className="flex border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0">
                    <AutoComplete placeholder="Nome completo do paciente" name="name" className="border-0 ring-0  flex-1" lookingFor="paciente" dataFromServer={availablePatientsAutoComplete} setSelectedItemId={setSelectedItemId} />

                    <div className="text-gray-400 hover:bg-akin-yellow-light transition ease-out  cursor-pointer p-3 hover:text-gray-800 rounded-lg h-fit" onClick={() => setWindowDialog(true)}>
                      <UserRoundPlus />
                    </div>
                  </div>
                )}
                <div className=" *:flex-1">
                  <Input.CalenderDate disabled noUseLabel placeholder="Data de Nascimento" maxDate={new Date()} name="birth_day" valueDate={selectedPatient?.data_nascimento ? new Date(selectedPatient.data_nascimento) : null} />

                  {/* <Input.CalenderDate noUseLabel placeholder="Data de Nascimento" maxDate={new Date()} name="birth_day" value={selectedPatient?.data_nascimento ? new Date(selectedPatient?.data_nascimento) : null} /> */}

                  <Input.Dropdown disabled data={genders} name="gender" placeholder="Selecione o sexo" valueData={selectedPatient?.sexo.nome} />
                </div>

                <Input.InputText maxLength={0} placeholder="Contacto telefónico" name="phone_number" value={selectedPatient?.contacto_telefonico} />
                <Input.InputText maxLength={0} placeholder="Bilhete de Identidade" name="identity" value={selectedPatient?.numero_identificacao} />
              </div>
            </div>
            <div className="">
              <h2 className="font-bold">Data do Agendamento</h2>
              <hr />
              <div className="flex gap-2 mt-4 *:flex-1">
                <Input.CalenderDate valueDate={new Date()} minDate={new Date()} name="schedule_date" />
                <Input.CalenderTime name="schedule_time" />
              </div>
            </div>
          </div>

          <div className="  h-[29rem] w-[15rem] flex flex-col border-2 border-akin-yellow-light  rounded-lg bg-akin-yellow-light/20 ">
            <div className="space-y-4 flex-1 p-2  ">
              <div className="space-y-2 model p-4  h-[24rem]">
                <h1 className="font-bold text-xl -mx-4">Exames Disponíveis</h1>
                <View.Scroll className="max-h-full overflow-y-auto space-y-2 h-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <ProgressSpinner style={{ width: "25px", height: "25px" }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                    </div>
                  ) : (
                    <>
                      {avaliableExams.length == 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-400">Não há exames disponíveis</p>
                        </div>
                      ) : (
                        <>
                          {avaliableExams.map((exame, index) => (
                            <CheckBoxExam key={index} description={exame.nome} value={String(exame.id)} />
                          ))}
                        </>
                      )}
                    </>
                  )}
                </View.Scroll>
              </div>
            </div>

            <Button.Primary className="m-2" type="submit" label={isSaving ? "Marcando..." : "Agendar"} disabled={isSaving} />
          </div>
        </form>
      </div>

      <DialogWindow.Window modalTitle="Confirmação" visible={windowDialog} setVisible={setWindowDialog}>
        <form action={onSubmitFn} className="flex flex-col gap-y-4 *:flex *:gap-x-2">
          <Input.InputText placeholder="Nome do Paciente" name="name" />
          <div className=" *:flex-1">
            <Input.CalenderDate noUseLabel placeholder="Data de Nascimento" maxDate={new Date()} name="birth_day" valueDate={null} />
            <Input.Dropdown data={genders} name="gender" placeholder="Selecione o sexo" />
          </div>

          <Input.InputText placeholder="Contacto telefónico" name="phone_number" type="number" />
          <Input.InputText placeholder="Bilhete de Identidade" maxLength={14} name="identity" />

          <div className="space-x-2 flex justify-end mt-4">
            <Button.Primary icon={<Save />} type="submit" className="bg-green-700" label={isSaving ? "Salvando..." : "Salvar"} disabled={isSaving} />
            {/* <Button.Primary icon={<CircleX />} onClick={() => setWindowDialog(false)} className="bg-red-700">
              Cancelar
            </Button.Primary> */}
          </div>
        </form>
      </DialogWindow.Window>

      <DialogWindow.Message actionFn={()=> window.location.reload() } type="Sucesso" visible={messageDialog} setVisible={setMessageDialog}  />
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
