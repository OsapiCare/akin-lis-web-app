"use client";

import Primary from "@/components/button/primary";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "primereact/checkbox";
import CheckBoxExam from "./CheckBoxExam";
import { useState } from "react";
import CheckBoxExamFirst from "./SelectExamFirst";
import CheckBoxSecond from "./SelectExamSecond";
import clsx from "clsx";
import SelectExamFirst from "./SelectExamFirst";
import { AppLayout } from "@/components/layout";
import { View } from "@/components/view";

export default function ExameForm() {
  const [step, setStep] = useState(1);
  function handleClickNextStep() {
    setStep((state) => (state < 2 ? state + 1 : state - 1));
  }
  return (
    <div className=" bg-[#fcfcfc] rounded-lg border p-2 border-akin-turquoise  flex flex-col gap-y-4">
      {step == 1 ? <SelectExamFirst /> : <CheckBoxSecond />}

      <div className="flex  bg-orange-300 ">
        <div className="flex justify-between items-center">
          <div className="flex items-center *:border-akin-turquoise font-bold *:flex *:justify-center *:items-center">
            <div className="size-10 border rounded-full bg-akin-turquoise text-white">1</div>
            <div className={clsx("h-1 w-10 border-y", step == 2 && "bg-akin-turquoise")}></div>
            <div className={clsx("size-10 border rounded-full", step == 2 && "bg-akin-turquoise text-white")}>2</div>
          </div>
        </div>

        <Primary className="*:flex " onClick={handleClickNextStep}>
          {step == 1 ? (
            <span>
              Próximo
              <ChevronRight />
            </span>
          ) : (
            <span>
              <ChevronLeft />
              Voltar
            </span>
          )}
        </Primary>
      </div>
    </div>
  );
}
