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
interface ConsultaType {
 id:number;
 id_paciente: string;
  id_unidade_de_saude: number;
  data_agendamento: string;
  hora_agendamento: string;
  status: StatusClinico;
  status_pagamento?: StatusFinanceiro;
  id_tecnico_alocado: number|null;//after remove null
  data_pagamento: string|null //after remove null;
  Exame: ExamsType[];
  Paciente:PatientType
  Consulta: ConsultasType[];
}
