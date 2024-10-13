import { InputText } from "@/components/input/input-text";
import CardSchdule from "./CardSchedule";
import { useState } from "react";

interface ICardScheduleContainer {
  schedule: ScheduleType[];
  title: string;
}

export const dynamic = "force-dynamic";

export default function CardScheduleContainer({ schedule, title }: ICardScheduleContainer) {
  const [filteredSchedule, setFilteredSchedule] = useState<ScheduleType[]>(schedule);
  const [isSearching, setIsSearching] = useState(false);

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    const serachText = event.target.value;
    serachText.length > 0 ? setIsSearching(true) : setIsSearching(false);
    const findedSchedule = schedule.filter((schedule) => schedule.patiente.nome.toLowerCase().includes(serachText.toLowerCase()));
    setFilteredSchedule(findedSchedule);
  }

  return (
    <>
      <div className="flex items-center justify-between ">
        <h1 className="font-light text-3xl my-6">
          {title} - ({schedule.length})
        </h1>

        <div>
          <InputText className="w-96" placeholder="Procurar" onChange={handleSearch} />
          {isSearching && <p className="text-sm text-gray-500 italic">Total de agendamentos encontrados: {filteredSchedule.length}</p>}
        </div>
        {/* {JSON.stringify(filteredSchedule, null, 2).length} */}
      </div>
      <div className=" grid grid-cols-3 gap-8 mt-1 pb-6">
        {filteredSchedule.map((data, index) => (
          // <>{data.status === "ATIVO" && <CardSchdule key={index} data={data} />}</>
          <CardSchdule key={index} data={data} />
        ))}
      </div>
    </>
  );
}
