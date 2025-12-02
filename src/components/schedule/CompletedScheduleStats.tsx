"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  Stethoscope,
  CreditCard,
  BarChart3,
} from "lucide-react";

interface CompletedScheduleStatsProps {
  statistics: CompletedScheduleStats;
  isLoading?: boolean;
}

export function CompletedScheduleStats({
  statistics,
  isLoading,
}: CompletedScheduleStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const {
    totalSchedules,
    totalExams,
    pendingExams,
    completedExams,
    cancelledExams,
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    averageExamsPerSchedule,
  } = statistics;

  const completionRate =
    totalExams > 0 ? (completedExams / totalExams) * 100 : 0;

  const paymentRate =
    totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0;

  const cancellationRate =
    totalExams > 0 ? (cancelledExams / totalExams) * 100 : 0;

  return (
    <div className="space-y-6 mb-6">
      {/* Main Statistics Cards */}
      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Status Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Análise de Status dos Exames
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Completed Exams */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Exames Concluídos</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  {completedExams}
                </Badge>
              </div>
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-gray-600">
                {completionRate.toFixed(1)}% do total
              </p>
            </div>

            {/* Pending Exams */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Exames Pendentes</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200"
                >
                  {pendingExams}
                </Badge>
              </div>

              <Progress
                value={
                  totalExams > 0 ? (pendingExams / totalExams) * 100 : 0
                }
                className="h-2"
              />

              <p className="text-xs text-gray-600">
                {totalExams > 0
                  ? ((pendingExams / totalExams) * 100).toFixed(1)
                  : 0}
                % do total
              </p>
            </div>

            {/* Cancelled Exams */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Exames Cancelados</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200"
                >
                  {cancelledExams}
                </Badge>
              </div>
              <Progress value={cancellationRate} className="h-2" />
              <p className="text-xs text-gray-600">
                {cancellationRate.toFixed(1)}% do total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Paid Revenue */}
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Receitas Pagas
                  </span>
                </div>

                <div className="text-lg font-bold text-green-800">
                  {new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                    notation: "compact",
                  }).format(paidRevenue)}
                </div>

                <div className="text-xs text-green-600">
                  {paymentRate.toFixed(1)}% do total
                </div>
              </div>

              {/* Pending Revenue */}
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    Receitas Pendentes
                  </span>
                </div>

                <div className="text-lg font-bold text-orange-800">
                  {new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                    notation: "compact",
                  }).format(pendingRevenue)}
                </div>

                <div className="text-xs text-orange-600">
                  {totalRevenue > 0
                    ? ((pendingRevenue / totalRevenue) * 100).toFixed(1)
                    : 0}
                  % do total
                </div>
              </div>
            </div>

            {/* Payment Rate Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taxa de Cobrança</span>
                <span>{paymentRate.toFixed(1)}%</span>
              </div>
              <Progress value={paymentRate} className="h-3" />
            </div>

            {/* Key Financial Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  Valor Médio/Exame
                </div>
                <div className="font-semibold">
                  {new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                  }).format(
                    totalExams > 0 ? totalRevenue / totalExams : 0
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600">
                  Valor Médio/Agendamento
                </div>
                <div className="font-semibold">
                  {new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                  }).format(
                    totalSchedules > 0
                      ? totalRevenue / totalSchedules
                      : 0
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
