interface CompletedScheduleType extends ScheduleType {
  status: "CONCLUIDO";
  id_recepcionista?: string | null;
  id_chefe_alocado?: string | undefined;
  criado_aos: string;
  atualizado_aos: string;
  Paciente: PatientType & {
    sexo: {
      nome: string;
    };
  };
  Exame: CompletedExamType[];
  status_pagamento: "PENDENTE" | "PAGO" | "CANCELADO";  
}

interface CompletedExamType extends ExamsType {
  status: "PENDENTE" | "CANCELADO" | "CONCLUIDO" | "POR_REAGENDAR";
  duracao?: number | null;
  status_pagamento: "PENDENTE" | "PAGO" | "CANCELADO";
  id_tecnico_alocado: string | undefined;
}

interface CompletedScheduleFilters {
  searchQuery: string;
  dateFrom?: Date;
  dateTo?: Date;
  examStatus?: "PENDENTE" | "CANCELADO" | "CONCLUIDO" | "TODOS";
  paymentStatus?: "PENDENTE" | "PAGO" | "CANCELADO" | "TODOS";
  technicianFilter?: "ALOCADO" | "NAO_ALOCADO" | "TODOS";
}

interface CompletedScheduleStats {
  totalSchedules: number;
  totalExams: number;
  pendingExams: number;
  completedExams: number;
  cancelledExams: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  averageExamsPerSchedule: number;
}
