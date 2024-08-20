import osapiLogo from "@/assets/images/osapi-logo.png";
import osapiLogoWhite from "@/assets/images/osapi-logo-white.png";
import path from "path";
import { Home, CalendarCheck, LayoutDashboard, UserRound, CreditCard, MessageSquareMore, Send, Mail, LogOut, Settings2, Settings, Cog, Wrench } from "lucide-react";

export const APP_CONFIG = {
  COMPANY_NAME: "OsapiCare AKIN",
  APP_NAME: "AKIN",
  VERSION: "1.0",
  LOGO: osapiLogo,
  LOGO_WHITE: osapiLogoWhite,
  ROUTES: {
    MENU: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/akin/dashboard" },
      { label: "Agendamentos", icon: CalendarCheck, path: "/akin/schedule" },
      { label: "Pacientes", icon: UserRound, path: "/akin/patient" },
      { label: "Pagamentos", icon: CreditCard, path: "/akin/payment" },
      { label: "Mensagens", icon: MessageSquareMore, path: "/akin/message" },
      { label: "Definições", icon: Settings, path: "/akin/setting" },
      { label: "Sair", icon: LogOut, path: "/logout" },
    ],
    ALTERNATIVE: {
      PROFILE: { label: "Perfil", icon: LogOut, path: "/akin/..." },
    },
  },
};

export const SERVER_ENVIRONMENT = typeof window === "undefined";
