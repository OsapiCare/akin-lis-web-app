import { AvatarProps, Avatar as AvatarIcon } from "primereact/avatar";
interface IAvatar extends AvatarProps {
  userName: string;
}

export default function Avatar({ userName, ...rest }: IAvatar) {
  const nameAbbreviation = userName?.split(" ")[0].charAt(0) + userName?.split(" ")[1].charAt(0);

  return <AvatarIcon label={nameAbbreviation} className="text-gray-100 bg-sky-500 font-bold" size="xlarge" shape="circle" {...rest} />;
}
