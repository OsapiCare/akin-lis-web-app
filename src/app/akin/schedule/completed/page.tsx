"use client";

import { InputText } from "@/components/input/input-text";
import CardSchdule from "../CardSchedule";
import { MOCK_SCHEDULE_DATA } from "@/mocks/schedule";
import CardScheduleContainer from "../CardScheduleContainer";
import { useState } from "react";



export default function Completed() {
  // const [schedule, setSchedule] = useState<ScheduleType[]>([]);
  const [Complitedschedule, setComplitedschedule] = useState<ScheduleType[]>(() => {
    const data = MOCK_SCHEDULE_DATA.filter((data) => data.status != "ATIVO");
    return data ? data : [];
  });

  // useEffect(() => {
  // const data = MOCK_SCHEDULE_DATA.find((data) => data.status == "ATIVO");
  // console.log(data);
  // setSchedule(data);
  // }, []);

  return (
    <div className=" h-screen px-6 mx-auto">
      <CardScheduleContainer title="Agendamentos Concluídos" schedule={Complitedschedule} />
    </div>
  );
}
