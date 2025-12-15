import osapiLogo from "@/assets/images/osapi-logo.png";
import osapiLogoWhite from "@/assets/images/osapi-logo-white.png";
import {
  CalendarCheck,
  LayoutDashboard,
  UserRound,
  CreditCard,
  MessageSquareMore,
  LogOut,
  Settings,
  SquareActivity,
  UsersRound,
  CalendarPlus2,
  CalendarSearch,
  CalendarCheck2,
  UserRoundCog,
  Package,
  PackageOpen,
  PackageSearch,
  FileText,
  Bell,
  History,
  Play
} from "lucide-react";

export const APP_CONFIG = {
  COMPANY_NAME: "OsapiCare AKIN",
  APP_NAME: "AKIN",
  VERSION: "1.0",
  LOGO: osapiLogo,
  LOGO_WHITE: osapiLogoWhite,
  ROUTES: {
    MENU: [
      {
        label: "Painel Geral",
        icon: LayoutDashboard,
        path: "/akin/dashboard",
        access: ["CHEFE", "TECNICO"]
      },
      {
        label: "Agendamentos",
        icon: CalendarCheck,
        path: "",
        access: ["RECEPCIONISTA"],
        subItems: [
          // { label: "Painel", icon: LayoutDashboard, path: "/akin/schedule/dashboard", access: ["RECEPCIONISTA", "CHEFE", "TECNICO"] },
          { label: "Novo", icon: CalendarPlus2, path: "/akin/schedule/new", access: ["RECEPCIONISTA"] },
          { label: "Solicitações", icon: CalendarSearch, path: "/akin/schedule/request", access: ["RECEPCIONISTA"] },
          { label: "Gestão de Agendamentos", icon: CalendarCheck2, path: "/akin/schedule/completed", access: ["CHEFE", "RECEPCIONISTA"] }
        ]
      },
      {
        label: "Agendamentos",
        icon: CalendarCheck,
        path: "/akin/schedule/dashboard",
        access: ["CHEFE"],
        subItems: [
          { label: "Painel", icon: LayoutDashboard, path: "/akin/schedule/dashboard", access: ["RECEPCIONISTA", "CHEFE", "TECNICO"] },
          { label: "Novo", icon: CalendarPlus2, path: "/akin/schedule/new", access: ["RECEPCIONISTA"] },
          { label: "Solicitações", icon: CalendarSearch, path: "/akin/schedule/request", access: ["RECEPCIONISTA"] },
          { label: "Gestão de Agendamentos", icon: CalendarCheck2, path: "/akin/schedule/completed", access: ["CHEFE", "RECEPCIONISTA"] }
        ]
      },
      {
        label: "Pacientes",
        icon: UsersRound,
        path: "/akin/patient/dashboard",
        access: ["RECEPCIONISTA", "CHEFE", "TECNICO"],
        subItems: [
          { label: "Painel", icon: LayoutDashboard, path: "/akin/patient/dashboard", access: ["CHEFE", "TECNICO"] },
          { label: "Lista de Pacientes", icon: UsersRound, path: "/akin/patient/list", access: ["RECEPCIONISTA", "CHEFE", "TECNICO"] },
        ]
      },
      {
        label: "Exames Laboratoriais",
        icon: SquareActivity,
        path: "/akin/lab-exams",
        access: ["CHEFE", "TECNICO"],
        subItems: [
          { label: "Painel", icon: LayoutDashboard, path: "/akin/lab-exams", access: ["RECEPCIONISTA", "CHEFE", "TECNICO"] },
          { label: "Exames Pendentes", icon: SquareActivity, path: "/akin/lab-exams/pending-exams", access: ["RECEPCIONISTA", "CHEFE", "TECNICO"] },
          { label: "Exame a Realizar", icon: Play, path: "/akin/lab-exams/ready-exam", access: ["CHEFE", "TECNICO"] },
          { label: "Historico de Exames", icon: History, path: "/akin/lab-exams/exams-history", access: ["RECEPCIONISTA", "CHEFE", "TECNICO"] },
        ]
      },
      {
        label: "Gestão de Laudo",
        icon: FileText,
        path: "/akin/report",
        access: ["CHEFE", "TECNICO"]
      },
      {
        label: "Gestão Equipe",
        icon: UserRoundCog,
        path: "/akin/team-management/dashboard",
        access: ["CHEFE"],
        subItems: [
          { label: "Painel", icon: LayoutDashboard, path: "/akin/team-management/dashboard", access: ["CHEFE"] },
          { label: "Lista de Equipe", icon: UsersRound, path: "/akin/team-management/list", access: ["CHEFE"] },
        ]
      },
      {
        label: "Gestão de stock",
        icon: Package,
        path: "/akin/stock/",
        access: ["CHEFE", "TECNICO"],

      },
      // {
      //   label: "Pagamentos",
      //   icon: CreditCard,
      //   path: "/akin/payment",
      //   access: ["RECEPCIONISTA"]
      // },
      {
        label: "Mensagens",
        icon: MessageSquareMore,
        path: "/akin/message",
        access: ["TECNICO", "CHEFE"]
      },
      {
        label: "Notificações",
        icon: Bell,
        path: "/akin/notifications",
        access: ["TECNICO", "CHEFE"]
      },
      {
        label: "Definições",
        icon: Settings,
        path: "/akin/setting",
        access: ["CHEFE"]
      },
      {
        label: "Perfil",
        icon: UserRound,
        path: "/akin/profile",
        access: ["CHEFE", "TECNICO"]
      },
      {
        label: "Sair",
        icon: LogOut,
        path: "/logout",
        access: ["RECEPCIONISTA", "CHEFE", "TECNICO"]
      },
    ],

    SCHEDULE: [
      {
        label: "Novo",
        icon: CalendarPlus2,
        path: "/akin/schedule/new",
        access: ["RECEPCIONISTA"],
        subItems: [
          { label: "Novo", path: "/akin/schedule/new", access: ["RECEPCIONISTA"] },
          { label: "Solicitações", path: "/akin/schedule/request", access: ["RECEPCIONISTA"] },
          { label: "Concluídos", path: "/akin/schedule/completed", access: ["RECEPCIONISTA", "CHEFE"] }
        ]
      },
      {
        label: "Solicitações",
        icon: CalendarSearch,
        path: "/akin/schedule/request",
        access: ["RECEPCIONISTA"]
      },
      {
        label: "Concluídos",
        icon: CalendarCheck2,
        path: "/akin/schedule/completed",
        access: ["RECEPCIONISTA", "CHEFE"]
      },
    ],
    PATIENT: {
      INDIVIDUAL_PATIENT_LINK(id: string) {
        return `/akin/patient/${id}`;
      },
    },
    ALTERNATIVE: {
      PROFILE: {
        label: "Perfil",
        icon: null,
        path: "/akin/...",
        access: ["RECEPCIONISTA", "CHEFE", "TECNICO"]
      },
    },
  },
};

export const SERVER_ENVIRONMENT = typeof window === "undefined";
