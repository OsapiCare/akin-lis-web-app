import { InputText } from "@/components/input/input-text";
import CardSchdule from "../CardRequestSchedule";
import { MOCK_SCHEDULE_DATA } from "@/mocks/schedule";

interface IRequest {}

export default function Request({}: IRequest) {
  return (
    <div className=" h-screen px-6 mx-auto">
      <div className="flex items-center justify-between ">
        <h1 className="font-light text-3xl my-6">Solicitação de Agendamentos</h1>
        <InputText className="w-96" placeholder="Procurar" />
      </div>
      <div className=" grid grid-cols-3 gap-8 mt-1">
        
        {}
        {MOCK_SCHEDULE_DATA.map((data, index) => (
          <CardSchdule key={index} data={data} />
        ))}
      </div>
    </div>
  );
}
