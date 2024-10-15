"use client";

import React, { useState } from "react";
import Image from "next/image";
import Primary from "@/components/button/primary";
import { View } from "@/components/view";
import { _formatPrice } from "@/utils/mask/currency";

interface ICardSchdule {
  data: ScheduleType;
}

export default function CardSchdule({ data }: ICardSchdule) {
  const [showExames, setShowExames] = useState(false);

  

  const thisYear = new Date().getFullYear();
  // const birthYear = Number(.split("/")[2]);
  // const birthYear = data.Paciente?.data_nascimento ? new Date(data.Paciente.data_nascimento).getFullYear():0
  const birthYear = new Date(data.Paciente.data_nascimento).getFullYear()
  const age = thisYear - birthYear;

  {
    /* <img className="rounded-full" src="https://github.com/OsapiCare.png" width={140} height={140} alt="" /> */
  }

  return (
    <div className="card shadow-lg border rounded-lg flex items-center justify-content-center bg-[#fcfcfc] flex-col min-h-[23rem] max-h-[23rem]">
      {showExames ? (
        <div className="  flex-1 rounded-t-lg   w-full  space-y-2 model p-4 h-[19.2rem] ">
          <View.Scroll className="max-h-full  pl-4 overflow-y-auto space-y-2">
            {data.Exame.map((exame) => (
              <div className="w-full  pb-4">
                <p className="font-bold text-2xl">- {exame.exame.nome}</p>
                <p className="lowercase pl-6 italic">Estado: <span data-isActive={exame.status} className="text-red-500 data-[isActive='ATIVO']:text-green-500">{exame.status}</span></p>
              </div>
            ))}
          </View.Scroll>
        </div>
      ) : (
        <>
          {" "}
          <div className="w-full  relative h-44">
            <Image className="bg-center overflow-hidden rounded-t-lg" src="/images/exam/Plasmodium.png" fill alt="" />
          </div>
          <div className="w-full px-4 py-1 space-y-1.5 flex flex-col mt-1 text-cyan-800 ">
            <h1 className="text-xl font-bold ">{data.Paciente?.nome}</h1>
            <span>BI: {data.Paciente?.numero_identificacao}</span>
            <span>Sexo: {data.Paciente?.id_sexo === 1 ? "Masculino" : "Feminino"}</span>
            <span>Idade: {age}</span>
            <p>Marcado em: {new Date(data?.data_agendamento).toLocaleString()}</p>
          </div>
        </>
      )}

      <div className="w-full mt-1">
        <Primary className="w-full flex justify-center bg-akin-turquoise text-white text-center font-semibold rounded-t-none" onClick={() => setShowExames((prev) => !prev)} label={showExames ? "Ver Agendamento" : "Ver Exame"} />
      </div>
    </div>
  );
}


