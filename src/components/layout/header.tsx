import { APP_CONFIG } from "@/config/app";
import Image from "next/image";
import Link from "next/link";

interface IHeader {
  avatar: string;
  name: string;
  email: string;
}
export default function Header({ avatar, name, email }: IHeader) {
  return (
    <header className="h-14 shadow border pl-4 rounded-lg  text-akin-white-smoke font-bold text-xl bg-akin-turquoise flex justify-between items-center">
      <strong>BEM-VINDO AO {APP_CONFIG.APP_NAME}</strong>

      {/* <Link href={APP_CONFIG.ROUTES.ALTERNATIVE.PROFILE.path} className="flex gap-x-1.5 cursor-pointer hover:bg-akin-yellow-light/10 px-2 py-1 rounded-lg group transition ease-in-out "> */}
        {/* <div className="size-14 group-hover:bg-akin-yellow-light rounded-full border border-dashed"> */}
          {/* <Image className="rounded-full" src={avatar} alt="avatar" width={150} height={150} /> */}
        {/* </div> */}
{/*  */}
        {/* <div className="flex flex-col"> */}
          {/* <p>{name}</p> */}
          {/* <span className="text-sm font-normal">{email}</span> */}
        {/* </div> */}
      {/* </Link> */}
    </header>
  );
}
