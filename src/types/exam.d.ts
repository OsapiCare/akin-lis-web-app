interface ExamsType {
  id: number;
  preco: number;
  status: string;
  id_agendamento: number;
  id_tipo_Exame: number;
  exame: Exame;
}

interface Exame {
  id: number;
  nome: string;
  descricao: string;
}

interface AvaliableExamsType {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
}