"use client";
import { useState } from "react";
import Image from "next/image";
import { useSelectedLayoutSegment } from "next/navigation";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import Item from "./item";
import { APP_CONFIG } from "@/components/layout/app";
import { MenuIcon } from "lucide-react";
import { filterRoutesByAccess } from "@/config/filteredAcessRoutes";
import { getAllDataInCookies } from "@/utils/get-data-in-cookies";

export default function Menu() {
  const activeSegment = useSelectedLayoutSegment() as string;
  const [isSheetOpen, setSheetOpen] = useState(false);
  const role = getAllDataInCookies().userRole;
  const routes = role ? filterRoutesByAccess(role) : [];
  return (
    <>
      {/* Menu em tela pequena (com Sheet) */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 bg-akin-turquoise text-akin-white-smoke">
          {/* Logo */}
          <Image
            width={108}
            height={40}
            src={APP_CONFIG.LOGO_WHITE}
            alt="Akin logo"
            priority
          />
          {/* Botão para abrir o Sheet */}
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger>
              <MenuIcon className="w-6 h-6 cursor-pointer" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-akin-turquoise text-akin-white-smoke"
            >
              <SheetHeader>
                <Image
                  width={108}
                  height={40}
                  src={APP_CONFIG.LOGO_WHITE}
                  alt="Akin logo"
                  priority
                />
              </SheetHeader>
              <nav className={`transition-opacity duration-300 ${role ? "opacity-100" : "opacity-0"}`}>
                <ul className="space-y-2 mt-4" role="menu">
                  {
                    routes.map((item, index) => (
                      <Item item={item} key={index} activeSegment={activeSegment} />
                    ))
                  }
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Menu em telas maiores */}
      <aside
        className="hidden md:block bg-akin-turquoise p-4 text-akin-white-smoke w-full min-h-52 h-max md:w-52 md:h-screen fixed space-y-5 md:space-y-0"
        aria-label="Menu lateral de navegação"
      >
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Image
            width={108}
            height={40}
            src={APP_CONFIG.LOGO_WHITE}
            alt="Akin logo"
            priority
          />
        </div>

        {/* Navegação */}
        <nav className={`transition-opacity duration-300 ${role ? "opacity-100" : "opacity-0"}`}>
          <ul
            className="space-y-1.5 mt-10 gap-2 flex flex-col items-start"
            role="menu"
          >
            {
              routes.map((item, index) => (
                <Item item={item} key={index} activeSegment={activeSegment} />
              ))
            }
          </ul>
        </nav>
      </aside>
    </>
  );
}
