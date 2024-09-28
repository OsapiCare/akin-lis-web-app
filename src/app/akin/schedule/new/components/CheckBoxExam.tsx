"use client";

import { Checkbox } from "primereact/checkbox";
import { useState } from "react";

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
