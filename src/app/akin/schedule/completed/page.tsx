import { InputText } from "@/components/input/input-text";
import CardRequestSchdule from "../request/components/CardRequestSchedule";
import { MOCK_SCHEDULE_DATA } from "@/mocks/schedule";

interface IRequest {}

export default function Completed({}: IRequest) {
  return (
    <div className=" h-screen px-6 mx-auto">
      <div className="flex items-center justify-between ">
        <h1 className="font-light text-3xl my-6">Agendamentos concluidos</h1>
        <InputText className="w-96" placeholder="Procurar" />
      </div>
      <div className=" grid grid-cols-4 gap-8">

        {MOCK_SCHEDULE_DATA.map((data, index) => (
          <CardRequestSchdule key={index} />
        ))}
      </div>
    </div>
  );
}
