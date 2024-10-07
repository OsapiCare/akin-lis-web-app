"use client";

import { Dropdown as PrimeDropdown, DropdownProps } from "primereact/dropdown";
import { useState } from "react";

interface IDropdown extends DropdownProps {
  data: { id: number; value: string }[];
}

export default function Dropdown({ data, ...rest }: IDropdown) {
  const [selectedGender, setSelectedGender] = useState<any>(null);

  function onChangeGender(data: { value: string }) {
    console.log(data.value);
    setSelectedGender(data.value);
  }

  return <PrimeDropdown className="border-2 border-akin-yellow-light  rounded-lg bg-akin-yellow-light/20 ring-0" value={selectedGender} options={data} onChange={onChangeGender} optionLabel="value" {...rest} />;
}
