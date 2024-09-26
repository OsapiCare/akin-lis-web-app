import React from "react";
import Image from "next/image";
import Primary from "@/components/button/primary";

interface ICardSchdule {
  data: ScheduleType;
}

export default function CardSchdule({ data }: ICardSchdule) {
  const thisYear = new Date().getFullYear();
  const birthYear = Number(data.patiente.data_nascimento.split("/")[2]);
  const age = thisYear - birthYear;

  return (
    <div className="card shadow-lg  rounded-lg flex items-center justify-content-center bg-slate-200 flex-col">
      <div className="w-full  relative h-28">
        {" "}
        {/* <img className="rounded-full" src="https://github.com/OsapiCare.png" width={140} height={140} alt="" /> */}
        <Image className="bg-center overflow-hidden rounded-t-lg" src="/images/exam/Plasmodium.png" fill alt="" />
      </div>
      <div className="w-full px-4 py-6 space-y-1.5 flex flex-col mt-1 text-cyan-800 ">
        <h1 className="text-xl font-bold ">{data.patiente.nome}</h1>
        <span>Sexo: {data.patiente.id_sexo === 1 ? "Masculino" : "Feminino"}</span>
        <span>Idade: {age}</span>
        <p>Marcado em: {new Date(data.data_agendamento).toLocaleString()}</p>
        {/* 
        <span>
            Data: {data.patiente.data_nascimento.split("/")[2]}/{data.patiente.data_nascimento.split("/")[1]}/{data.patiente.data_nascimento.split("/")[0]}
        </span>
        <span>
            Hora: {data.hora_agendamento}</span>
        </div> 
      */}
      </div>
      <div className="w-full mt-1">
        <Primary className="w-full flex justify-center bg-green-800 text-white text-center font-semibold rounded-t-none">Ver Exame</Primary>
      </div>
    </div>
  );
}
