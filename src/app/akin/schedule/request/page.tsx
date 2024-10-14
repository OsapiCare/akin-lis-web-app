"use client";

import { MOCK_SCHEDULE_DATA } from "@/mocks/schedule";
import { useEffect, useState } from "react";
import CardScheduleContainer from "../CardScheduleContainer";
import { ___api } from "@/lib/axios";
import { ___showErrorToastNotification } from "@/lib/sonner";

export default function Request() {
  // const [schedule, setSchedule] = useState<ScheduleType[]>([]);

  const [requestSchedule, setRequestSchedule] = useState<ScheduleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ___api
      .get("/schedulings/pending")
      .then((res) => {
        // console.log("----",res.data[0]);
        setRequestSchedule(res.data);
        setIsLoading(false);
      })
      .catch((e) => {
        ___showErrorToastNotification({ message: "Erro inesperado ocorreu ao buscar os dados. Atualiza a página ou contecte o suporte" });
      });
  }, []);

  return (
    <div className=" h-screen px-6 mx-auto">
      <CardScheduleContainer isLoading={isLoading} title="Agendamentos em Andamento" schedule={requestSchedule} />
    </div>
  );
}
