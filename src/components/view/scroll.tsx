import { ScrollPanel, ScrollPanelProps } from "primereact/scrollpanel";
import { twMerge } from "tailwind-merge";

interface IScroll extends ScrollPanelProps {
  children: React.ReactNode;
}

export default function Scroll({ children, className, ...rest }: IScroll) {
  return (
    <ScrollPanel className={twMerge("flex-1 overflow-y-auto -mx-4 model", className)} {...rest}>
      {children}
    </ScrollPanel>
  );
}
