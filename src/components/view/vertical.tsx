import { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface IVertical extends ComponentProps<"div"> {
  children: ReactNode;
}

export function Vertical({ children, className, ...rest }: IVertical) {
  return (
    <div className={twMerge("flex flex-col gap-2", className)} {...rest}>
      {children}
    </div>
  );
}
