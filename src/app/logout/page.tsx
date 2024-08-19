import { redirect } from "next/navigation";

interface ILogout {}

export default function Logout({}: ILogout) {
  redirect("/");
  return <>Saindo...</>;
}
