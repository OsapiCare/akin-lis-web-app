import { APP_CONFIG } from "@/config/app";
import Link from "next/link";

type IMenuItem = {
  item: (typeof APP_CONFIG.DASHBOARD.MENU)[number];
};

export default function MenuItem({ item }: IMenuItem) {
  return (
    <li>
      <Link href={item.path} className="flex items-center gap-x-2 font-bold hover:bg-akin-yellow-light/20 rounded-lg p-2 transition ease-out">
        <item.icon size={25} className="bg-akin-yellow-light/40 p-1 rounded-lg " />
        <span>{item.label}</span>
      </Link>
    </li>
  );
}
