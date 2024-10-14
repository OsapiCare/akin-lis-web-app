import { InputText } from "@/components/input/input-text";
import CardSchdule from "./CardSchedule";
import { useEffect, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";

interface ICardScheduleContainer {
  schedule: ScheduleType[];
  title: string;
  isLoading: boolean;
}

export const dynamic = "force-dynamic";

export default function CardScheduleContainer({ schedule, title, isLoading }: ICardScheduleContainer) {
  const [filteredSchedule, setFilteredSchedule] = useState<ScheduleType[]>(schedule);
  const [isSearching, setIsSearching] = useState(false);

  // function handleSearch(serachText: React.ChangeEvent<HTMLInputElement>) {
  function handleSearch(serachText: string) {
    // const serachText = event.target.value;
    serachText.length > 0 ? setIsSearching(true) : setIsSearching(false);

    const findedSchedule = schedule.filter((schedule) => schedule.Paciente?.nome.toLowerCase().includes(serachText.toLowerCase()));
    setFilteredSchedule(findedSchedule);
    // console.log("-_-", findedSchedule);
  }

  useEffect(() => {
    setFilteredSchedule(schedule);
  }, [schedule]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between ">
        <h1 className="font-light text-3xl my-6">
          {title} - ({schedule.length})
        </h1>

        <div>
          <InputText className="w-96" placeholder="Procurar" onChange={(e) => handleSearch(e.target.value)} />
          {isSearching && <p className="text-sm text-gray-500 italic">Total de agendamentos encontrados: {filteredSchedule.length}</p>}
        </div>
        {/* {JSON.stringify(filteredSchedule, null, 2).length} */}
      </div>
      {/* Content */}

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <ProgressSpinner style={{ width: "25px", height: "25px" }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
        </div>
      ) : (
        <>
          {filteredSchedule.length == 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Não há agendamento disponíveis</p>
            </div>
          ) : (
            <div className=" grid grid-cols-3 gap-8 mt-1 pb-6">
              {filteredSchedule.map((data, index) => (
                <CardSchdule key={index} data={data} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
