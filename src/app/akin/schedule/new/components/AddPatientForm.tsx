// "use client";

// import { Input } from "@/components/input";
// // import { Dropdown } from "primereact/dropdown";
// // import { useState } from "react";
// // import { useFormContext } from "react-hook-form";
// // import { schemaScheduleType } from "../page";
// // import Primary from "@/components/button/primary";
// // import { Dialog } from "primereact/dialog";
// import { CircleCheckBig, UserRoundPlus } from "lucide-react";
// // import { DialogWindow } from "@/components/dialog";
// import AutoComplete from "@/components/auto-complete";





// interface Props {
//     showAddPatientFormButton?: boolean;
//     onClick?: () => void;
//   }
  
//   export function AddPatientForm({ showAddPatientFormButton, onClick }: Props) {
//     // const genders = [
//     //   { id: 1, name: "Masculino", code: "1" },
//     //   { id: 2, name: "Femenino", code: "2" },
//     // ];
  
//     // function onChangeGender(data: { value: any }) {
//     //   setSelectedseletGender(data.value);
//     // }
  
//     // const [seletGender, setSelectedseletGender] = useState<any>(null);
  
//     return (
//       // <div className="flex justify-center gap-x-2" title="Adicionar Paciente">
//       <div className="flex flex-col gap-y-4 *:flex *:gap-x-2">
//         <div className="flex border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0">
//           {!showAddPatientFormButton ? <Input.InputText className="flex-1 border-0 ring-0" /> : <AutoComplete placeholder="Nome completo do paciente" className="border-0 ring-0  flex-1" />}
  
//           {showAddPatientFormButton && (
//             <div className="text-gray-400 hover:bg-akin-yellow-light transition ease-out  cursor-pointer p-3 hover:text-gray-800 rounded-lg h-fit" onClick={onClick}>
//               <UserRoundPlus />
//             </div>
//           )}
//         </div>
//         <div className=" *:flex-1">
//           <Input.InputText type="number" placeholder="Data de Nascimento" />
//           <Input.Dropdown data={[]} />
//         </div>
  
//         <div className="">
//           <Input.InputText className="flex-1" placeholder="Contacto telefónico" />
//         </div>
//         <div>
//           <Input.InputText className="" placeholder="Bilhete de Identidade" maxLength={14}  />
//         </div>
//       </div>
  
//     );
//   }
  