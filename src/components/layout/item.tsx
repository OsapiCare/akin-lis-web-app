import { APP_CONFIG } from "@/config/app";
import Link from "next/link";

type IItem = {
  item: (typeof APP_CONFIG.ROUTES.MENU)[number];
  activeSegment: string;
};

export default function Item({ item, activeSegment }: IItem) {
  const thisPaht = item.path.split("/akin/")[1];
  const isActive = thisPaht === activeSegment;
  const isLogout = item.path === "/logout";
  return (
    <li>
      <Link
        href={item.path}
        data-isActive={isActive}
        data-isLogout={isLogout}
        className="flex items-center gap-x-2 font-bold data-[isLogout=true]:hover:text-[#ff5e5e] data-[isLogout=true]:hover:bg-[#ffeeed]/70 data-[isActive=true]:bg-akin-yellow-light/20  hover:bg-akin-yellow-light/20 rounded-lg p-2 transition ease-out group"
      >
        <item.icon size={25} data-isLogout={isLogout} className={`${isActive ? "bg-sky-400" : "bg-akin-yellow-light/40"} p-1 rounded-lg group-hover:bg-sky-400 group-hover:text-akin-white-smoke transition ease-in-out group-hover:data-[isLogout=true]:bg-[#ff5e5e] `} />
        <span>{item.label}</span>
      </Link>
    </li>
  );
}
// 4fd6ff
