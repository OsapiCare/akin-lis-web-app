import { redirect } from "next/navigation";

interface ITest {}

export default async function Test({}: ITest) {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  return <>Saindo...</>;
}
