"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, DollarSign, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ExamSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamsSelected: (exams: any[]) => void;
  exams: any[];
  isLoading: boolean;
  patient?: any;
}

export function ExamSelectionModal({ isOpen, onClose, onExamsSelected, exams, isLoading, patient }: ExamSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExams, setSelectedExams] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = Array.from(new Set(exams?.map((exam) => exam.categoria)));
  categories.unshift("all");

  const filteredExams = exams?.filter((exam) => {
    const matchesSearch = exam.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || exam.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || exam.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleExam = (exam: any) => {
    setSelectedExams((prev) => (prev?.some((e) => e.id === exam.id) ? prev?.filter((e) => e.id !== exam.id) : [...prev, exam]));
  };

  const handleConfirm = () => {
    onExamsSelected(selectedExams);
    setSelectedExams([]);
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const totalValue = selectedExams.reduce((sum, exam) => sum + (exam.preco || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Selecionar Exames {patient && `para ${patient.nome_completo}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Buscar exames..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "Todas Categorias" : category}
                </option>
              ))}
            </select>
          </div>

          {/* Resumo da Seleção */}
          {selectedExams.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{selectedExams.length} exame(s) selecionado(s)</span>
                </div>
                <Badge variant="outline" className="font-medium">
                  {new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                  }).format(totalValue)}
                </Badge>
              </div>
            </div>
          )}

          {/* Lista de Exames */}
          <div className="border rounded-md max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum exame encontrado</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredExams.map((exam) => (
                  <div key={exam.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={selectedExams.some((e) => e.id === exam.id)} onCheckedChange={() => handleToggleExam(exam)} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{exam.nome}</p>
                            <p className="text-sm text-gray-600 mt-1">{exam.descricao}</p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA",
                            }).format(exam.preco)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {exam.categoria}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Prazo: {exam.prazo_dias} dias
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {selectedExams.length} exame(s) selecionado(s) • Total:{" "}
              <span className="font-medium">
                {new Intl.NumberFormat("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                }).format(totalValue)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={selectedExams.length === 0}>
                Continuar
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
