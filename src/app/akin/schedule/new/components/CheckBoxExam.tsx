import React, { useState } from "react";

import { Checkbox } from "primereact/checkbox";

interface ICheckboxExam{
    description: string,
    checked: boolean,
    value: string,
    onChangecheck: (e: any) => void
}


export default function CheckBoxExam({description, checked, value, onChangecheck}: ICheckboxExam) {
    const [isChecked, setIsChecked] = useState(false)
   function onChange() {
        setIsChecked((state) => !state)
    }
 return (
    <div className="flex gap-2 items-center">
        <Checkbox checked={isChecked} onChange={onChange} value={value} inputId={value}></Checkbox>
        <label htmlFor={value} className="">{description}</label>
    </div>
    )
}