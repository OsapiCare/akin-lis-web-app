import clsx from "clsx";
import { InputText as Input, InputTextProps } from "primereact/inputtext";

interface IInputText extends InputTextProps {}

export function InputText({ className, ...rest }: IInputText) {
  return <Input className={clsx("border-2 border-akin-yellow-light p-3 rounded-lg bg-akin-yellow-light/20 ring-0", className)} {...rest} />;
}
