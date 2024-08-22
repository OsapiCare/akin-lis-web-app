import { Input } from "@/components/input";
import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { schemmaScheduleCreateType } from "../page";
import { Button } from "primereact/button";
import Primary from "@/components/button/primary";

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
                <Primary className="bg-green-800">Guardar dados</Primary>
                <Primary className="bg-yellow-600">Voltar a editar</Primary>
            </div>
        </div>
    )
}