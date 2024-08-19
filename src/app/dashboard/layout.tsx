import MenuItem from "@/components/menu-item";
import { APP_CONFIG } from "@/config/app";
import Image from "next/image";
interface IDashboard {
  children: React.ReactNode;
}

export default function Dashboard({ children }: IDashboard) {
  return (
    <div className="flex h-screen">
      <aside className="bg-akin-turquoise p-4 text-akin-white-smoke">
        <Image width={108} src={APP_CONFIG.LOGO_WHITE} alt="Akin logo" />
        <ul className="mt-10">
          {APP_CONFIG.DASHBOARD.MENU.map((item, index) => (
            <MenuItem item={item} key={index} />
          ))}
        </ul>
      </aside>
      <main className="flex flex-col flex-1 ">{children}</main>
    </div>
  );
}
