import { InputText, InputTextProps } from "primereact/inputtext";

interface IInputFieldIcon extends InputTextProps {
  icon: React.ElementType;
  fit?: boolean
}

export function InputFieldIcon({ icon: Icon,fit, ...rest }: IInputFieldIcon) {
  return (
    <div data-toFit={fit} className="flex items-center data-[toFit=true]:w-fit border-2 border-akin-yellow-light gap-x-1 px-2 py-3 rounded-lg bg-akin-yellow-light/20 has-[:focus]:ring has-[:focus]:ring-akin-yellow-light">
      <Icon size={20} className="text-gray-400" />
      <InputText className=" ring-0 bg-transparent outline-none" {...rest} />
    </div>
  );
}
