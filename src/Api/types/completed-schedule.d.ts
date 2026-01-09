// ==============================================
// TIPOS DE STATUS
// ==============================================

type StatusClinico = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO" | "POR_REAGENDAR";
type StatusFinanceiro = "PENDENTE" | "PAGO" | "CANCELADO" | "ISENTO";
type StatusReembolso = "SEM_REEMBOLSO" | "POR_REEMBOLSAR" | "REEMBOLSADO";

// ==============================================
// PACIENTE
// ==============================================

interface PatientType {
  id: string;
  nome_completo: string;
  data_nascimento?: string;
  numero_identificacao?: string;
  contacto_telefonico?: string;
  email?: string;
  id_sexo: number;
  sexo?: {
    id: string;
    nome: string;
  };
}

// ==============================================
// EXAME (BASE)
// ==============================================

interface ExamsType {
  id: number;
  id_tipo_exame: number;
  id_agendamento: number;
  status: StatusClinico;
  status_financeiro: StatusFinanceiro;
  status_reembolso: StatusReembolso;
  data_agendamento: string;
  hora_agendamento: string;
  observacoes?: string;
  criado_aos: string;
  atualizado_aos: string;
  Tipo_Exame?: {
    id: number;
    nome: string;
    preco: number;
    descricao?: string;
  };
}

// ==============================================
// CONSULTA (BASE)
// ==============================================

interface ConsultasType {
  id: number;
  id_tipo_consulta: number;
  id_agendamento: number;
  status: StatusClinico;
  status_financeiro: StatusFinanceiro;
  status_reembolso: StatusReembolso;
  data_agendamento: string;
  hora_agendamento: string;
  observacoes?: string;
  criado_aos: string;
  preco?:number;
  atualizado_aos: string;
  Tipo_Consulta?: {
    id: number;
    nome: string;
    preco: number;
    descricao?: string;
  };
  id_clinico_alocado?: string | null;
  Clinico_Geral?: {
    id: string;
    nome: string;
    tipo: string;
  };
  Agendamento?: Agendamento;
}

// ==============================================
// EXAME COMPLETADO
// ==============================================

interface CompletedExamType extends ExamsType {
  status: StatusClinico;
  duracao?: number | null;
  id_tecnico_alocado?: string | null;
  Tecnico_Laboratorio?: {
    id: string;
    nome: string;
    tipo: string;
  };
}

// ==============================================
// CONSULTA COMPLETADA
// ==============================================

interface CompletedConsultaType extends ConsultasType {
  // Adicione campos específicos para consultas completadas se necessário
}

// ==============================================
// AGENDAMENTO BASE
// ==============================================

interface ScheduleType {
  id: number;
  id_paciente: number;
  id_unidade_de_saude: string;
  status: string;
  // Estados do bloco conforme documento PDF
  estado_clinico_bloco?: StatusClinico;
  estado_financeiro_bloco?: StatusFinanceiro;
  estado_reembolso_bloco?: StatusReembolso;
}

// ==============================================
// AGENDAMENTO COMPLETADO (COM EXAMES E CONSULTAS)
// ==============================================

interface CompletedScheduleType extends ScheduleType {
  // Status específico para agendamentos completados
  status: "CONCLUIDO";
  criado_aos: string;
  
  // IDs de profissionais alocados
  id_recepcionista?: string | null;
  id_chefe_alocado?: string | null;
  id_clinico_alocado?: string | null; // Para consultas
  
  // Datas
  criado_aos: string;
  atualizado_aos: string;
  
  // Paciente com informações completas
  Paciente: PatientType & {
    sexo: {
      id: number;
      nome: string;
    };
  };
  
  // Itens do agendamento (exames e consultas)
  Exame: CompletedExamType[];
  Consulta: CompletedConsultaType[];
  
  // Status de pagamento do bloco (agora usando o tipo correto)
  status_pagamento: StatusFinanceiro;
  
  // Informações financeiras do bloco
  valor_total?: number;
  valor_pago?: number;
  valor_a_pagar?: number;
  
  // Profissionais alocados
  Chefe_Laboratorio?: {
    id: string;
    nome: string;
    tipo: string;
  };
  
  Recepcionista?: {
    id: string;
    nome: string;
    tipo: string;
  };
  
  Clinico_Geral?: {
    id: string;
    nome: string;
    tipo: string;
  };
}

// ==============================================
// FILTROS PARA AGENDAMENTOS COMPLETADOS
// ==============================================

interface CompletedScheduleFilters {
  searchQuery: string;
  dateFrom?: Date;
  dateTo?: Date;
  // Filtros para exames
  examStatus?: StatusClinico | "TODOS";
  // Filtros para consultas
  consultaStatus?: StatusClinico | "TODOS";
  // Filtros financeiros
  paymentStatus?: StatusFinanceiro | "TODOS";
  // Filtros de reembolso
  reembolsoStatus?: StatusReembolso | "TODOS";
  // Filtros de alocação
  technicianFilter?: "ALOCADO" | "NAO_ALOCADO" | "TODOS";
  chiefFilter?: "ALOCADO" | "NAO_ALOCADO" | "TODOS";
  clinicoFilter?: "ALOCADO" | "NAO_ALOCADO" | "TODOS";
}

// ==============================================
// ESTATÍSTICAS
// ==============================================

interface CompletedScheduleStats {
  // Contagem de agendamentos
  totalSchedules: number;
  
  // Contagem de itens
  totalExams: number;
  totalConsultas: number;
  
  // Status de exames
  pendingExams: number;
  completedExams: number;
  cancelledExams: number;
  porReagendarExams: number;
  emAndamentoExams: number;
  
  // Status de consultas
  pendingConsultas: number;
  completedConsultas: number;
  cancelledConsultas: number;
  porReagendarConsultas: number;
  emAndamentoConsultas: number;
  
  // Financeiro
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  exemptRevenue: number;
  
  // Médias
  averageExamsPerSchedule: number;
  averageConsultasPerSchedule: number;
  averageValuePerSchedule: number;
  
  // Reembolsos
  totalReembolsosPendentes: number;
  totalReembolsosProcessados: number;
  valorTotalReembolsar: number;
}

// ==============================================
// TIPOS ADICIONAIS ÚTEIS
// ==============================================

// Para os campos de alocação
interface CamposAlocacao {
  chefeLaboratorio?: string | null;
  clinicoGeral?: string | null;
}

// Para o histórico
interface ScheduleHistoryType {
  id: number;
  id_agendamento: number;
  acao: string;
  descricao: string;
  usuario: string;
  criado_aos: string;
}