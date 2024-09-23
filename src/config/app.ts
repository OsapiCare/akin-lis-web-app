import osapiLogo from "@/assets/images/osapi-logo.png";
import osapiLogoWhite from "@/assets/images/osapi-logo-white.png";
import { Home, CalendarCheck, LayoutDashboard, UserRound, CreditCard, MessageSquareMore, Send, Mail, LogOut, Settings2, Settings, Cog, Wrench, UsersRound, CalendarPlus2, CalendarSearch, CalendarCheck2 } from "lucide-react";

export const APP_CONFIG = {
  COMPANY_NAME: "OsapiCare AKIN",
  APP_NAME: "AKIN",
  VERSION: "1.0",
  LOGO: osapiLogo,
  LOGO_WHITE: osapiLogoWhite,
  ROUTES: {
    MENU: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/akin/dashboard" },
      { label: "Agendamentos", icon: CalendarCheck, path: "/akin/schedule/new" },
      { label: "Pacientes", icon: UsersRound, path: "/akin/patient" },
      { label: "Pagamentos", icon: CreditCard, path: "/akin/payment" },
      { label: "Mensagens", icon: MessageSquareMore, path: "/akin/message" },
      { label: "Definições", icon: Settings, path: "/akin/setting" },
      { label: "Perfil", icon: UserRound, path: "/akin/profile" },
      { label: "Sair", icon: LogOut, path: "/logout" },
    ],
    SCHEDULE: [
      { label: "Novo", icon: CalendarPlus2, path: "/akin/schedule/new" },
      { label: "Solicitações", icon: CalendarSearch, path: "/akin/schedule/request" },
      { label: "Concluídos", icon: CalendarCheck2, path: "/akin/schedule/completed" },
    ],
    PATIENT: {
      INDIVIDUAL_PATIENT_LINK(id: string) {
        return `/akin/patient/${id}`;
      },
    },
    ALTERNATIVE: {
      PROFILE: { label: "Perfil", icon: null, path: "/akin/..." },
    },
  },
};

export const SERVER_ENVIRONMENT = typeof window === "undefined";
