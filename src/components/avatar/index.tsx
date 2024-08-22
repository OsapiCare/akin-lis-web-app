import { AvatarProps, Avatar as AvatarIcon } from "primereact/avatar";
interface IAvatar extends AvatarProps {}

export default function Avatar({ ...rest }: IAvatar) {
  return <AvatarIcon className="text-gray-100 bg-sky-500 font-bold" size="xlarge" shape="circle" {...rest} />;
}
