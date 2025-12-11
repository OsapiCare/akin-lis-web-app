"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Calendar, DollarSign, FileText, User } from "lucide-react";

interface NewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  selectedExams: any[];
  onConfirm: () => void;
  isProcessing: boolean;
  activeBlock?: any;
}

export function NewScheduleModal({
  isOpen,
  onClose,
  patient,
  selectedExams,
  onConfirm,
  isProcessing,
  activeBlock
}: NewScheduleModalProps) {
  const totalValue = selectedExams.reduce((sum, exam) => sum + (exam.preco || 0), 0);
  const hasActiveBlock = !!activeBlock;
  const invoiceStatus = activeBlock?.Exame?.[0]?.Fatura?.status || "PENDENTE";
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
              <p className="font-medium">{patient?.nome_completo}</p>
              <p className="text-sm text-gray-600">{patient?.numero_identificacao}</p>
            </div>
          </div>

          {/* Status do Bloco */}
          {hasActiveBlock && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Status do Bloco Ativo
              </h3>
              <div className={`p-3 rounded-md ${
                isInvoicePaid ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"
              }`}>
                <p className="font-medium">
                  {isInvoicePaid ? "Fatura Anterior Paga" : "Fatura Anterior Pendente"}
                </p>
                <p className="text-sm">
                  {isInvoicePaid 
                    ? "Será criada uma nova fatura para estes exames."
                    : "Os exames serão adicionados à fatura existente e o valor será atualizado."
                  }
                </p>
              </div>
            </div>
          )}

          {/* Exames Selecionados */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Exames Selecionados ({selectedExams.length})
            </h3>
            <div className="border rounded-md divide-y">
              {selectedExams.map((exam, index) => (
                <div key={index} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{exam.nome}</p>
                    <p className="text-sm text-gray-600">{exam.descricao}</p>
                  </div>
                  <Badge variant="outline" className="font-medium">
                    {new Intl.NumberFormat("pt-AO", {
                      style: "currency",
                      currency: "AOA"
                    }).format(exam.preco)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo */}
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
              {hasActiveBlock
                ? `Os exames serão ${isInvoicePaid ? "adicionados com uma nova fatura" : "adicionados à fatura existente"} ao bloco ativo.`
                : "Um novo bloco de agendamento será criado."}
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