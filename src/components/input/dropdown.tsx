"use client";

import { Dropdown as PrimeDropdown } from "primereact/dropdown";
import { useState } from "react";

interface IDropdown {
  data: any,

}

export default function Dropdown({}:IDropdown) {

  // { id: 1, name: "Masculino", code: "1" },
    const genders = [
        { id: 1, name: "Masculino", code: "1" },
        { id: 2, name: "Femenino", code: "2" },
      ];
    
      function onChangeGender(data: { value: any }) {
        setSelectedseletGender(data.value);
      }
    
      const [seletGender, setSelectedseletGender] = useState<any>(null);
      
    return (
        <PrimeDropdown 
        className="border-2 border-akin-yellow-light  rounded-lg bg-akin-yellow-light/20 ring-0" 
        value={seletGender} 
        options={genders} 
        onChange={onChangeGender} 
        optionLabel="name" 
        placeholder="Selecione o sexo"
        />
    );
}