"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Activity
} from "lucide-react";

interface ExamStatsProps {
  exams: ExamsType[];
  period?: 'today' | 'week' | 'month';
}

export function ExamStats({ exams, period = 'month' }: ExamStatsProps) {
  const getStats = () => {
    const today = new Date();
    const filteredExams = exams.filter(exam => {
      const examDate = new Date(exam.data_agendamento);

      switch (period) {
        case 'today':
          return examDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return examDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return examDate >= monthAgo;
        default:
          return true;
      }
    });

    const total = filteredExams.length;
    const pendentes = filteredExams.filter(exam => exam.status === 'PENDENTE').length;
    const concluidos = filteredExams.filter(exam => exam.status === 'CONCLUIDO').length;
    const cancelados = filteredExams.filter(exam => exam.status === 'CANCELADO').length;
    const pagos = filteredExams.filter(exam => exam.status_pagamento === 'PAGO').length;
    const naoPageos = filteredExams.filter(exam => exam.status_pagamento === 'NAO_PAGO').length;

    const receita = filteredExams
      .filter(exam => exam.status_pagamento === 'PAGO')
      .reduce((sum, exam) => sum + (exam?.Tipo_Exame?.preco ?? 0), 0);

    const receitaPotencial = filteredExams
      .filter(exam => exam.status_pagamento === 'NAO_PAGO')
      .reduce((sum, exam) => sum + (exam?.Tipo_Exame?.preco ?? 0), 0);

    const taxaConclusao = total > 0 ? (concluidos / total) * 100 : 0;
    const taxaPagamento = total > 0 ? (pagos / total) * 100 : 0;
    const taxaCancelamento = total > 0 ? (cancelados / total) * 100 : 0;

    return {
      total,
      pendentes,
      concluidos,
      cancelados,
      pagos,
      naoPageos,
      receita,
      receitaPotencial,
      taxaConclusao,
      taxaPagamento,
      taxaCancelamento
    };
  };

  const stats = getStats();

  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return 'Hoje';
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mês';
      default: return 'Período';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Exames */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Exames</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {getPeriodLabel()}
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Conclusão */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaConclusao.toFixed(1)}%</div>
            <div className="mt-2">
              <Progress value={stats.taxaConclusao} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Pagamento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Pagamento</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaPagamento.toFixed(1)}%</div>
            <div className="mt-2">
              <Progress value={stats.taxaPagamento} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Receita */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.receita.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +R$ {stats.receitaPotencial.toFixed(2)} pendente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes por Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-yellow-500" />
              Exames Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendentes}</div>
            <div className="mt-2 flex items-center">
              <Badge variant="outline" className="text-yellow-600">
                {stats.total > 0 ? ((stats.pendentes / stats.total) * 100).toFixed(1) : 0}%
              </Badge>
              <span className="ml-2 text-sm text-muted-foreground">do total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Exames Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.concluidos}</div>
            <div className="mt-2 flex items-center">
              <Badge variant="outline" className="text-green-600">
                {stats.total > 0 ? ((stats.concluidos / stats.total) * 100).toFixed(1) : 0}%
              </Badge>
              <span className="ml-2 text-sm text-muted-foreground">do total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Exames Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.cancelados}</div>
            <div className="mt-2 flex items-center">
              <Badge variant="outline" className="text-red-600">
                {stats.total > 0 ? ((stats.cancelados / stats.total) * 100).toFixed(1) : 0}%
              </Badge>
              <span className="ml-2 text-sm text-muted-foreground">do total</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes Financeiros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Resumo Financeiro - {getPeriodLabel()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">R$ {stats.receita.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Receita Confirmada</p>
              <Badge variant="outline" className="mt-1 text-green-600">
                {stats.pagos} pagos
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">R$ {stats.receitaPotencial.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Receita Pendente</p>
              <Badge variant="outline" className="mt-1 text-orange-600">
                {stats.naoPageos} não pagos
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">R$ {(stats.receita + stats.receitaPotencial).toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <Badge variant="outline" className="mt-1 text-blue-600">
                {stats.total} exames
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
