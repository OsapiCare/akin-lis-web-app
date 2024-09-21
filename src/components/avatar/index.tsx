import clsx from "clsx";
import { AvatarProps, Avatar as AvatarIcon } from "primereact/avatar";
import { twMerge } from "tailwind-merge";
interface IAvatar extends AvatarProps {
  userName: string;
}

export default function Avatar({ userName, className, ...rest }: IAvatar) {
  const nameAbbreviation = userName?.split(" ")[0].charAt(0) + userName?.split(" ")[1].charAt(0);

  return <AvatarIcon label={nameAbbreviation} className={twMerge("text-gray-100 bg-sky-900 font-bold", className)} size="xlarge" shape="circle" {...rest} />;
}
