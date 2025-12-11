"use client";

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuthStore } from "@/utils/zustand-store/authStore";
import { useQuery } from "@tanstack/react-query";
import { _axios } from "@/Api/axios.config";
import { UserData } from "@/app/akin/profile/page";
import Link from "next/link";

export function NavUser({}: {}) {
  const { isMobile } = useSidebar();
  const { user } = useAuthStore();
  const { data: loggedUser, isPending } = useQuery({
    queryKey: ["user-data"],
    queryFn: async () => {
      return await _axios.get<UserData>(`/users/${user?.id}`);
    },
  });

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={"/image/avatar.png"} alt={loggedUser?.data?.nome} />
                <AvatarFallback className="rounded-lg text-black">{loggedUser?.data?.nome.slice(0, 2).charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{loggedUser?.data?.nome}</span>
                <span className="truncate text-xs">{loggedUser?.data?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg cursor-pointer" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <Link href={"/akin/profile"} className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={""} alt={loggedUser?.data?.nome} />
                  <AvatarFallback className="rounded-lg">{loggedUser?.data?.nome.slice(0, 2).charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{loggedUser?.data?.nome}</span>
                  <span className="truncate text-xs">{loggedUser?.data?.email}</span>
                </div>
              </Link>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                window.location.href = "/logout";
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
