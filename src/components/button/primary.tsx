import { Button, ButtonProps } from "primereact/button";
import { twMerge } from "tailwind-merge";

interface IPrimary extends ButtonProps {}

export default function Primary({ className, ...rest }: IPrimary) {
  return <Button className={twMerge("bg-akin-turquoise text-akin-white-smoke py-2 px-4", className)} {...rest} />;
}
