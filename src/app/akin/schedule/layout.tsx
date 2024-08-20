import { APP_CONFIG } from "@/config/app";
import Link from "next/link";

interface ISchedule {
    children: React.ReactNode;
}

export default function Schedule({children}: ISchedule) {
  return (
    <>
      <h1>Schedule</h1>
      <div className="flex flex-col gap-4 mt-6">
        {APP_CONFIG.ROUTES.SCHEDULE.map((item, index) => (
          <Link href={item.path} key={index}>
            {item.label}
          </Link>
        ))}
      </div>

      {children}
    </>
  );
}
