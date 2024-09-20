import { AppLayout } from "@/components/layout";
import { View } from "@/components/view";
import { MOCK_LOGGED_USER } from "@/mocks/logged-user";
import { CalendarArrowDown, ClockArrowDown, TrendingUp, UserRound } from "lucide-react";
import VerticalBarChart from "./chart-a";
import DoughnutChart from "./chart-b";

interface IDashboard {}

const MOCK_RESUME = [
  { id: 58, label: "Solicitações Pendentes", value: 6, icon: UserRound },
  { id: 58, label: "Exames Pendentes", value: 465, icon: ClockArrowDown },
  { id: 1, label: "Exames a Decorrer", value: 8, icon: TrendingUp },
  { id: 64, label: "Agendamentos", value: 4, icon: CalendarArrowDown },
];

export default function Dashboard({}: IDashboard) {
  return (
    <View.Vertical className="h-screen space-y-2">
      {/* <AppLayout.Header avatar={MOCK_LOGGED_USER.avatar} name={MOCK_LOGGED_USER.fullName} email={MOCK_LOGGED_USER.email} /> */}
      <AppLayout.ContainerHeader label="Dashboard" />

      <div className="grid  grid-cols-4  gap-4 *:bg-akin-turquoise text-akin-white-smoke *:rounded-lg ">
        {MOCK_RESUME.map((data) => (
          <div key={data.id} className="px-3 py-2 space-y-3 shadow-xl border-l-4 border-l-sky-300/50">
            <p className="border-b pb-2 font-bold text-lg">{data.label}</p>

            <div className=" flex items-center space-x-2">
              <data.icon size={40} className="bg-sky-300/50 p-1 rounded-lg" />
              <p className="text-xl ">{data.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="flex-1 flex  *:rounded-xl gap-x-2 *:shadow-xl *:bg-akin-turquoise/60 text-akin-white-smoke *:p-4"> */}
      <div className="flex  *:rounded-xl gap-x-2 *:shadow-xl *:bg-sky-800/90 text-akin-white-smoke *:p-4">
        <div className="flex-1 border-l-4 border-l-akin-turquoise">
          <h2 className="font-bold text-xl">Receita por mês</h2>
          <hr />
          <VerticalBarChart />
        </div>
        <div className="border-l-4 border-l-akin-turquoise">
          <h2 className="font-bold text-xl">Receita por X</h2>
          <hr />
          <p>Testando...</p>
          <DoughnutChart />
        </div>
      </div>
    </View.Vertical>
  );
}
