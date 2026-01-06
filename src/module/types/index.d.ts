// ==============================================
// ENUMS E TIPOS BÁSICOS
// ==============================================

export type StatusItem = "DISPONÍVEL" | "INDISPONÍVEL";
export type TipoItem = "EXAME" | "CONSULTA";
export type StatusClinico = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO" | "POR_REAGENDAR";
export type StatusFinanceiro = "PENDENTE" | "PAGO" | "CANCELADO" | "ISENTO";
export type StatusReembolso = "SEM_REEMBOLSO" | "POR_REEMBOLSAR" | "REEMBOLSADO";

// ==============================================
// SEXO/GÊNERO
// ==============================================

export interface SexoType {
  id: string;
  nome: string;
  descricao?: string;
}

export interface GenderOption {
  id: number;
  value: string;
  label?: string; // Para uso em selects
}

// ==============================================
// PACIENTE
// ==============================================

export interface IPaciente {
  id: string;
  nome_completo: string;
  numero_identificacao: string;
  data_nascimento?: string;
  contacto_telefonico?: string;
  email?: string;
  sexo: SexoType;
  endereco?: string;
  criado_aos: Date;
  atualizado_aos?: string;
}

export type Patient = {
  id: string;
  nome_completo: string;
  data_nascimento?: string;
  sexo?: {
    id:string;
    nome: string;
  };
  contacto_telefonico?: string;
  numero_identificacao?: string;
  email?: string;
  criado_aos: Date;
};

// ==============================================
// TIPOS DE ITENS (EXAMES E CONSULTAS)
// ==============================================

export interface IItemTipoProps {
  id: string;
  nome: string;
  preco: number;
  tipo: TipoItem; // "EXAME" | "CONSULTA"
  descricao?: string;
  duracao_estimada?: number; // em minutos
  categoria?: string;
  status?: StatusItem; // "DISPONÍVEL" | "INDISPONÍVEL"
  id_unidade_saude?: string;
  criado_aos?: string;
  atualizado_aos?: string;
}

export interface IExamProps {
  id: string | number;
  nome: string;
  descricao?: string;
  preco?: string; // String para formatação
  status?: StatusItem; // "DISPONÍVEL" | "INDISPONÍVEL"
  tipo?: TipoItem; // Sempre "EXAME"
  duracao_estimada?: number;
  categoria?: string;
}

// Interface específica para ConsultaTipoProps se necessário
export interface IConsultaTipoProps extends Omit<IItemTipoProps, 'tipo'> {
  tipo: "CONSULTA";
  // Campos específicos de consulta podem ser adicionados aqui
}

// ==============================================
// ITEM DE AGENDAMENTO (INDIVIDUAL)
// ==============================================

export type ItemAgendamentoType = {
  item: IItemTipoProps | null; // Pode ser exame ou consulta
  tipo: TipoItem; // "EXAME" | "CONSULTA"
  data: Date | null;
  hora: string;
  observacoes?: string;
  // Campos para edição
  status?: StatusClinico;
  status_financeiro?: StatusFinanceiro;
  status_reembolso?: StatusReembolso;
};

// ==============================================
// PAYLOAD PARA PROCESSO DE AGENDAMENTO
// ==============================================

export type ProcessoAgendamentoPayload = {
  id_paciente: string;
  id_unidade_de_saude: number;
  id_recepcionista?: string; // Opcional
  itens: Array<{
    id_tipo_item: string;
    tipo: TipoItem; // "EXAME" | "CONSULTA"
    data_agendamento: string; // Formato ISO ou YYYY-MM-DD
    hora_agendamento: string; // Formato HH:mm
    observacoes?: string;
  }>;
  observacoes_gerais?: string;
};

// ==============================================
// AGENDAMENTO COMPLETO (RESPOSTA DO BACKEND)
// ==============================================

export interface IAgendamentoResponse {
  id: number;
  id_paciente: string;
  id_unidade_de_saude: number;
  id_recepcionista?: string | null;
  id_chefe_alocado?: string | null;
  id_clinico_alocado?: string | null;
  
  // Estados do bloco
  status: StatusClinico;
  status_financeiro: StatusFinanceiro;
  status_reembolso: StatusReembolso;
  
  // Datas
  criado_aos: string;
  atualizado_aos: string;
  
  // Valores financeiros
  valor_total?: number;
  valor_pago?: number;
  valor_a_pagar?: number;
  
  // Relacionamentos
  Paciente: Patient;
  Exames?: Array<{
    id: number;
    id_tipo_exame: string;
    status: StatusClinico;
    status_financeiro: StatusFinanceiro;
    status_reembolso: StatusReembolso;
    data_agendamento: string;
    hora_agendamento: string;
    Tipo_Exame: IItemTipoProps;
    id_tecnico_alocado?: string | null;
  }>;
  
  Consultas?: Array<{
    id: number;
    id_tipo_consulta: string;
    status: StatusClinico;
    status_financeiro: StatusFinanceiro;
    status_reembolso: StatusReembolso;
    data_agendamento: string;
    hora_agendamento: string;
    Tipo_Consulta: IItemTipoProps;
    id_clinico_alocado?: string | null;
  }>;
}

// ==============================================
// TIPOS PARA FORMS E ESTADOS
// ==============================================

export interface IAgendamentoFormState {
  paciente: IPaciente | null;
  unidadeSaude: number | null;
  itens: ItemAgendamentoType[];
  observacoes?: string;
}

export interface IEdicaoItemAgendamento {
  id: number;
  tipo: TipoItem; // "EXAME" | "CONSULTA"
  data_agendamento: string;
  hora_agendamento: string;
  status: StatusClinico;
  status_financeiro: StatusFinanceiro;
  status_reembolso: StatusReembolso;
  observacoes?: string;
  id_tipo_item: string;
  // Campos específicos de alocação
  id_tecnico_alocado?: string | null; // Para exames
  id_clinico_alocado?: string | null; // Para consultas
}

// ==============================================
// TIPOS PARA FILTROS E BUSCAS
// ==============================================

export interface IFiltroAgendamentos {
  searchQuery: string;
  dateFrom?: Date;
  dateTo?: Date;
  pacienteId?: string;
  unidadeSaudeId?: number;
  status?: StatusClinico | "TODOS";
  statusFinanceiro?: StatusFinanceiro | "TODOS";
  tipoItem?: TipoItem | "TODOS";
}

// ==============================================
// TIPOS PARA ESTATÍSTICAS
// ==============================================

export interface IEstatisticasAgendamento {
  totalAgendamentos: number;
  agendamentosHoje: number;
  totalExames: number;
  totalConsultas: number;
  receitaTotal: number;
  receitaPendente: number;
  mediaItensPorAgendamento: number;
  distribuicaoStatus: Record<StatusClinico, number>;
  distribuicaoTipo: Record<TipoItem, number>;
}