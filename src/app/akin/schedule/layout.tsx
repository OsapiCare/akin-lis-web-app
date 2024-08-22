"use client";
import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { TabMenu } from "primereact/tabmenu";

import { APP_CONFIG } from "@/config/app";
import Link from "next/link";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";

interface ISchedule {
  children: React.ReactNode;
}

export default function Schedule({ children }: ISchedule) {
  const [activeIndex, setActiveIndex] = useState(APP_CONFIG.ROUTES.SCHEDULE.length);
  const route = useRouter();

  function goTo(path: string) {
    route.push(path);
  }
  // console.log(APP_CONFIG.ROUTES.SCHEDULE);
  const items = APP_CONFIG.ROUTES.SCHEDULE.map((item) => ({ ...item, icon: <item.icon />, command: () => goTo(item.path) }));

  const atualPath = APP_CONFIG.ROUTES.SCHEDULE[activeIndex]?.path;
  return (
    <div className="flex flex-col gap-4 h-screen">
      <div className="flex justify-end  mt-6">
        <TabMenu className="text-gray-700 flex" model={items} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} />
      </div>

      <div className="flex-1 overflow-y-auto gap-4 mt-6 bg-red-300">{children}</div> 
    </div>
  );
}

{
  /* {APP_CONFIG.ROUTES.SCHEDULE.map((item, index) => (
          <Link href={item.path} key={index}>
            {item.label}
          </Link>
        ))} */
}
