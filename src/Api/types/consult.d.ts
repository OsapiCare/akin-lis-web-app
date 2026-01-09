interface ConsultasType {
  id: number;
  status: string;
  data_agendamento: string;
  hora_agendamento: string;
  data_formatada: string;
  duracao: string | null;
  status_pagamento: string;
  criado_aos: string;
  atualizado_aos: string;
  id_agendamento: number;
  id_tipo_exame: number;
  id_tecnico_alocado: string | null;
  Tipo_Consulta: Tipo_Consulta;
  Tecnico_Laboratorio: Tecnico_Laboratorio | null;
  Agendamento: Agendamento;
}

interface Tipo_Consulta {
  id: number;
  nome: string;
  preco: number;
}

interface Tecnico_Laboratorio {
  id: string;
  nome: string;
  email: string;
  hash: string;
  hashedRt: string;
  tipo: string;
  status: string;
  criado_aos: string;
  atualizado_aos: string;
  id_unidade_saude: string;
  Tecnico_Laboratorio: any[];
}

interface Agendamento {
  id: number;
  id_paciente: number;
  id_unidade_de_saude: string;
  id_recepcionista: string | null;
  id_chefe_alocado: string | null;
  status: string;
  criado_aos: string;
  atualizado_aos: string;
  Paciente: Paciente;
  Chefe_Laboratorio: Chefe_Laboratorio | null;
}

interface Paciente {
  id: number;
  nome_completo: string;
  id_sexo: number;
}

interface Chefe_Laboratorio {
  id: string;
  nome: string;
  tipo: string;
}

interface AvaliableConsultasType {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
}

interface EditableConsulta {
  id: number;
  status: string;
  data_agendamento: string;
  hora_agendamento: string;
  status_pagamento: string;
  id_tecnico_alocado: string | null;
}