import { Button, ButtonProps } from "primereact/button";

interface IPrimary extends ButtonProps {}

export default function Primary({ ...rest }: IPrimary) {
  return (
    <Button
      className="bg-akin-turquoise text-akin-white-smoke py-2 px-4"
      {...rest}
    />
  );
}
