"use client";

import { Checkbox } from "primereact/checkbox";
import { useState } from "react";

/////////////////////////////
interface ICheckboxExam {
  description: string;
  value: string;
}

export function CheckBoxExam({ description, value }: ICheckboxExam) {
  const [isChecked, setIsChecked] = useState(false);

  function onChange() {
    setIsChecked((state) => !state);
  }
  return (
    <div className="flex gap-x-2 mb-2 items-center ">
      {/* <Checkbox className="border border-akin-yellow-light rounded-lg" checked={isChecked} onChange={onChange} value={description} name="opc_checkbox" inputId={value} data-description={description}>
        <span hidden>{description}</span>
      </Checkbox> */}

      <label htmlFor={value} className="flex gap-x-2">
        {/* <input type="checkbox" className="w-fit" name="opc_checkbox" value={description} id={value} /> */}
        <input type="checkbox" className="w-fit" name="opc_checkbox" value={`${value}_${description}`} id={value} />
        {description}
      </label>
    </div>
  );
}
