import React from "react";
import CheckBoxExam from "./CheckBoxExam";
import { AVALIABLE_EXAMES } from "../avaliablesExames";
import { View } from "@/components/view";
export default function SelectExamFirst() {
  return (
    <div className="space-y-2 p-4">
      <h1 className="font-bold text-xl">Exames Disponíveis</h1>
      <View.Scroll className="max-h-96">
        {AVALIABLE_EXAMES.map((exame, index) => (
          <CheckBoxExam key={index} checked={false} description={exame.exame} value={String(exame.id)} onChangecheck={() => alert("")} />
        ))}
      </View.Scroll>
    </div>
  );
}
