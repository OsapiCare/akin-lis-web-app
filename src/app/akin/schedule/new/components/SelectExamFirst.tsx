import { useState } from "react";
import { AVALIABLE_EXAMES } from "../avaliablesExames";
import { Checkbox } from "primereact/checkbox";
import { View } from "@/components/view";

export default function SelectExamFirst() {
  return (
    // <div className="flex flex-col space-y-2 p-4  h-full">
    <div className="space-y-2 model p-4  h-[24rem]">
      <h1 className="font-bold text-xl -mx-4">Exames Disponíveis</h1>
      <View.Scroll className="max-h-full overflow-y-auto space-y-2">
        {AVALIABLE_EXAMES.map((exame, index) => (
          <CheckBoxExam key={index} checked={false} description={exame.nome} value={String(exame.id)} onChangecheck={() => alert("")} />
        ))}
      </View.Scroll>
    </div>
  );
}
/////////////////////////////
interface ICheckboxExam {
  description: string;
  checked: boolean;
  value: string;
  onChangecheck: (e: any) => void;
}

export function CheckBoxExam({ description, checked, value, onChangecheck }: ICheckboxExam) {
  const [isChecked, setIsChecked] = useState(false);
  function onChange() {
    setIsChecked((state) => !state);
  }
  return (
    <div className="flex gap-x-2 mb-2 items-center">
      <Checkbox className="border border-akin-yellow-light rounded-lg  " checked={isChecked} onChange={onChange} value={value} inputId={value}></Checkbox>
      <label htmlFor={value} className="">
        {description}
      </label>
    </div>
  );
}
