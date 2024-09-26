import { InputText } from "@/components/input/input-text";
import CardSchdule from "./CardSchedule";

interface ICardScheduleContainer {
  schedule: ScheduleType[];
  title: string;
}

export const dynamic = "force-dynamic";

export default function CardScheduleContainer({ schedule, title }: ICardScheduleContainer) {
  return (
    <>
      <div className="flex items-center justify-between ">
        <h1 className="font-light text-3xl my-6">{title} - ({schedule.length})</h1>
        <InputText className="w-96" placeholder="Procurar" />
        {/* {JSON.stringify(schedule, null, 2).length} */}
      </div>
      <div className=" grid grid-cols-3 gap-8 mt-1 pb-6">
        {schedule.map((data, index) => (
          // <>{data.status === "ATIVO" && <CardSchdule key={index} data={data} />}</>
          <CardSchdule key={index} data={data} />
        ))}
      </div>
    </>
  );
}
