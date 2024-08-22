import Avatar from "@/components/avatar";
import { Button } from "@/components/button";
import { AppLayout } from "@/components/layout";
import { View } from "@/components/view";
import { MOCK_LOGGED_USER } from "@/mocks/logged-user";
import { Settings } from "lucide-react";
interface IProfile {}

interface IPatientResumeInfo {
  name: string;
  avatar: string;
  role: string;
  phoneNumber: string;
  email: string;
}

export default function Profile({}: IProfile) {
  const user: IPatientResumeInfo = {
    avatar: MOCK_LOGGED_USER.avatar,
    name: MOCK_LOGGED_USER.fullName,
    role: MOCK_LOGGED_USER.role,
    phoneNumber: MOCK_LOGGED_USER.phoneNumber,
    email: MOCK_LOGGED_USER.email,
  };

  return (
    <View.Vertical>
      <AppLayout.ContainerHeader label="Perfil do Usuário" />
      <div className="bg-akin-turquoise/5 p-6  rounded-lg ">
        <div className="flex gap-x-6 ">
          <Avatar userName={user.phoneNumber} image={user.avatar} className="size-36 border border-akin-turquoise" />
          <div className="space-y-4">
            <div>
              <p className="font-bold text-akin-turquoise text-xl">{user.name}</p>
              <p className="text-akin-turquoise text-sm">{user.role}</p>
            </div>
            <div className="flex flex-col *:bg-transparent *:w-fit ">
              <input value={user.phoneNumber} className="" />
              <input value={user.email} />
              <input value={"*********"} />
            </div>
          </div>
        </div>
      </div>
    </View.Vertical>
  );
}

// function PatientResumeInfo({ name, avatar, email, phoneNumber, role }: IPatientResumeInfo) {
//   return (
//     <div className="flex gap-x-6 ">
//       <Avatar userName={name} image={avatar} className="size-36 border border-akin-turquoise" />
//       <div className="space-y-4">
//         <div>
//             <p className="font-bold text-akin-turquoise text-xl">{name}</p>
//             <p className="text-akin-turquoise text-sm">{role}</p>
//         </div>
//         <div className="flex flex-col *:bg-transparent *:w-fit ">
//           <input value={phoneNumber} className=""/>
//           <input value={email} />
//           <input value={"*********"} />
//         </div>
//       </div>
//     </div>
//   );
// }
