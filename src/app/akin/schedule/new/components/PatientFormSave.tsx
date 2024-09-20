import { Input } from "@/components/input";
import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { schemmaScheduleCreateType } from "../page";
import Primary from "@/components/button/primary";
import { Dialog } from "primereact/dialog";
import { CircleCheckBig, UserRoundPlus } from "lucide-react";
import { DialogWindow } from "@/components/dialog";

export default function PatientFormSave() {
  const useForm = useFormContext<schemmaScheduleCreateType>();

  const [messageDialog, setMessageDialog] = useState(false);
  const [windowDialog, setWindowDialog] = useState(false);

  return (
    <div className="flex flex-col flex-1 gap-5">
      <AddPatientForm showAddPatientFormButton onClick={() => setWindowDialog(true)} />

      <div className="flex gap-2 mt-4">
        <Primary onClick={() => setMessageDialog(true)} className="bg-green-800">
          Guardar
        </Primary>
        <Primary onClick={() => setWindowDialog(true)} className="bg-green-800">
          Adicionar
        </Primary>
        {/* <Primary className="bg-yellow-600">Voltar a editar</Primary> */}

        <DialogWindow.Message type="Erro" visible={messageDialog} setVisible={setMessageDialog} />

        <DialogWindow.Window modalTitle="Confirmação" visible={windowDialog} setVisible={setWindowDialog} >
          <div className="flex flex-col gap-3 w-[40rem] bg-blue-700">
            <AddPatientForm />
            <div className="space-x-2 flex justify-end mt-4">
              <Primary onClick={() => setMessageDialog(true)} className="bg-green-700">
                Guardar
              </Primary>
              <Primary onClick={() => setWindowDialog(false)} className="bg-red-700">
                Cancelar
              </Primary>
            </div>
          </div>
        </DialogWindow.Window>
      </div>
    </div>
  );
}

///

interface Props {
  showAddPatientFormButton?: boolean;
  onClick?: () => void;
}

function AddPatientForm({ showAddPatientFormButton, onClick }: Props) {
  const genders = [
    { id: 1, name: "Masculino", code: "1" },
    { id: 2, name: "Femenino", code: "2" },
  ];

  function onChangeGender(data: { value: any }) {
    setSelectedseletGender(data.value);
  }

  const [seletGender, setSelectedseletGender] = useState<any>(null);

  return (
    <div className="flex flex-col flex-1 gap-5 *:flex *:gap-x-2">
      <div className=" items-center justify-center ">
        <Input.InputText className="flex-1" placeholder="Nome completo do paciente" />
        {showAddPatientFormButton && (
          <div className="text-gray-400 hover:bg-akin-yellow-light transition ease-out  cursor-pointer p-3 hover:text-gray-800 rounded-lg" onClick={onClick}>
            <UserRoundPlus />
          </div>
        )}
      </div>

      <div className=" *:flex-1">
        <Input.InputText type="number" placeholder="Idade" />
        <Dropdown className="border-2 border-akin-yellow-light p-3 rounded-lg bg-akin-yellow-light/20 ring-0" value={seletGender} options={genders} onChange={onChangeGender} optionLabel="name" placeholder="Selecione o sexo" />
      </div>

      <div className="">
        <Input.InputText className="flex-1" placeholder="Contacto telefónico" />
      </div>

      <div>
        <Input.InputText className="w-full" placeholder="Email" />
      </div>
    </div>
  );

  {
    /* <p>"numero_identificacao": "00503011la043",</p>
      <p>"nome": "mauro carlos",</p>
      <p>"data_nascimento": "1999-01-01t00:00:00z",</p>
      <p>"contacto_telefonico": "934251456",</p>
      <p>"id_sexo": 1,</p>
      <p>"id_usuario": "cm16g9k2n0002kkujkrv89sxf"</p> */
  }
}
