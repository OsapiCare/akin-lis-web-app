import Link from "next/link";
import Image from "next/image";
import { APP_CONFIG } from "@/config/app";
import ImageAkinDemo from "@/assets/images/akin-demo.png";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { View } from "@/components/view";

//TODO need to fix hydration error
export default function Home() {
  // if (typeof window === 'undefined') {
  //   return null; // Não renderiza no servidor
  // }

  return (
    <main className="min-h-screen ">
      <section className="grid md:grid-cols-3 *:min-h-screen ">
        <aside className="space-y-14 p-[10%]  md:col-span-1 flex flex-col justify-center relative">
          <Image className="absolute top-[11%] left-[10%] w-[11rem]" src={APP_CONFIG.LOGO} alt="Akin logo" />
          <View.Vertical className="space-y-2 ">
            <View.Vertical>
              <strong className="text-akin-turquoise">Email:</strong>
              <Input.InputText type="email" placeholder="Digite o seu e-amail" />
            </View.Vertical>
            <View.Vertical>
              <strong className="text-akin-turquoise">Password:</strong>
              <Input.InputText type="password" placeholder="Digite a sua password" />
            </View.Vertical>
            <View.Horizontal className="justify-between items-center">
              <p>Relembrar-me</p>
              <Input.Switch />
            </View.Horizontal>
            <View.Horizontal className="justify-end pt-4">
              <Link href="/auth">
                <Button.Primary label="Entrar" />
              </Link>
            </View.Horizontal>
          </View.Vertical>
        </aside>
        <aside className="col-span-2 hidden md:flex flex-col justify-center items-end">
          {/* <Image src={ImageAkinDemo} alt="Akin Demo" className="w-full" /> */}
          <Image src={ImageAkinDemo} alt="Akin Demo" className="w-svw" />
        </aside>
      </section>
    </main>
  );
}
