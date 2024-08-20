import { APP_CONFIG } from "@/config/app";
import { redirect } from "next/navigation";

interface IAuth {}

export default async function Auth({}: IAuth) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const dashboardPath = APP_CONFIG.ROUTES.MENU[0].path;
  redirect(dashboardPath);

  return <>Entrando...</>;
}
