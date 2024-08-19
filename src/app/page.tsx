import Image from "next/image";
import { APP_CONFIG, SERVER_ENVIRONMENT } from "@/config/app";
import ImageAkinDemo from "@/assets/images/akin-demo.png";
import { Button } from "@/components/button";

import { InputSwitch } from "primereact/inputswitch";
import { Input } from "@/components/input";

import { InputText } from "primereact/inputtext";

import { Password } from "primereact/password";

//TODO need to fix hydration error
export default function Home() {
  // if (typeof window === 'undefined') {
  //   return null; // Não renderiza no servidor
  // }

  return (
    <main className="min-h-screen bg-akin-cosmic-latte">
      <section className="grid grid-cols-3 *:border">
        <aside>
          <Image
            src={APP_CONFIG.LOGO}
            alt="Akin logo"
            width={150}
            height={150}
          />
          <div>
            <div>
              <label>
                <strong className="text-akin-turquoise">Email:</strong>
                <InputText type="email" placeholder="Digite o seu e-amail" />
              </label>
            </div>
            <div>
              <label>
                <strong className="text-akin-turquoise">Password:</strong>
                <Password
                  placeholder="Digite a sua password"
                  feedback={false}
                  tabIndex={1}
                  toggleMask
                />
              </label>
            </div>
            <div className="flex justify-between items-center">
              <p>Relembrar-me</p>
              <Input.Switch />
            </div>
            <Button.Primary label="Entrar" />
          </div>
        </aside>
        <aside className="col-span-2">
          <Image src={ImageAkinDemo} alt="Akin Demo" />
        </aside>
      </section>
    </main>
  );
}


function VStack () {
  return
  
}
function HStack () {
  return
  
}