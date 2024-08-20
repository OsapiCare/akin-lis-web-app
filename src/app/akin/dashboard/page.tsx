import { CalendarArrowDown, ClockArrowDown, TrendingUp, UserRound } from "lucide-react";
import Link from "next/link";

interface IDashboard {}

const MOCK_RESUME = [
  { id: 58, label: "Solicitações Pendentes", value: 385, icon: UserRound },
  { id: 58, label: "Exames Pendentes", value: 732, icon: ClockArrowDown },
  { id: 1, label: "Exames a Decorrer", value: 498, icon: TrendingUp },
  { id: 64, label: "Agendamentos", value: 972, icon: CalendarArrowDown },
];

export default function Dashboard({}: IDashboard) {
  return (
    <main className="">
      <div className="grid grid-cols-4 gap-4 *:bg-akin-turquoise text-akin-white-smoke *:rounded-lg ">
        {MOCK_RESUME.map((data) => (
          <div key={data.id} className="flex gap-4 items-center  font-bold text-xl px-3 py-2 ">
            <data.icon size={45} className="bg-akin-yellow-light/30 p-0.5 rounded-lg" />
            <div className="flex-1">
              <p>{data.value}</p>
              <p className="border-t">{data.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <Link href={"/"}>Registro de Pacientes</Link>
        <Link href={"/"}>Gestão dos Dados do Paciente</Link>
        <Link href={"/"}>Registro de Pagamentos</Link>
        <Link href={"/"}>Registro de Pedido de Exames</Link>
        <Link href={"/"}>Agendamento de Exames</Link>
      </div>
    </main>
  );
}
