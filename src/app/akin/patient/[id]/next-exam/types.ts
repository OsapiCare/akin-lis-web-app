export interface ResponseData {
  data: {
    Agendamento: {
      atualizado_aos: string; // ISO date string
      criado_aos: string; // ISO date string
      id: number;
      id_chefe_alocado: string | null;
      id_paciente: string;
      id_recepcionista: string | null;
      id_unidade_de_saude: number;
      status: string;
    };
    Tipo_Exame: {
      atualizado_aos: string; // ISO date string
      criado_aos: string; // ISO date string
      descricao: string;
      id: number;
      nome: string;
      preco: number; // currency value
      status: string;
    };
    id_chefe_alocado?:string;
    atualizado_aos: string; // ISO date string
    criado_aos: string; // ISO date string
    data_agendamento: string; // Date in "YYYY-MM-DD" format
    data_formatada: string; // ISO date string
    hora_agendamento: string; // Time in "HH:mm" format
    id: number;
    id_agendamento: number;
    id_tecnico_alocado: string | null;
    id_tipo_exame: number;
    status: string;
    status_pagamento: string;
    _count: {
      Agenda_Tecnico: number;
      Protocolo_Exame: number;
      Utilizacao_Material: number;
    };
  }[];
}