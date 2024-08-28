import { AppLayout } from "@/components/layout";
import { MessageCircleMore } from "lucide-react";
import { Suspense } from "react";
import Loading from "../loading";

interface IDashboard {
  children: React.ReactNode;
}

export default function Akin({ children }: IDashboard) {
  return (
    <div className="flex max-h-screen relative">
      <AppLayout.Menu />
      <main className="gap-y-8 flex-1  h-screen *:p-4 ">
        <Suspense fallback={<Loading />}>{children}</Suspense>
        <div className="absolute z-50 bottom-4 right-4 rounded-full flex items-center justify-center bg-akin-turquoise transition ease-in-out hover:cursor-pointer hover:bg-akin-yellow-light group border hover:border-akin-turquoise" title="Chat Kin">
          <MessageCircleMore className="text-akin-yellow-light group-hover:text-akin-turquoise " />
        </div>
      </main>
    </div>
  );
}
