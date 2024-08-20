import { redirect } from "next/navigation";

interface ILogout {}

export default async function Logout({}: ILogout) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  redirect("/");
  return <>Saindo...</>;
}
