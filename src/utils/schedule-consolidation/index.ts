import { useMemo } from "react";

// Interfaces atualizadas conforme o PDF

// Interface para Item de Agendamento (pode ser Exame ou Consulta)
export interface ItemAgendamento {
  id: number;
  tipo: "EXAME" | "CONSULTA"; // Novo campo para diferenciar
  data_agendamento: string;
  hora_agendamento: string;
  
  // Estados conforme PDF
  estado_clinico: "PENDENTE" | "EM_ANDAMENTO" | "POR_REAGENDAR" | "CONCLUIDO" | "CANCELADO";
  estado_financeiro: "ISENTO" | "NAO_PAGO" | "PAGO";
  estado_reembolso: "SEM_REEMBOLSO" | "POR_REEMBOLSAR" | "REEMBOLSADO";
  
  // Campos específicos por tipo
  id_tipo_item?: string; // id_tipo_exame ou id_tipo_consulta
  
  Tipo_Exame?: {
    id: string;
    nome: string;
    preco: number;
  };
  
  Tipo_Consulta?: {
    id: string;
    nome: string;
    preco: number;
  };
  
  observacoes?: string;
  id_profissional_alocado?: string; // pode ser técnico, clínico, enfermeiro
  categoria?: string;
}

// Interface para Processo de Agendamento
export interface ProcessoAgendamento {
  id: number;
  id_paciente: string;
  criado_aos: string;
  
  // Estados do Processo conforme PDF
  estado_clinico: "ATIVO" | "PARCIALMENTE_CONCLUIDO" | "POR_REAGENDAR" | "CONCLUIDO" | "CANCELADO";
  estado_financeiro: "ISENTO" | "NAO_PAGO" | "PAGO_PARCIALMENTE" | "PAGO";
  estado_reembolso: "SEM_REEMBOLSO" | "POR_REEMBOLSAR" | "REEMBOLSADO";
  
  // Campos financeiros
  valor_total: number;
  valor_pago: number;
  valor_a_pagar: number;
  
  // Itens do processo (agora podem ser exames OU consultas)
  Itens: ItemAgendamento[];
  
  // Campos de alocação conforme PDF
  id_chefe_laboratorio_alocado?: string; // Para exames
  id_clinico_geral_alocado?: string; // Para consultas
  
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
  consolidatedSchedules: ProcessoAgendamento[];
  originalScheduleCount: number;
  consolidatedScheduleCount: number;
  consolidatedPatients: Set<string>;
}

// ========== HELPERS ATUALIZADOS ==========

// Helper para calcular preço do item (agora suporta Exame ou Consulta)
const getItemPrice = (item: ItemAgendamento): number => {
  if (item.tipo === "EXAME" && item.Tipo_Exame) {
    return item.Tipo_Exame.preco;
  }
  if (item.tipo === "CONSULTA" && item.Tipo_Consulta) {
    return item.Tipo_Consulta.preco;
  }
  return 0;
};

// Helper para determinar o estado clínico geral do processo (regras do PDF)
export const getOverallProcessStatus = (items: ItemAgendamento[]): ProcessoAgendamento["estado_clinico"] => {
  if (!items || items.length === 0) return "CANCELADO";

  // 1. Verificar Cancelado (todos os itens cancelados)
  if (items.every(item => item.estado_clinico === "CANCELADO")) {
    return "CANCELADO";
  }

  // 2. Verificar Concluído (todos os itens concluídos)
  if (items.every(item => item.estado_clinico === "CONCLUIDO")) {
    return "CONCLUIDO";
  }

  // 3. Verificar Por Reagendar (nenhum pendente/em andamento/concluído, pelo menos um por reagendar)
  const hasPendente = items.some(item => item.estado_clinico === "PENDENTE");
  const hasEmAndamento = items.some(item => item.estado_clinico === "EM_ANDAMENTO");
  const hasConcluido = items.some(item => item.estado_clinico === "CONCLUIDO");
  const hasPorReagendar = items.some(item => item.estado_clinico === "POR_REAGENDAR");
  
  if (!hasPendente && !hasEmAndamento && !hasConcluido && hasPorReagendar) {
    return "POR_REAGENDAR";
  }

  // 4. Verificar Parcialmente Concluído (pelo menos um concluído e um não concluído)
  const hasAnyConcluido = items.some(item => item.estado_clinico === "CONCLUIDO");
  const hasAnyNaoConcluido = items.some(item => 
    item.estado_clinico !== "CONCLUIDO" && item.estado_clinico !== "CANCELADO"
  );
  
  if (hasAnyConcluido && hasAnyNaoConcluido) {
    return "PARCIALMENTE_CONCLUIDO";
  }

  // 5. Verificar Ativo (pelo menos um pendente ou em andamento)
  if (hasPendente || hasEmAndamento) {
    return "ATIVO";
  }

  return "CANCELADO"; // fallback
};

// Helper para verificar se o processo tem fatura paga (baseado nos itens)
export const isProcessPaid = (items: ItemAgendamento[]): boolean => {
  if (!items || items.length === 0) return true; // Sem itens = considerado pago
  
  // Processo considerado pago se:
  // 1. Não há itens com estado financeiro = "NAO_PAGO"
  // 2. Itens ISENTOS não impedem o estado PAGO conforme PDF
  return !items.some(item => item.estado_financeiro === "NAO_PAGO");
};

// Helper para calcular estado financeiro do processo (regras do PDF)
export const calculateFinancialStatus = (items: ItemAgendamento[]): ProcessoAgendamento["estado_financeiro"] => {
  if (!items || items.length === 0) return "ISENTO";

  // Calcular totais
  let totalDevido = 0;
  let totalPago = 0;
  
  items.forEach(item => {
    const preco = getItemPrice(item);
    
    if (item.estado_financeiro === "PAGO") {
      totalPago += preco;
      totalDevido += preco;
    } else if (item.estado_financeiro === "NAO_PAGO") {
      totalDevido += preco;
    }
    // Itens ISENTOS não contam para o total devido
  });

  // Aplicar regras do PDF
  if (totalDevido === 0) {
    return "ISENTO";
  }
  
  if (totalPago === 0) {
    return "NAO_PAGO";
  }
  
  if (totalPago > 0 && totalPago < totalDevido) {
    return "PAGO_PARCIALMENTE";
  }
  
  if (totalDevido > 0 && totalPago === totalDevido) {
    return "PAGO";
  }
  
  return "NAO_PAGO"; // fallback
};

// Helper para calcular estado de reembolso do processo (regras do PDF)
export const calculateReimbursementStatus = (items: ItemAgendamento[]): ProcessoAgendamento["estado_reembolso"] => {
  if (!items || items.length === 0) return "SEM_REEMBOLSO";

  // Verificar se há itens pagos que foram cancelados (devem ser reembolsados)
  const hasItemsParaReembolsar = items.some(item => 
    item.estado_financeiro === "PAGO" && 
    item.estado_clinico === "CANCELADO" &&
    item.estado_reembolso !== "REEMBOLSADO"
  );

  const allReembolsados = items.every(item => 
    item.estado_reembolso !== "POR_REEMBOLSAR"
  );

  if (hasItemsParaReembolsar) {
    return "POR_REEMBOLSAR";
  }
  
  if (allReembolsados) {
    return "SEM_REEMBOLSO";
  }
  
  return "SEM_REEMBOLSO"; // fallback
};

// Verifica se um processo pode receber novos itens
export const canAcceptNewItems = (process: ProcessoAgendamento): boolean => {
  const overallStatus = process.estado_clinico;
  
  // O processo pode aceitar novos itens se estiver ATIVO, PARCIALMENTE_CONCLUIDO ou POR_REAGENDAR
  // Mas conforme PDF, precisa verificar os itens individuais
  const hasPendente = process.Itens.some(item => item.estado_clinico === "PENDENTE");
  const hasPorReagendar = process.Itens.some(item => item.estado_clinico === "POR_REAGENDAR");
  
  return hasPendente || hasPorReagendar;
};

// Verifica se todos os itens estão concluídos ou cancelados
export const isProcessCompletedOrCancelled = (items: ItemAgendamento[]): boolean => {
  if (!items || items.length === 0) return true;
  
  return items.every(item => 
    item.estado_clinico === "CONCLUIDO" || item.estado_clinico === "CANCELADO"
  );
};

// Valida se um item pode ser iniciado (regra do PDF: só se PAGO ou ISENTO)
export const canStartItem = (item: ItemAgendamento): boolean => {
  return item.estado_financeiro === "PAGO" || item.estado_financeiro === "ISENTO";
};

// ========== LÓGICA PRINCIPAL ATUALIZADA ==========

// Lógica principal para determinar onde adicionar novos itens
export const determineScheduleForNewItems = (
  patientId: string,
  existingProcesses: ProcessoAgendamento[],
  newItems: ItemAgendamento[]
): {
  targetProcessId: number | null;
  shouldCreateNewProcess: boolean;
  shouldUpdatePayment: boolean;
  reason: string;
} => {
  // Filtrar processos do mesmo paciente
  const patientProcesses = existingProcesses.filter(
    process => process.id_paciente === patientId
  );

  // Se não há processos existentes, criar novo
  if (patientProcesses.length === 0) {
    return {
      targetProcessId: null,
      shouldCreateNewProcess: true,
      shouldUpdatePayment: false,
      reason: "Primeiro processo para este paciente"
    };
  }

  // Buscar processos que podem aceitar novos itens
  const eligibleProcesses = patientProcesses.filter(canAcceptNewItems);

  // Se há processos elegíveis
  if (eligibleProcesses.length > 0) {
    // Usar o processo mais recente
    const mostRecentProcess = eligibleProcesses.sort((a, b) => 
      new Date(b.criado_aos).getTime() - new Date(a.criado_aos).getTime()
    )[0];

    const isPaid = isProcessPaid(mostRecentProcess.Itens);

    return {
      targetProcessId: mostRecentProcess.id,
      shouldCreateNewProcess: false,
      shouldUpdatePayment: !isPaid,
      reason: isPaid 
        ? "Processo existente pago, nova fatura será criada" 
        : "Processo existente com fatura pendente"
    };
  }

  // Se todos os processos estão concluídos/cancelados, criar novo
  if (patientProcesses.every(process => 
    isProcessCompletedOrCancelled(process.Itens)
  )) {
    return {
      targetProcessId: null,
      shouldCreateNewProcess: true,
      shouldUpdatePayment: false,
      reason: "Todos os processos anteriores estão concluídos/cancelados"
    };
  }

  // Caso padrão: criar novo processo
  return {
    targetProcessId: null,
    shouldCreateNewProcess: true,
    shouldUpdatePayment: false,
    reason: "Nenhum processo elegível encontrado"
  };
};

// ========== FUNÇÕES DE CONSOLIDAÇÃO ATUALIZADAS ==========

// Função para consolidar processos de agendamento por paciente
export const consolidatePatientProcesses = (
  processes: ProcessoAgendamento[]
): ConsolidationResult => {
  const patientProcessMap = new Map<string, ProcessoAgendamento[]>();
  const consolidatedProcesses: ProcessoAgendamento[] = [];
  const consolidatedPatients = new Set<string>();

  // Agrupar processos por paciente
  processes.forEach(process => {
    const patientId = process.id_paciente;
    if (!patientProcessMap.has(patientId)) {
      patientProcessMap.set(patientId, []);
    }
    patientProcessMap.get(patientId)!.push(process);
  });

  // Processar cada paciente
  patientProcessMap.forEach((patientProcesses, patientId) => {
    // Ordenar por data de criação (mais recente primeiro)
    const sortedProcesses = patientProcesses.sort((a, b) => 
      new Date(b.criado_aos).getTime() - new Date(a.criado_aos).getTime()
    );

    // Encontrar processos que podem ser consolidados
    const activeProcesses = sortedProcesses.filter(canAcceptNewItems);

    if (activeProcesses.length > 0) {
      // Usar o processo mais recente ativo
      const mainProcess = { ...activeProcesses[0] };
      
      // Adicionar itens de outros processos ativos
      activeProcesses.slice(1).forEach(process => {
        mainProcess.Itens = [...mainProcess.Itens, ...process.Itens];
      });

      // Recalcular estados após consolidação
      mainProcess.estado_clinico = getOverallProcessStatus(mainProcess.Itens);
      mainProcess.estado_financeiro = calculateFinancialStatus(mainProcess.Itens);
      mainProcess.estado_reembolso = calculateReimbursementStatus(mainProcess.Itens);
      
      // Recalcular valores
      mainProcess.valor_total = mainProcess.Itens.reduce((sum, item) => sum + getItemPrice(item), 0);
      mainProcess.valor_pago = mainProcess.Itens
        .filter(item => item.estado_financeiro === "PAGO")
        .reduce((sum, item) => sum + getItemPrice(item), 0);
      mainProcess.valor_a_pagar = mainProcess.valor_total - mainProcess.valor_pago;

      // Adicionar processos concluídos/cancelados como separados
      const completedCancelledProcesses = sortedProcesses.filter(process => 
        !canAcceptNewItems(process) && !isProcessCompletedOrCancelled(process.Itens)
      );

      consolidatedProcesses.push(mainProcess);
      completedCancelledProcesses.forEach(process => {
        consolidatedProcesses.push(process);
      });

      // Adicionar processos completamente finalizados
      sortedProcesses.filter(process => 
        isProcessCompletedOrCancelled(process.Itens)
      ).forEach(process => {
        consolidatedProcesses.push(process);
      });
    } else {
      // Se não há processos ativos, manter todos como estão
      sortedProcesses.forEach(process => {
        consolidatedProcesses.push(process);
      });
    }

    consolidatedPatients.add(patientId);
  });

  return {
    consolidatedSchedules: consolidatedProcesses,
    originalScheduleCount: processes.length,
    consolidatedScheduleCount: consolidatedProcesses.length,
    consolidatedPatients
  };
};

// Função para simular adição de novos itens a um paciente
export const simulateAddItemsToPatient = (
  patientId: string,
  existingProcesses: ProcessoAgendamento[],
  newItems: ItemAgendamento[]
): {
  action: "CREATE_NEW" | "ADD_TO_EXISTING" | "CREATE_NEW_WITH_PAYMENT";
  processId?: number;
  totalValue: number;
  previousPaymentStatus: string;
  newPaymentStatus: string;
  message: string;
} => {
  const determination = determineScheduleForNewItems(
    patientId,
    existingProcesses,
    newItems
  );

  const newItemsTotal = newItems.reduce((sum, item) => sum + getItemPrice(item), 0);

  if (determination.shouldCreateNewProcess) {
    return {
      action: "CREATE_NEW",
      totalValue: newItemsTotal,
      previousPaymentStatus: "N/A",
      newPaymentStatus: "PENDENTE",
      message: `Novo processo criado: ${determination.reason}`
    };
  }

  if (determination.targetProcessId) {
    const targetProcess = existingProcesses.find(
      p => p.id === determination.targetProcessId
    );
    
    if (targetProcess) {
      const isPaid = isProcessPaid(targetProcess.Itens);
      const previousTotal = targetProcess.valor_total;
      const newTotal = previousTotal + newItemsTotal;

      if (isPaid && determination.shouldUpdatePayment) {
        return {
          action: "CREATE_NEW_WITH_PAYMENT",
          processId: targetProcess.id,
          totalValue: newTotal,
          previousPaymentStatus: "PAGO",
          newPaymentStatus: "PENDENTE",
          message: `Nova fatura criada para processo existente: ${determination.reason}`
        };
      } else {
        return {
          action: "ADD_TO_EXISTING",
          processId: targetProcess.id,
          totalValue: newTotal,
          previousPaymentStatus: isPaid ? "PAGO" : "PENDENTE",
          newPaymentStatus: "PENDENTE",
          message: `Itens adicionados ao processo existente: ${determination.reason}`
        };
      }
    }
  }

  // Fallback
  return {
    action: "CREATE_NEW",
    totalValue: newItemsTotal,
    previousPaymentStatus: "N/A",
    newPaymentStatus: "PENDENTE",
    message: "Novo processo criado (fallback)"
  };
};

// Hook personalizado para usar a lógica de consolidação
export const useConsolidatedProcesses = (processes: ProcessoAgendamento[]) => {
  return useMemo(() => {
    const result = consolidatePatientProcesses(processes);
    
    return {
      processes: result.consolidatedSchedules,
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
  }, [processes]);
};

// Função auxiliar para filtrar itens por tipo
export const filterItemsByType = (process: ProcessoAgendamento, tipo: "EXAME" | "CONSULTA"): ItemAgendamento[] => {
  return process.Itens.filter(item => item.tipo === tipo);
};

// Função para obter profissional responsável com base no tipo de item
export const getResponsibleProfessional = (process: ProcessoAgendamento, tipo: "EXAME" | "CONSULTA"): string | undefined => {
  if (tipo === "EXAME") {
    return process.id_chefe_laboratorio_alocado;
  }
  if (tipo === "CONSULTA") {
    return process.id_clinico_geral_alocado;
  }
  return undefined;
};