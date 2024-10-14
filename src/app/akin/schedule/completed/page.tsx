"use client";

import { InputText } from "@/components/input/input-text";
import CardSchdule from "../CardSchedule";
import { MOCK_SCHEDULE_DATA } from "@/mocks/schedule";
import CardScheduleContainer from "../CardScheduleContainer";
import { useEffect, useState } from "react";
import { ___api } from "@/lib/axios";
import { ___showErrorToastNotification } from "@/lib/sonner";

export default function Completed() {
  const [Complitedschedule, setComplitedschedule] = useState<ScheduleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ___api
      .get("/schedulings/concluded")
      .then((res) => {
        setComplitedschedule(res.data);
        setIsLoading(false);
      })
      .catch((e) => {
        ___showErrorToastNotification({ message: "Erro inesperado ocorreu ao buscar os dados. Atualiza a página ou contecte o suporte" });
      });
  }, []);

  return (
    <div className=" h-screen px-6 mx-auto">
      {/* <CardScheduleContainer title="Agendamentos Concluídos" schedule={Complitedschedule} /> */}
      <CardScheduleContainer isLoading={isLoading} title="Agendamentos Concluídos" schedule={Complitedschedule} />
    </div>
  );
}
