"use client";

import { MOCK_SCHEDULE_DATA } from "@/mocks/schedule";
import { useState } from "react";
import CardScheduleContainer from "../CardScheduleContainer";
import { ___api } from "@/lib/axios";

export default function Request() {
  // const [schedule, setSchedule] = useState<ScheduleType[]>([]);

  const [requestSchedule, setRequestSchedule] = useState<ScheduleType[]>(() => {
    
    ___api.get("/schedule").then((res) => {
      setRequestSchedule(res.data);
    });
    
    const data = MOCK_SCHEDULE_DATA.filter((data) => data.status == "ATIVO");
    return data ? data : [];
  });

  // const filteredSchedule = requestSchedule.filter((schedule) => schedule.status == "ATIVO");

  // useEffect(() => {
  // const data = MOCK_SCHEDULE_DATA.find((data) => data.status == "ATIVO");
  // console.log(data);
  // setSchedule(data);
  // }, []);

  return (
    <div className=" h-screen px-6 mx-auto">
      <CardScheduleContainer title="Agendamentos em Andamento" schedule={requestSchedule} />
    </div>
  );
}
