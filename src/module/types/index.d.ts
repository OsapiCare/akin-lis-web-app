
 interface IExamProps {
  id: string | number;
  nome: string;
  descricao?: string;
  preco?: string;
  status?: "DISPONÍVEL" | "INDISPONÍVEL"
}

export type Patient = {
  id: string;
  nome_completo: string;
  data_nascimento?: string;
  sexo: {
    nome: string
  };
  contacto_telefonico?: string;
  numero_identificacao?: string
};

export type GenderOption = {
  id: number;
  value: string
};


// Em types/index.ts ou similar
export interface IItemTipoProps {
  id: string;
  nome: string;
  preco: number;
  tipo: "EXAME" | "CONSULTA"; // Novo campo
  descricao?: string;
  duracao_estimada?: number;
  categoria?: string;
}

export interface IPaciente {
  id: string;
  nome_completo: string;
  numero_identificacao: string;
  data_nascimento?: string;
  contacto_telefonico?: string;
  email?: string;
  sexo:sexoType;
}

export type ItemAgendamentoType = {
  item: IItemTipoProps | null; // Pode ser exame ou consulta
  tipo: "EXAME" | "CONSULTA";
  data: Date | null;
  hora: string;
};

interface sexoType {
  nome: string;
}

export type ProcessoAgendamentoPayload = {
  id_paciente: string;
  id_unidade_de_saude: number;
  itens: Array<{
    id_tipo_item: string;
    tipo: "EXAME" | "CONSULTA";
    data_agendamento: string;
    hora_agendamento: string;
  }>;
};