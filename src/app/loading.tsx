import Image from "next/image";
import PuffLoading from "@/assets/images/puff-loading.svg";

export default function Loading() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-akin-turquoise/10 text-akin-turquoise">
      <Image src={PuffLoading} alt="Loading" width={400} height={400} />
      <span className="font-bold animate-bounce">⌛Aguarde...</span>
    </div>
  );
}
