import { useMemo } from "react";

// Interface para tipos de exame
export interface Exam {
  id: number;
  data_agendamento: string;
  hora_agendamento: string;
  status: string;
  status_pagamento: string;
  id_tipo_exame?: string;
  Tipo_Exame?: {
    id: string;
    nome: string;
    preco: number;
  };
  observacoes?: string;
  id_tecnico_alocado?: string;
  categoria?: string;
}

// Interface para bloco de agendamento
export interface ScheduleBlock {
  id: number;
  id_paciente: string;
  criado_aos: string;
  Exame: Exam[];
  id_chefe_alocado?: string;
  Paciente?: {
    nome_completo: string;
    numero_identificacao: string;
    data_nascimento?: string;
    contacto_telefonico?: string;
    email?: string;
  };
}

// Interface para resposta da consolidação
interface ConsolidationResult {
  consolidatedSchedules: ScheduleBlock[];
  originalScheduleCount: number;
  consolidatedScheduleCount: number;
  consolidatedPatients: Set<string>;
}

// Helper para determinar o status geral do bloco
export const getOverallBlockStatus = (exams: Exam[]): string => {
  if (!exams || exams.length === 0) return "SEM_EXAMES";

  // Se todos os exames estão concluídos
  if (exams.every(exam => exam.status === "CONCLUIDO")) {
    return "CONCLUIDO";
  }

  // Se todos os exames estão cancelados
  if (exams.every(exam => exam.status === "CANCELADO")) {
    return "CANCELADO";
  }

  // Se pelo menos um exame está pendente
  if (exams.some(exam => exam.status === "PENDENTE")) {
    return "PENDENTE";
  }

  // Se pelo menos um exame precisa ser reagendado
  if (exams.some(exam => exam.status === "POR_REAGENDAR")) {
    return "POR_REAGENDAR";
  }

  // Se há exames em andamento
  if (exams.some(exam => exam.status === "EM_ANDAMENTO")) {
    return "EM_ANDAMENTO";
  }

  return "INDEFINIDO";
};

// Helper para verificar se o bloco tem fatura paga
export const isBlockPaid = (exams: Exam[]): boolean => {
  if (!exams || exams.length === 0) return false;
  
  // Considera que o bloco está pago se NÃO há nenhum exame com pagamento pendente
  return !exams.some(exam => exam.status_pagamento === "PENDENTE");
};

// Helper para calcular valor total do bloco
export const calculateBlockTotal = (exams: Exam[]): number => {
  if (!exams) return 0;
  return exams.reduce((sum, exam) => sum + (exam.Tipo_Exame?.preco || 0), 0);
};

// Verifica se um bloco pode receber novos exames
export const canAcceptNewExams = (schedule: ScheduleBlock): boolean => {
  const overallStatus = getOverallBlockStatus(schedule.Exame);
  
  // O bloco pode aceitar novos exames se estiver PENDENTE ou POR_REAGENDAR
  return overallStatus === "PENDENTE" || overallStatus === "POR_REAGENDAR";
};

// Verifica se todos os exames estão concluídos ou cancelados
export const isBlockCompletedOrCancelled = (exams: Exam[]): boolean => {
  if (!exams || exams.length === 0) return false;
  
  return exams.every(exam => 
    exam.status === "CONCLUIDO" || exam.status === "CANCELADO"
  );
};

// Lógica principal para determinar onde adicionar novos exames
export const determineScheduleForNewExams = (
  patientId: string,
  existingSchedules: ScheduleBlock[],
  newExams: Exam[]
): {
  targetScheduleId: number | null;
  shouldCreateNewSchedule: boolean;
  shouldUpdatePayment: boolean;
  reason: string;
} => {
  // Filtrar blocos do mesmo paciente
  const patientSchedules = existingSchedules.filter(
    schedule => schedule.id_paciente === patientId
  );

  // Se não há blocos existentes, criar novo
  if (patientSchedules.length === 0) {
    return {
      targetScheduleId: null,
      shouldCreateNewSchedule: true,
      shouldUpdatePayment: false,
      reason: "Primeiro processo para este paciente"
    };
  }

  // Buscar blocos que podem aceitar novos exames (PENDENTE ou POR_REAGENDAR)
  const eligibleSchedules = patientSchedules.filter(canAcceptNewExams);

  // Se há blocos elegíveis
  if (eligibleSchedules.length > 0) {
    // Usar o bloco mais recente (com base na data de criação)
    const mostRecentSchedule = eligibleSchedules.sort((a, b) => 
      new Date(b.criado_aos).getTime() - new Date(a.criado_aos).getTime()
    )[0];

    const isPaid = isBlockPaid(mostRecentSchedule.Exame);

    return {
      targetScheduleId: mostRecentSchedule.id,
      shouldCreateNewSchedule: false,
      shouldUpdatePayment: !isPaid, // Atualizar pagamento se já estiver pago
      reason: isPaid 
        ? "Processo existente pago, nova fatura será criada" 
        : "Processo existente com fatura pendente"
    };
  }

  // Se todos os blocos estão concluídos/cancelados, criar novo
  if (patientSchedules.every(schedule => 
    isBlockCompletedOrCancelled(schedule.Exame)
  )) {
    return {
      targetScheduleId: null,
      shouldCreateNewSchedule: true,
      shouldUpdatePayment: false,
      reason: "Todos os processos anteriores estão concluídos/cancelados"
    };
  }

  // Caso padrão: criar novo bloco
  return {
    targetScheduleId: null,
    shouldCreateNewSchedule: true,
    shouldUpdatePayment: false,
    reason: "Nenhum processo elegível encontrado"
  };
};

// Função para consolidar blocos de agendamento por paciente
export const consolidatePatientSchedules = (
  schedules: ScheduleBlock[]
): ConsolidationResult => {
  const patientScheduleMap = new Map<string, ScheduleBlock[]>();
  const consolidatedSchedules: ScheduleBlock[] = [];
  const consolidatedPatients = new Set<string>();

  // Agrupar agendamentos por paciente
  schedules.forEach(schedule => {
    const patientId = schedule.id_paciente;
    if (!patientScheduleMap.has(patientId)) {
      patientScheduleMap.set(patientId, []);
    }
    patientScheduleMap.get(patientId)!.push(schedule);
  });

  // Processar cada paciente
  patientScheduleMap.forEach((patientSchedules, patientId) => {
    // Ordenar por data de criação (mais recente primeiro)
    const sortedSchedules = patientSchedules.sort((a, b) => 
      new Date(b.criado_aos).getTime() - new Date(a.criado_aos).getTime()
    );

    // Encontrar blocos que podem ser consolidados
    const activeSchedules = sortedSchedules.filter(schedule => 
      canAcceptNewExams(schedule)
    );

    if (activeSchedules.length > 0) {
      // Usar o bloco mais recente ativo
      const mainSchedule = { ...activeSchedules[0] };
      
      // Adicionar exames de outros blocos ativos (exceto o principal)
      activeSchedules.slice(1).forEach(schedule => {
        mainSchedule.Exame = [...mainSchedule.Exame, ...schedule.Exame];
      });

      // Adicionar blocos concluídos/cancelados como separados
      const completedCancelledSchedules = sortedSchedules.filter(schedule => 
        !canAcceptNewExams(schedule) && !isBlockCompletedOrCancelled(schedule.Exame)
      );

      consolidatedSchedules.push(mainSchedule);
      completedCancelledSchedules.forEach(schedule => {
        consolidatedSchedules.push(schedule);
      });

      // Adicionar blocos completamente finalizados
      sortedSchedules.filter(schedule => 
        isBlockCompletedOrCancelled(schedule.Exame)
      ).forEach(schedule => {
        consolidatedSchedules.push(schedule);
      });
    } else {
      // Se não há blocos ativos, manter todos como estão
      sortedSchedules.forEach(schedule => {
        consolidatedSchedules.push(schedule);
      });
    }

    consolidatedPatients.add(patientId);
  });

  return {
    consolidatedSchedules,
    originalScheduleCount: schedules.length,
    consolidatedScheduleCount: consolidatedSchedules.length,
    consolidatedPatients
  };
};

// Função para simular adição de novos exames a um paciente
export const simulateAddExamsToPatient = (
  patientId: string,
  existingSchedules: ScheduleBlock[],
  newExams: Exam[]
): {
  action: "CREATE_NEW" | "ADD_TO_EXISTING" | "CREATE_NEW_WITH_PAYMENT";
  scheduleId?: number;
  totalValue: number;
  previousPaymentStatus: string;
  newPaymentStatus: string;
  message: string;
} => {
  const determination = determineScheduleForNewExams(
    patientId,
    existingSchedules,
    newExams
  );

  if (determination.shouldCreateNewSchedule) {
    return {
      action: "CREATE_NEW",
      totalValue: calculateBlockTotal(newExams),
      previousPaymentStatus: "N/A",
      newPaymentStatus: "PENDENTE",
      message: `Novo processo criado: ${determination.reason}`
    };
  }

  if (determination.targetScheduleId) {
    const targetSchedule = existingSchedules.find(
      s => s.id === determination.targetScheduleId
    );
    
    if (targetSchedule) {
      const isPaid = isBlockPaid(targetSchedule.Exame);
      const previousTotal = calculateBlockTotal(targetSchedule.Exame);
      const newTotal = previousTotal + calculateBlockTotal(newExams);

      if (isPaid && determination.shouldUpdatePayment) {
        return {
          action: "CREATE_NEW_WITH_PAYMENT",
          scheduleId: targetSchedule.id,
          totalValue: newTotal,
          previousPaymentStatus: "PAGO",
          newPaymentStatus: "PENDENTE",
          message: `Nova fatura criada para processo existente: ${determination.reason}`
        };
      } else {
        return {
          action: "ADD_TO_EXISTING",
          scheduleId: targetSchedule.id,
          totalValue: newTotal,
          previousPaymentStatus: isPaid ? "PAGO" : "PENDENTE",
          newPaymentStatus: "PENDENTE",
          message: `Exames adicionados ao processo existente: ${determination.reason}`
        };
      }
    }
  }

  // Fallback
  return {
    action: "CREATE_NEW",
    totalValue: calculateBlockTotal(newExams),
    previousPaymentStatus: "N/A",
    newPaymentStatus: "PENDENTE",
    message: "Novo processo criado (fallback)"
  };
};

// Hook personalizado para usar a lógica de consolidação
export const useConsolidatedSchedules = (schedules: ScheduleBlock[]) => {
  return useMemo(() => {
    const result = consolidatePatientSchedules(schedules);
    
    return {
      schedules: result.consolidatedSchedules,
      statistics: {
        originalCount: result.originalScheduleCount,
        consolidatedCount: result.consolidatedScheduleCount,
        reduction: result.originalScheduleCount - result.consolidatedScheduleCount,
        reductionPercentage: result.originalScheduleCount > 0 
          ? ((result.originalScheduleCount - result.consolidatedScheduleCount) / result.originalScheduleCount * 100).toFixed(1)
          : 0,
        uniquePatients: result.consolidatedPatients.size
      }
    };
  }, [schedules]);
};