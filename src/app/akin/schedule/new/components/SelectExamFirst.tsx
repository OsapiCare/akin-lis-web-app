import React from "react";
import CheckBoxExam from "./CheckBoxExam";
import { AVALIABLE_EXAMES } from "../avaliablesExames";
import { View } from "@/components/view";
export default function SelectExamFirst() {
  return (
    // <div className="flex flex-col space-y-2 p-4  h-full">
    <div className="space-y-2 model p-4  h-full">
      <h1 className="font-bold text-xl">Exames Disponíveis</h1>
      {/* <hr /> */}
      <View.Scroll className="max-h-full overflow-y-auto space-y-2">
        {AVALIABLE_EXAMES.map((exame, index) => (
          <CheckBoxExam key={index} checked={false} description={exame.nome} value={String(exame.id)} onChangecheck={() => alert("")} />
        ))}
      </View.Scroll>
    </div>
  );
}
