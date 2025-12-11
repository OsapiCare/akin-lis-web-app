"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, User, Badge } from "lucide-react";
import { useEffect, useState } from "react";
import { _axios } from "@/Api/axios.config";
import { toast } from "sonner";

interface PatientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientSelected: (patient: any) => void;
  patients: any[];
  isLoading: boolean;
}

export function PatientSelectionModal({
  isOpen,
  onClose,
  onPatientSelected,
  patients,
  isLoading
}: PatientSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Remove the async function or move it to useEffect
  useEffect(() => {
    const allPatients = async () => {
      setIsSaving(true);
      try {
        const patient = await _axios.get("/pacients");
        console.log("Pacientes: ", patient.data);
      } catch (error) {
        toast.error("Erro ao buscar pacientes");
        console.error("Erro ao buscar pacientes:", error);
      } finally {
        setIsSaving(false);
      }
    };
    
    // Call if needed
    // allPatients();
  }, []);

  const filteredPatients = patients?.filter((p: any) =>
    p.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.numero_identificacao?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Selecionar Paciente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de Pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou número de identificação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de Pacientes */}
          <div className="border rounded-md max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredPatients?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum paciente encontrado</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredPatients?.map((patient: any) => (
                  <button
                    key={patient.id}
                    onClick={() => onPatientSelected(patient)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{patient.nome_completo}</p>
                        <p className="text-sm text-gray-600">
                          {patient.numero_identificacao || "Sem BI"}
                        </p>
                      </div>
                    </div>
                    <Badge className="ml-2">
                      Selecionar
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}