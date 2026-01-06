// ==============================================
// PACIENTE
// ==============================================

interface Paciente {
  id: number;
  nome_completo: string;
  id_sexo: number;
  sexo?: {
    id: number;
    nome: string;
  };
  data_nascimento?: string;
  numero_identificacao?: string;
  contacto_telefonico?: string;
  email?: string;
  criado_aos: Date;
}

// ==============================================
// PROFISSIONAIS DE SAÚDE
// ==============================================

interface ChefeLaboratorio {
  id: string;
  nome: string;
  tipo: string; // "CHEFE_LABORATORIO"
  status?: string;
}

interface TecnicoLaboratorio {
  id: string;
  nome: string;
  email: string;
  hash: string;
  hashedRt: string;
  tipo: string; // "TECNICO_LABORATORIO"
  status: string; // "ATIVO", "INATIVO"
  criado_aos: string;
  atualizado_aos: string;
  id_unidade_saude: string;
  Tecnico_Laboratorio: any[]; // Mantido conforme original
}

// ==============================================
// AGENDAMENTO (BLOCO/PROCESSO)
// ==============================================

interface Agendamento {
  id: number;
  id_paciente: number;
  id_unidade_de_saude: string;
  id_recepcionista: string | null;
  id_chefe_alocado: string | null;
  status: string; // Estado clínico do bloco
  criado_aos: string;
  atualizado_aos: string;
  
  // Relacionamentos
  Paciente: Paciente;
  Chefe_Laboratorio: ChefeLaboratorio | null;
  
  // Consultas dentro deste agendamento
  Consultas?: Consulta[];
}

// ==============================================
// TIPO DE CONSULTA
// ==============================================

interface TipoConsulta {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao_estimada?: number;
  categoria?: string;
}

// ==============================================
// CONSULTA (ITEM INDIVIDUAL)
// ==============================================

interface Consulta {
  id: number;
  id_agendamento: number;
  id_tipo_consulta: number;
  id_clinico_alocado?: string | null;
  
  // Estados conforme documento PDF
  status: string; // "PENDENTE", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO", "POR_REAGENDAR"
  status_financeiro: string; // "PAGO", "NAO_PAGO", "ISENTO"
  status_reembolso: string; // "SEM_REEMBOLSO", "POR_REEMBOLSAR", "REEMBOLSADO"
  
  // Data e hora
  data_agendamento: string;
  hora_agendamento: string;
  
  // Informações adicionais
  observacoes?: string;
  criado_aos: string;
  atualizado_aos: string;
  
  // Relacionamentos
  Tipo_Consulta?: TipoConsulta;
  Agendamento?: Agendamento;
  Clinico_Geral?: {
    id: string;
    nome: string;
    tipo: string;
  };
}

// ==============================================
// CONSULTA EDITÁVEL (PARA FORMULÁRIOS)
// ==============================================

interface EditableConsulta {
  id: number;
  status: string;
  status_financeiro: string;
  status_reembolso: string;
  data_agendamento: string;
  hora_agendamento: string;
  id_tipo_consulta?: number;
  id_clinico_alocado?: string | null;
  observacoes?: string;
}

// ==============================================
// TIPOS DISPONÍVEIS PARA AGENDAMENTO
// ==============================================

interface AvailableConsultasType {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  // Campos opcionais adicionais
  duracao_estimada?: number;
  categoria?: string;
}

// ==============================================
// TIPOS PARA O ESTADO (STATE)
// ==============================================

interface ConsultasType {
  // Pode ser usado para agrupar múltiplas consultas
  consultas: Consulta[];
  isLoading: boolean;
  error: string | null;
}

// ==============================================
// ENUMS PARA VALORES PREDEFINIDOS
// ==============================================

enum ConsultaStatus {
  PENDENTE = "PENDENTE",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  CONCLUIDO = "CONCLUIDO",
  CANCELADO = "CANCELADO",
  POR_REAGENDAR = "POR_REAGENDAR"
}

enum StatusFinanceiro {
  PAGO = "PAGO",
  NAO_PAGO = "NAO_PAGO",
  ISENTO = "ISENTO"
}

enum StatusReembolso {
  SEM_REEMBOLSO = "SEM_REEMBOLSO",
  POR_REEMBOLSAR = "POR_REEMBOLSAR",
  REEMBOLSADO = "REEMBOLSADO"
}