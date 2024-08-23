import { Input } from "@/components/input";
import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { schemmaScheduleCreateType } from "../page";
import { Button } from "primereact/button";
import Primary from "@/components/button/primary";
import { Dialog } from "primereact/dialog";
import { CircleCheckBig } from "lucide-react";

export default function PatientFormSave() {
    const useForm = useFormContext<schemmaScheduleCreateType>()
    const genders = [
        { name: 'Masculino', code: '1' },
        { name: 'Femenino', code: '2' },
    ];
    function onChangeGender(data: {value:any}) {
        setSelectedseletGender(data.value)
    }
    const [seletGender, setSelectedseletGender] = useState<any>(null);
    const [visible, setVisible] = useState(false);

    return (
        <div className="flex flex-col flex-1 gap-5">
            <div className="flex gap-2">
                <Input.InputText className="flex-1" placeholder="Nome completo do paciente"/>
                <Input.InputText className="w-40" type="number" placeholder="Idade"/>
            </div>
            <div className="flex gap-2">
                <Dropdown className="border-2 border-akin-yellow-light p-3 rounded-lg bg-akin-yellow-light/20 ring-0" value={seletGender} options={genders} onChange={onChangeGender} optionLabel="name" placeholder="Selecione o sexo" />
                <Input.InputText className="flex-1" placeholder="Contacto telefónico"/>
            </div>
            <div>
                <Input.InputText className="w-full" placeholder="Email"/>
            </div>
            <div className="flex gap-2 mt-4">
                <Primary  onClick={() => setVisible(true)} className="bg-green-800">Guardar dados</Primary>
                <Primary className="bg-yellow-600">Voltar a editar</Primary>
                <Saved title="Agendamento" visible={visible} setVisible={setVisible}/>
            </div>
        </div>
    )
}
 
//separar depois
function Saved({visible,setVisible,title} : {visible:boolean, setVisible:(state:boolean)=>void,title:string}) {
    return (
        <Dialog header="" visible={visible} style={{ width: '30vw' }} onHide={() => {if (!visible) return; setVisible(false); }}>
            <div className="flex flex-col items-center justify-center gap-3">
                    <h1 className="text-3xl font-extrabold">{title}</h1>
                    <CircleCheckBig className="text-green-700" size={100} />
                <p className="m-0">
                    concluido com sucesso
                </p>
            </div>
    </Dialog>
    )
}