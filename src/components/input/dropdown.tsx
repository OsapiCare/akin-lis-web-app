"use client";

import { Dropdown as PrimeDropdown, DropdownProps, DropdownChangeEvent } from "primereact/dropdown";
import { useState } from "react";

type DropdownDataType = { id: number; value: string };
interface IDropdown extends DropdownProps {
  data: DropdownDataType[];
  valueData?: string;
}

export default function Dropdown({ data, valueData, ...rest }: IDropdown) {
  const [selectedGender, setSelectedGender] = useState<DropdownDataType | null>(null);

  function onChangeGender(e: DropdownChangeEvent) {
    console.log(e.value);
    setSelectedGender(e.value);
  }

  return <PrimeDropdown className="border-2 border-akin-yellow-light  rounded-lg bg-akin-yellow-light/20 ring-0" value={valueData ? valueData : selectedGender} options={data} onChange={onChangeGender} optionLabel="value" {...rest} />;
}
