import { AppLayout } from "@/components/layout";
import { MOCK_LOGGED_USER } from "@/mocks/logged-user";
import { CalendarArrowDown, ClockArrowDown, TrendingUp, UserRound } from "lucide-react";

interface IDashboard {}

const MOCK_RESUME = [
  { id: 58, label: "Solicitações Pendentes", value: 385, icon: UserRound },
  { id: 58, label: "Exames Pendentes", value: 732, icon: ClockArrowDown },
  { id: 1, label: "Exames a Decorrer", value: 498, icon: TrendingUp },
  { id: 64, label: "Agendamentos", value: 972, icon: CalendarArrowDown },
];

export default function Dashboard({}: IDashboard) {
  return (
    <main className="space-y-8">
      <AppLayout.Header avatar={MOCK_LOGGED_USER.avatar} name={MOCK_LOGGED_USER.fullName} email={MOCK_LOGGED_USER.email} />
      <div className="grid grid-cols-4 gap-4 *:bg-akin-turquoise text-akin-white-smoke *:rounded-lg ">
        {MOCK_RESUME.map((data) => (
          <div key={data.id} className="flex  gap-4 items-center  font-bold text-xl px-3 py-2 ">
            {/* <data.icon size={50} className="bg-sky-400 p-0.5 rounded-lg" /> */}
            <data.icon size={50} className="bg-akin-yellow-light/50 p-0.5 rounded-lg" />
            <div className="flex-1">
              <p>{data.value}</p>
              <p className="border-t">{data.label}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
