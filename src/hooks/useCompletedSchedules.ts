import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { _axios } from "@/Api/axios.config";
import { ___showErrorToastNotification } from "@/lib/sonner";

export function useCompletedSchedules() {
  const {
    data: schedulesData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['completed-schedules'],
    queryFn: async () => {
      try {
        const response = await _axios.get<CompletedScheduleType[]>("/schedulings/concluded");
        return response.data;
      } catch (error) {
        ___showErrorToastNotification({
          message: "Erro ao carregar agendamentos concluídos. Tente novamente.",
        });
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });

  const schedules = useMemo(() => schedulesData || [], [schedulesData]);

  // Calculate comprehensive statistics
  const statistics = useMemo((): CompletedScheduleStats => {
    const totalSchedules = schedules.length;
    const allExams = schedules.flatMap(schedule => schedule.Exame || []);
    const totalExams = allExams.length;

    const pendingExams = allExams.filter(exam => exam.status === "PENDENTE").length;
    const completedExams = allExams.filter(exam => exam.status === "CONCLUIDO").length;
    const cancelledExams = allExams.filter(exam => exam.status === "CANCELADO").length;

    const totalRevenue = allExams.reduce((total, exam) =>
      total + (exam.Tipo_Exame?.preco || 0), 0
    );

    const paidRevenue = allExams
      .filter(exam => exam.status_pagamento === "PAGO")
      .reduce((total, exam) => total + (exam.Tipo_Exame?.preco || 0), 0);

    const pendingRevenue = allExams
      .filter(exam => exam.status_pagamento === "PENDENTE")
      .reduce((total, exam) => total + (exam.Tipo_Exame?.preco || 0), 0);

    const averageExamsPerSchedule = totalSchedules > 0 ? totalExams / totalSchedules : 0;

    return {
      totalSchedules,
      totalExams,
      pendingExams,
      completedExams,
      cancelledExams,
      totalConsultas: 0,           // valor padrão
      pendingConsultas: 0,
      completedConsultas: 0,
      cancelledConsultas: 0,
      porReagendarExams: 0,
      emAndamentoExams: 0,
      porReagendarConsultas: 0,
      emAndamentoConsultas: 0,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      exemptRevenue: 0,
      averageExamsPerSchedule,
      averageConsultasPerSchedule: 0,
      averageValuePerSchedule: 0,
      totalReembolsosPendentes: 0,
      totalReembolsosProcessados: 0,
      valorTotalReembolsar: 0,
    };
  }, [schedules]);

  return {
    schedules,
    statistics,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  };
}
