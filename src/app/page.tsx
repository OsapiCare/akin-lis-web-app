import Image from "next/image";
import { APP_CONFIG } from "@/config/app";
import ImageAkinDemo from "@/assets/images/akin-demo.png";


export default function Home() {
  return (
    <main className="min-h-screen bg-akin-color-cosmic-latte">
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
                Email:
                <input type="email" />
              </label>
            </div>
            <div>
              <label htmlFor="password">
                Password
                <input type="password" />
              </label>
            </div>
            <div>
              <p>Relembrar-me</p>
            </div>
            <button className="bg-akin-color-teal-blue"  >OLa</button>
          </div>
        </aside>
        <aside className="col-span-2">
          <Image src={ImageAkinDemo} alt="Akin Demo" />
        </aside>
      </section>
    </main>
  );
}
