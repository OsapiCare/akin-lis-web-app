"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Calendar, DollarSign, FileText, User } from "lucide-react";

// Tipos definidos conforme o modelo de dados
interface Paciente {
  id: string;
  nome_completo: string;
  numero_identificacao: string;
  // ... outros campos do paciente
}

interface ItemAgendamento {
  id: string;
  tipo: "EXAME" | "CONSULTA";
  nome: string;
  descricao?: string;
  preco: number;
  estado_clinico: "PENDENTE" | "EM_ANDAMENTO" | "POR_REAGENDAR" | "CONCLUIDO" | "CANCELADO";
  estado_financeiro: "ISENTO" | "NAO_PAGO" | "PAGO";
  estado_reembolso: "SEM_REEMBOLSO" | "POR_REEMBOLSAR" | "REEMBOLSADO";
  data_hora: Date;
  // ... outros campos
}

interface ProcessoAgendamento {
  id: string;
  paciente_id: string;
  estado_clinico: "ATIVO" | "PARCIALMENTE_CONCLUIDO" | "POR_REAGENDAR" | "CONCLUIDO" | "CANCELADO";
  estado_financeiro: "ISENTO" | "NAO_PAGO" | "PAGO_PARCIALMENTE" | "PAGO";
  estado_reembolso: "SEM_REEMBOLSO" | "POR_REEMBOLSAR" | "REEMBOLSADO";
  data_criacao: Date;
  valor_a_pagar: number;
  itens: ItemAgendamento[];
  fatura?: Fatura;
}

// Em module/types.ts ou similar
export interface IProcessoAgendamento {
  id: string;
  id_paciente: string;
  id_unidade_de_saude: number;
  estado_clinico: "ATIVO" | "PARCIALMENTE_CONCLUIDO" | "POR_REAGENDAR" | "CONCLUIDO" | "CANCELADO";
  estado_financeiro: "ISENTO" | "NAO_PAGO" | "PAGO_PARCIALMENTE" | "PAGO";
  estado_reembolso: "SEM_REEMBOLSO" | "POR_REEMBOLSAR" | "REEMBOLSADO"; // NOVO CAMPO
  data_criacao: string;
  valor_total: number;
  valor_pago: number;
  valor_a_pagar: number;
  
  // Campos de alocação
  id_chefe_laboratorio_alocado?: string; // Existente
  id_clinico_geral_alocado?: string; // NOVO CAMPO
  
  // Relacionamentos
  Paciente?: Paciente;
  Itens?: ItemAgendamento[];
  Fatura?: Fatura;
}

export interface IClinicoGeral {
  id: string;
  nome: string;
  especialidade?: string;
  registro_profissional?: string;
  // ... outros campos
}

interface Fatura {
  id: string;
  processo_agendamento_id: string;
  status: "PENDENTE" | "PAGO_PARCIALMENTE" | "PAGO" | "CANCELADA";
  valor_total: number;
  valor_pago: number;
  // ... outros campos
}

interface NewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: Paciente;
  selectedExams: ItemAgendamento[];
  onConfirm: () => void;
  isProcessing: boolean;
  activeProcess?: ProcessoAgendamento; // Nome alterado de activeBlock para activeProcess
}

export function NewScheduleModal({
  isOpen,
  onClose,
  paciente,
  selectedExams,
  onConfirm,
  isProcessing,
  activeProcess // Prop renomeada
}: NewScheduleModalProps) {
  const totalValue = selectedExams.reduce((sum, item) => sum + (item.preco || 0), 0);
  const hasActiveProcess = !!activeProcess;
  const invoiceStatus = activeProcess?.fatura?.status || "PENDENTE";
  const isInvoicePaid = invoiceStatus === "PAGO";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Confirmar Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Paciente */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
              <User className="h-4 w-4" />
              Paciente
            </h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium">{paciente?.nome_completo}</p>
              <p className="text-sm text-gray-600">{paciente?.numero_identificacao}</p>
            </div>
          </div>

          {/* Status do Processo Ativo */}
          {hasActiveProcess && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Status do Processo de Agendamento Ativo
              </h3>
              <div className={`p-3 rounded-md ${
                isInvoicePaid ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"
              }`}>
                <p className="font-medium">
                  {isInvoicePaid ? "Fatura Anterior Paga" : "Fatura Anterior Pendente"}
                </p>
                <p className="text-sm">
                  {isInvoicePaid 
                    ? "Será criada uma nova fatura para estes itens."
                    : "Os itens serão adicionados à fatura existente e o valor será atualizado."
                  }
                </p>
                {/* Mostrar estado do processo atual */}
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    Estado: {activeProcess.estado_clinico?.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Financeiro: {activeProcess.estado_financeiro?.replace("_", " ")}
                  </Badge>
                  {activeProcess.estado_reembolso !== "SEM_REEMBOLSO" && (
                    <Badge variant="outline" className="text-xs">
                      Reembolso: {activeProcess.estado_reembolso?.replace("_", " ")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Itens Selecionados (Exames/Consultas) */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Itens Selecionados ({selectedExams.length})
            </h3>
            <div className="border rounded-md divide-y">
              {selectedExams.map((item, index) => (
                <div key={item.id || index} className="p-3 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.nome}</p>
                      <Badge variant="secondary" className="text-xs">
                        {item.tipo}
                      </Badge>
                    </div>
                    {item.descricao && (
                      <p className="text-sm text-gray-600">{item.descricao}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="font-medium">
                    {new Intl.NumberFormat("pt-AO", {
                      style: "currency",
                      currency: "AOA"
                    }).format(item.preco)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Valor Total:</span>
              <span className="text-xl font-bold text-green-700 flex items-center gap-1">
                <DollarSign className="h-5 w-5" />
                {new Intl.NumberFormat("pt-AO", {
                  style: "currency",
                  currency: "AOA"
                }).format(totalValue)}
              </span>
            </div>
            <Separator className="my-2" />
            <p className="text-sm text-gray-600">
              {hasActiveProcess
                ? `Os itens serão ${isInvoicePaid ? "adicionados com uma nova fatura" : "adicionados à fatura existente"} ao processo ativo.`
                : "Um novo processo de agendamento será criado."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? "Processando..." : "Confirmar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}