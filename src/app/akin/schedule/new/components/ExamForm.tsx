"use client";

import Primary from "@/components/button/primary";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";
import CheckBoxExamFirst from "./SelectExamFirst";
import CheckBoxSecond from "./SelectExamSecond";
import clsx from "clsx";
import SelectExamFirst from "./SelectExamFirst";
import { AppLayout } from "@/components/layout";
import { View } from "@/components/view";
import { Button } from "@/components/button";
import { DialogWindow } from "@/components/dialog";

export default function ExameForm() {
  const [step, setStep] = useState(1);
  function handleClickNextStep() {
    setStep((state) => (state < 2 ? state + 1 : state - 1));
  }

  const [messageDialog, setMessageDialog] = useState(false);

  return (
    <div className="  h-[29rem] w-[15rem] flex flex-col border-2 border-akin-yellow-light  rounded-lg bg-akin-yellow-light/20 ">
      <div className="space-y-4 flex-1 p-2  ">{step == 1 ? <SelectExamFirst /> : <CheckBoxSecond />}</div>

      {/* {step == 2 && <Button.Primary className="m-2" onClick={() => setMessageDialog(true)} label="Agendar" />} */}
      {step == 2 && <Button.Primary className="m-2" type="submit" label="Agendar" />}
      <Button.Primary className="m-2" onClick={handleClickNextStep} label={step == 1 ? "Próximo" : "Voltar"} />
      <DialogWindow.Message type="Sucesso" visible={messageDialog} setVisible={setMessageDialog} />
    </div>
  );
}
