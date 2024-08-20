"use client";
import Image from "next/image";
import { useSelectedLayoutSegment } from "next/navigation";
import Item from "./item";
import { APP_CONFIG } from "@/config/app";

export default function Menu() {
  const activeSegment = useSelectedLayoutSegment() as string;

  return (
    <aside className="bg-akin-turquoise p-4 text-akin-white-smoke">
      <Image width={108} src={APP_CONFIG.LOGO_WHITE} alt="Akin logo" />
      <ul className="mt-10 space-y-1.5">
        {APP_CONFIG.ROUTES.MENU.map((item, index) => (
          <Item item={item} key={index} activeSegment={activeSegment} />
        ))}
      </ul>
    </aside>
  );
}
