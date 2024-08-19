import { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface IHorizontal extends ComponentProps<"div"> {
  children: ReactNode;
}

export function Horizontal({ children, className, ...rest }: IHorizontal) {
  return (
    <div className={twMerge("flex gap-2", className)} {...rest}>
      {children}
    </div>
  );
}
