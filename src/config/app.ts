import osapiLogo from "@/assets/images/osapi-logo.png";
import osapiLogoWhite from "@/assets/images/osapi-logo-white.png";
import path from "path";
import { Home, CalendarCheck, LayoutDashboard, UserRound, CreditCard, MessageSquareMore, Send, Mail, LogOut, Settings2, Settings, Cog, Wrench } from "lucide-react";


export const APP_CONFIG = {
  NAME: "OsapiCare AKIN",
  VERSION: "1.0",
  LOGO: osapiLogo,
  LOGO_WHITE: osapiLogoWhite,
  DASHBOARD: {
    MENU: [
      { id: 1, label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { id: 2, label: "Agendamentos", icon: CalendarCheck, path: "/dashboard/schedule" },
      { id: 3, label: "Pacientes", icon: UserRound, path: "/dashboard/patient" },
      { id: 4, label: "Pagamentos", icon: CreditCard, path: "/dashboard/payment" },
      { id: 5, label: "Mensagens", icon: MessageSquareMore, path: "/dashboard/message" },
      // { id: 5, label: "Mensagens", icon: Send, path: "/dashboard/message" },
      // { id: 5, label: "Mensagens", icon: Mail, path: "/dashboard/message" },
      // { id: 6, label: "Definições", icon: Settings2, path: "/dashboard/setting" },
      { id: 6, label: "Definições", icon: Settings, path: "/dashboard/setting" },
      // { id: 6, label: "Definições", icon: Cog, path: "/dashboard/setting" },
      // { id: 6, label: "Definições", icon: Wrench, path: "/dashboard/setting" },
      { id: 7, label: "Sair", icon: LogOut, path: "/logout" },
    ],
  },
};

export const SERVER_ENVIRONMENT = typeof window === "undefined";
