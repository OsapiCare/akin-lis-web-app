"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface IContainerHeader {
  label: string;
  goBack?: boolean;
  noBottomLine?: boolean;
}

export default function ContainerHeader({ label, goBack, noBottomLine }: IContainerHeader) {
  const route = useRouter();
  const goBackFn = () => route.back();
  return (
    <div data-noBottom={noBottomLine} className="data-[noBottomLine=false]:mb-6 ">
      <div className="flex items-center gap-x-2">
        {goBack && <ChevronLeft className="cursor-pointer" size={28} onClick={goBackFn} />}
        <h1 className="font-bold text-2xl my-4 text-akin-turquoise">{label}</h1>
      </div>
      {!noBottomLine && <hr />}
    </div>
  );
}
