import Primary from "@/components/button/primary";
import { ArrowRight } from "lucide-react";
import { Checkbox } from "primereact/checkbox";
import CheckBoxExam from "./CheckBoxExam";
import { useState } from "react";
import CheckBoxExamFirst from "./SelectExamFirst";
import CheckBoxSecond from "./SelectExamSecond";
import clsx from "clsx";

export default function ExameForm() {
  const [step, setStep] = useState(1);
  function handleClickNextStep() {
    setStep((state) => (state < 2 ? state + 1 : state - 1));
  }
  return (
    <div className="min-w-96 bg-slate-200 rounded-lg  p-4 flex flex-col gap-2">
      {step == 1 ? <CheckBoxExamFirst /> : <CheckBoxSecond />}
      <div className="mt-8 flex justify-between items-center">
        <div className="flex items-center *:border-akin-turquoise font-bold *:flex *:justify-center *:items-center">
          <div className="size-10 border rounded-full bg-akin-turquoise text-white">1</div>
          <div className={clsx("h-1 w-10 border-y", step == 2 && "bg-akin-turquoise")}></div>
          <div className={clsx("size-10 border rounded-full", step == 2 && "bg-akin-turquoise text-white")}>2</div>
        </div>

        <Primary className="flex gap-3" onClick={handleClickNextStep}>
          {step == 1 ? "Proximo" : "Voltar"}
        </Primary>
      </div>
    </div>
  );
}
