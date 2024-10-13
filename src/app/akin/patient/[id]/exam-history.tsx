import { ___api } from "@/lib/axios";
import { _formatPrice } from "@/utils/mask/currency";

interface IExamsHistory {
  patientId: string;
}

export default async function ExamsHistory({ patientId }: IExamsHistory) {
  let exames: ExamsType[] = [];
  try {
    exames = await ___api.get(`exams/pacient/${patientId}`).then((response) => response.data);
  } catch (error) {
    throw new Error(`Buscando Exames ${patientId}:${error}`);
  }

  return (
    <div className="flex flex-col p-4 ">
      {
      exames.length > 0 ? (

          <div className="flex flex-col gap-4 ">
            {exames.map((exam) => (
              <EachExam key={exam.id} exam={exam} />
            ))}
          </div>
   
      ) : (
        <p className="text-center text-gray-500">Nenhum Exame encontrado</p>
      )
      }
    </div>
  );
}

function EachExam({ exam }: { exam: ExamsType }) {
  return (
    <div className="flex justify-between p-2 border-b  rounded-lg mb-1 ">
      <div>
        <p className="font-bold text-lg ">
          {exam.exame.nome} - {_formatPrice(exam.preco)}
        </p>
        <p>Detalhes: {exam.exame.descricao}</p>
        <p>ID do Agendamento: {exam.id_agendamento}</p>
      </div>
      <p data-ative={exam.status} title={exam.status} className="lowercase size-6  data-[ative=ATIVO]:bg-green-300 bg-red-300 rounded-full"></p>
    </div>
  );
}
