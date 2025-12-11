"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { ResponseData } from "../next-exam/types";
import { _axios } from "@/Api/axios.config";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, DollarSign, User, UserCheck, Pencil, Play, Search, Grid3X3, List, BadgeIcon } from "lucide-react";
import { useAuthStore } from "@/utils/zustand-store/authStore";
import { UserData } from "@/app/akin/profile/page";
import { AlerDialogNextExam } from "./_alertDialog";
import { MedicalMaterialsModal } from "./_materialModal";
import { EditScheduleFormModal } from "@/app/akin/schedule/editScheduleData";
import { formatCurrency } from "@/utils/formartCurrency";
import { toast } from "sonner";

// Função auxiliar para formatar status em português
const getStatusInPortuguese = (status: string) => {
  const statusMap: { [key: string]: string } = {
    PENDENTE: "Pendente",
    EM_ANDAMENTO: "Em Andamento",
    CONCLUIDO: "Concluído",
    CANCELADO: "Cancelado",
    PAGO: "Pago",
    NAO_PAGO: "Não Pago",
  };
  return statusMap[status.toUpperCase()] || status;
};

// Função para formatar data
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  } catch {
    return dateString;
  }
};

// Função para verificar se o usuário pode ver informações técnicas
const canViewTechnicalInfo = (userType: string | undefined) => {
  // Recepcionistas não podem ver informações técnicas
  if (userType === "RECEPCIONISTA") return false;
  // Técnicos, chefes e administradores podem ver
  return ["TECNICO", "CHEFE_LABORATORIO", "ADMIN"].includes(userType || "");
};

const SkeletonCard = () => (
  <Card className="mb-4">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-20" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Separator />
      <div className="flex justify-end">
        <Skeleton className="h-9 w-24" />
      </div>
    </CardContent>
  </Card>
);

const SkeletonList = () => (
  <Card className="mb-2">
    <CardContent className="py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ExamCardModern = ({
  exam,
  onEdit,
  onStart,
  canStart,
  techName,
  chiefName,
  isLoadingTechData = false,
  patientName,
  onExamSaved,
  canViewTechnicalInfo = false, // Nova prop
}: {
  exam: any;
  onEdit: (exam: any) => void;
  onStart: (examId: string) => void;
  canStart: boolean;
  techName: string;
  chiefName: string;
  isLoadingTechData?: boolean;
  patientName: string;
  onExamSaved?: () => void;
  canViewTechnicalInfo?: boolean; // Nova prop
}) => {
  const [isNextExamOpen, setIsNextExamOpen] = useState(false);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = () => {
    const examData = {
      id: exam.id,
      name: exam.Tipo_Exame?.nome,
      date: exam.data_agendamento,
      time: exam.hora_agendamento,
      technicianId: exam.id_tecnico_alocado,
      chiefId: exam.Agendamento?.id_chefe_alocado,
      status: exam.status,
    };
    onEdit(examData);
    setIsEditModalOpen(true);
  };

  const handleStartExam = () => {
    setIsNextExamOpen(true);
  };

  const handleIgnoreProtocol = () => {
    setIsNextExamOpen(false);
    setIsMaterialsModalOpen(true);
  };
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "concluido":
      case "concluído":
        return "bg-green-100 text-green-800 border-green-200";
      case "em_andamento":
      case "em andamento":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pago":
        return "bg-green-100 text-green-800 border-green-200";
      case "pendente":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "nao_pago":
      case "não pago":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  return (
    <>
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">{exam.Tipo_Exame.nome}</h3>
              {/* Recepcionistas não podem editar agendamentos técnicos */}
              {canViewTechnicalInfo && (
                <div className="relative group">
                  <Button variant="ghost" size="sm" onClick={handleEditClick} className="h-8 w-8 p-0">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <span className="absolute cursor-pointer -left-8 top-8 mt-0 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity">Editar</span>
                </div>
              )}
            </div>
            <Badge className={getStatusColor(exam.status)}>{getStatusInPortuguese(exam.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Data:</span>
                <span>{formatDate(exam.data_agendamento)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Horário:</span>
                <span>{exam.hora_agendamento}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Preço:</span>
                <span className="font-semibold">{formatCurrency(exam.Tipo_Exame.preco)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <BadgeIcon className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Pagamento:</span>
                <Badge variant="outline" className={getPaymentStatusColor(exam.status_pagamento)}>
                  {getStatusInPortuguese(exam.status_pagamento)}
                </Badge>
              </div>

              {/* Apenas usuários autorizados podem ver informações técnicas */}
              {canViewTechnicalInfo && (
                <>
                  <div className="flex items-center space-x-2 text-sm">
                    <UserCheck className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Chefe:</span>
                    {isLoadingTechData ? <Skeleton className="h-4 w-24" /> : <span className="truncate">{chiefName}</span>}
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Técnico:</span>
                    {isLoadingTechData ? <Skeleton className="h-4 w-24" /> : <span className="truncate">{techName}</span>}
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            {canStart && (
              <Button disabled={exam.status_pagamento.toLowerCase() !== "pago"} onClick={handleStartExam} className="bg-teal-600 hover:bg-teal-700">
                <Play className="h-4 w-4 mr-2" />
                Começar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <AlerDialogNextExam isOpen={isNextExamOpen} onClose={() => setIsNextExamOpen(false)} onIgnore={handleIgnoreProtocol} />

      <MedicalMaterialsModal isOpen={isMaterialsModalOpen} onClose={() => setIsMaterialsModalOpen(false)} exam_id={String(exam.id_tipo_exame)} patient_name={patientName} exam_name={exam.Tipo_Exame.nome} />

      {/* Apenas usuários autorizados podem acessar o modal de edição */}
      {canViewTechnicalInfo && (
        <EditScheduleFormModal
          open={isEditModalOpen}
          exam={{
            id: exam.id,
            name: exam.Tipo_Exame?.nome,
            date: exam.data_agendamento,
            time: exam.hora_agendamento,
            technicianId: exam.id_tecnico_alocado,
            chiefId: exam.Agendamento?.id_chefe_alocado,
            status: exam.status,
          }}
          examId={exam.id}
          techName={techName}
          chiefName={chiefName}
          onClose={() => setIsEditModalOpen(false)}
          onSave={() => {
            setIsEditModalOpen(false);
            onExamSaved?.();
          }}
          active
        />
      )}
    </>
  );
};

const ExamListItem = ({
  exam,
  onEdit,
  onStart,
  canStart,
  techName,
  chiefName,
  isLoadingTechData = false,
  patientName,
  onExamSaved,
  canViewTechnicalInfo = false, // Nova prop
}: {
  exam: any;
  onEdit: (exam: any) => void;
  onStart: (examId: string) => void;
  canStart: boolean;
  techName: string;
  chiefName: string;
  isLoadingTechData?: boolean;
  patientName: string;
  onExamSaved?: () => void;
  canViewTechnicalInfo?: boolean; // Nova prop
}) => {
  const [isNextExamOpen, setIsNextExamOpen] = useState(false);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = () => {
    const examData = {
      id: exam.id,
      name: exam.Tipo_Exame?.nome,
      date: exam.data_agendamento,
      time: exam.hora_agendamento,
      technicianId: exam.id_tecnico_alocado,
      chiefId: exam.Agendamento?.id_chefe_alocado,
      status: exam.status,
    };
    onEdit(examData);
    setIsEditModalOpen(true);
  };

  const handleStartExam = () => {
    setIsNextExamOpen(true);
  };

  const handleIgnoreProtocol = () => {
    setIsNextExamOpen(false);
    setIsMaterialsModalOpen(true);
  };
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "concluido":
      case "concluído":
        return "bg-green-100 text-green-800 border-green-200";
      case "em_andamento":
      case "em andamento":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <Card className="mb-2 hover:shadow-sm transition-shadow">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-900 truncate">{exam.Tipo_Exame.nome}</h4>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{formatDate(exam.data_agendamento)}</span>
                <span>{exam.hora_agendamento}</span>
                <span className="font-medium">
                  {exam.Tipo_Exame.preco.toLocaleString("pt-ao", {
                    style: "currency",
                    currency: "AOA",
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(exam.status)}>{getStatusInPortuguese(exam.status)}</Badge>
              {/* Recepcionistas não podem editar agendamentos técnicos */}
              {canViewTechnicalInfo && (
                <div className="relative group">
                  <Button variant="ghost" size="sm" onClick={handleEditClick} className="h-8 w-8 p-0">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <span className="absolute cursor-pointer -left-8 top-8 mt-0 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity">Editar</span>
                </div>
              )}
              {canStart && (
                <Button disabled={false} size="sm" onClick={handleStartExam} className="bg-teal-600 hover:bg-teal-700">
                  <Play className="h-4 w-4 mr-1" />
                  Começar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <AlerDialogNextExam isOpen={isNextExamOpen} onClose={() => setIsNextExamOpen(false)} onIgnore={handleIgnoreProtocol} />

      <MedicalMaterialsModal isOpen={isMaterialsModalOpen} onClose={() => setIsMaterialsModalOpen(false)} exam_id={String(exam.id_tipo_exame)} patient_name={patientName} exam_name={exam.Tipo_Exame.nome} />

      {/* Apenas usuários autorizados podem acessar o modal de edição */}
      {canViewTechnicalInfo && (
        <EditScheduleFormModal
          open={isEditModalOpen}
          exam={{
            id: exam.id,
            name: exam.Tipo_Exame?.nome,
            date: exam.data_agendamento,
            time: exam.hora_agendamento,
            technicianId: exam.id_tecnico_alocado,
            chiefId: exam.Agendamento?.id_chefe_alocado,
            status: exam.status,
          }}
          examId={exam.id}
          techName={techName}
          chiefName={chiefName}
          onClose={() => setIsEditModalOpen(false)}
          onSave={() => {
            setIsEditModalOpen(false);
            onExamSaved?.();
          }}
          active
        />
      )}
    </>
  );
};

const UpcomingExams = () => {
  //@ts-ignore
  const { id } = useParams();
  const [filter, setFilter] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const { user } = useAuthStore();
  const [, setIsProcessing] = useState(false);
  const [, setIsExamSaved] = useState(false);
  const [, setIsEditModalOpen] = useState(false);
  const [, setSelectedExam] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["next-exam"],
    queryFn: async () => {
      return await _axios.get<ResponseData>(`/exams/next/${id}`);
    },
  });

  const userName = useQuery({
    queryKey: ["user-name"],
    queryFn: async () => {
      return await _axios.get(`/pacients/${id}`);
    },
  });

  const { data: userData } = useQuery({
    queryKey: ["user-data"],
    queryFn: async () => {
      return await _axios.get<UserData>(`/users/${user?.id}`);
    },
  });

  const techLab = useQuery({
    queryKey: ["tech-lab"],
    queryFn: async () => {
      return await _axios.get<ILabTechnician[]>("/lab-technicians");
    },
  });

  const getNameTech = (id: string | null) => {
    if (!id) return "Não atribuído";
    const tech = techLab.data?.data.find((tech) => tech.id === id);
    return tech?.nome || "Nome não encontrado";
  };

  const filteredData = filter ? data?.data.data.filter((exam) => exam.Tipo_Exame.nome.toLowerCase().includes(filter.toLowerCase())) : data?.data.data;

  const handleEdit = async (exam: any) => {
    console.log("Edit exam:", exam);
    // Aqui você pode implementar a lógica de edição
    try {
      setIsProcessing(true);

      const updateData = {
        id: exam.id,
        name: exam.name,
        date: exam.date,
        time: exam.time,
        technicianId: exam.technicianId,
        chiefId: exam.chiefId,
        status: exam.status,
        status_pagamento: exam.status_pagamento,
      };
      // O modal será aberto pelos componentes individuais
      const response = await _axios.put(`/exams/${exam.id}`, updateData);
      if (response.status === 200) {
        toast.success("Exame atualizado com sucesso!");
        handleExamSaved();
      }
    } catch (error: any) {
      console.error("Erro ao editar exame:", error);
      toast.error(error.response?.data?.message || "Erro ao atualizar exame");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStart = (examId: string) => {
    console.log("Start exam:", examId);
    // Aqui você pode implementar a lógica para começar o exame
  };

  const handleEditField = async (examId: number, field: string, value: any) => {
    try {
      const updateData = {
        [field]: value,
      };

      const response = await _axios.patch(`/exams/${examId}`, updateData);

      if (response.status === 200) {
        toast.success(`${field.replace("_", " ")} atualizado com sucesso!`);
        queryClient.invalidateQueries({ queryKey: ["next-exam"] });
        return true;
      }
    } catch (error: any) {
      console.error(`Erro ao atualizar ${field}:`, error);
      toast.error(error.response?.data?.message || `Erro ao atualizar ${field}`);
      return false;
    }
  };

  // Para editar o técnico alocado:
  const handleEditTechnician = async (examId: number, technicianId: string | null) => {
    return handleEditField(examId, "id_tecnico_alocado", technicianId);
  };

  // Para editar o chefe alocado:
  const handleEditChief = async (examId: number, chiefId: string | null) => {
    return handleEditField(examId, "id_chefe_alocado", chiefId);
  };

  // Para editar o status do exame:
  const handleEditStatus = async (examId: number, status: string) => {
    const statusMap: Record<string, string> = {
      pendente: "PENDENTE",
      em_andamento: "EM_ANDAMENTO",
      concluido: "CONCLUIDO",
      cancelado: "CANCELADO",
    };

    const normalizedStatus = statusMap[status.toLowerCase()] || status;
    return handleEditField(examId, "status", normalizedStatus);
  };

  // Para editar o status de pagamento:
  const handleEditPaymentStatus = async (examId: number, paymentStatus: string) => {
    const paymentMap: Record<string, string> = {
      pago: "PAGO",
      pendente: "PENDENTE",
      nao_pago: "NAO_PAGO",
    };

    const normalizedPayment = paymentMap[paymentStatus.toLowerCase()] || paymentStatus;
    return handleEditField(examId, "status_pagamento", normalizedPayment);
  };

  // Para editar data e hora:
  const handleEditDateTime = async (examId: number, date: string, time: string) => {
    try {
      const updateData = {
        data_agendamento: date,
        hora_agendamento: time,
      };

      const response = await _axios.patch(`/exams/${examId}`, updateData);

      if (response.status === 200) {
        toast.success("Data e hora atualizadas com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["next-exam"] });
        return true;
      }
    } catch (error: any) {
      console.error("Erro ao atualizar data/hora:", error);
      toast.error(error.response?.data?.message || "Erro ao atualizar agendamento");
      return false;
    }
  };

  // Função de callback quando o modal é salvo (para usar no EditScheduleFormModal)
  const handleModalSave = async (examData: any) => {
    try {
      console.log("Saving exam data:", examData);

      // Atualizar múltiplos campos
      const updatePromises = [];

      if (examData.technicianId !== undefined) {
        updatePromises.push(handleEditTechnician(examData.id, examData.technicianId));
      }

      if (examData.chiefId !== undefined) {
        updatePromises.push(handleEditChief(examData.id, examData.chiefId));
      }

      if (examData.status !== undefined) {
        updatePromises.push(handleEditStatus(examData.id, examData.status));
      }

      if (examData.date && examData.time) {
        updatePromises.push(handleEditDateTime(examData.id, examData.date, examData.time));
      }

      // Executar todas as atualizações
      await Promise.all(updatePromises);

      // Se houver um callback de sucesso
      handleExamSaved();
      toast.success("Exame atualizado com sucesso!");

      return true;
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      return false;
    }
  };

  // Versão simplificada se você só precisa da função básica
  const handleEditSimple = async (examId: number, updatedFields: Record<string, any>) => {
    try {
      const response = await _axios.patch(`/exams/${examId}`, updatedFields);

      if (response.status === 200) {
        toast.success("Exame atualizado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["next-exam"] });
        return true;
      }
    } catch (error: any) {
      console.error("Erro ao editar exame:", error);
      toast.error(error.response?.data?.message || "Erro ao atualizar exame");
      return false;
    }
  };

  // Exemplo de uso no seu componente:
  const handleEditClick = (exam: any) => {
    // Preparar dados para o modal
    const examData = {
      id: exam.id,
      name: exam.Tipo_Exame?.nome,
      date: exam.data_agendamento,
      time: exam.hora_agendamento,
      technicianId: exam.id_tecnico_alocado,
      chiefId: exam.Agendamento?.id_chefe_alocado,
      status: exam.status,
      status_pagamento: exam.status_pagamento,
    };

    // Abrir modal ou processar diretamente
    setIsEditModalOpen(true);
    setSelectedExam(examData);
  };

  const handleExamSaved = () => {
    // Invalidar cache para recarregar os dados após edição
    queryClient.invalidateQueries({ queryKey: ["next-exam"] });
    queryClient.invalidateQueries({ queryKey: ["tech-lab"] });
  };

  const getInitials = (name: string) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const canUserStartExam = () => {
    if (userData?.data?.tipo === "RECEPCIONISTA") return false;
    return userData?.data?.tipo !== "TECNICO";
  };

  // Verifica se o usuário pode ver informações técnicas
  const userCanViewTechnicalInfo = canViewTechnicalInfo(userData?.data?.tipo);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Patient Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-teal-100 text-teal-700">{getInitials(userName.data?.data.nome_completo || "")}</AvatarFallback>
                </Avatar>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Paciente</Label>
                  <p className="text-lg font-semibold text-gray-900">{userName.isLoading ? <Skeleton className="h-6 w-48" /> : userName.data?.data.nome_completo || "Nome não encontrado"}</p>
                </div>
              </div>

              {/* Search and View Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type="text" placeholder="Buscar exames..." className="pl-10 w-full sm:w-64" value={filter} onChange={(e) => setFilter(e.target.value)} />
                </div>

                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <Toggle pressed={viewMode === "card"} onPressedChange={() => setViewMode("card")} className="data-[state=on]:bg-white data-[state=on]:shadow-sm">
                    <Grid3X3 className="h-4 w-4" />
                  </Toggle>
                  <Toggle pressed={viewMode === "list"} onPressedChange={() => setViewMode("list")} className="data-[state=on]:bg-white data-[state=on]:shadow-sm">
                    <List className="h-4 w-4" />
                  </Toggle>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exams Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Próximos Exames</h2>
            <Badge variant="outline" className="text-sm">
              {filteredData?.length || 0} exames
            </Badge>
          </div>

          {isPending ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => (viewMode === "card" ? <SkeletonCard key={i} /> : <SkeletonList key={i} />))}</div>
          ) : (
            <div className="space-y-2">
              {filteredData?.map((exam) =>
                viewMode === "card" ? (
                  <ExamCardModern
                    key={exam.id}
                    exam={exam}
                    onEdit={handleEdit}
                    onStart={handleStart}
                    canStart={exam.status === "PENDENTE" && canUserStartExam()}
                    techName={techLab.isLoading ? "Carregando..." : getNameTech(exam.id_tecnico_alocado)}
                    chiefName={techLab.isLoading ? "Carregando..." : getNameTech(exam.Agendamento?.id_chefe_alocado)}
                    isLoadingTechData={techLab.isLoading}
                    patientName={userName.data?.data.nome_completo || ""}
                    onExamSaved={handleExamSaved}
                    canViewTechnicalInfo={userCanViewTechnicalInfo} // Passa a informação
                  />
                ) : (
                  <ExamListItem
                    key={exam.id}
                    exam={exam}
                    onEdit={handleEdit}
                    onStart={handleStart}
                    canStart={exam.status === "PENDENTE" && canUserStartExam()}
                    techName={techLab.isLoading ? "Carregando..." : getNameTech(exam.id_tecnico_alocado)}
                    chiefName={techLab.isLoading ? "Carregando..." : getNameTech(exam.Agendamento?.id_chefe_alocado)}
                    isLoadingTechData={techLab.isLoading}
                    patientName={userName.data?.data.nome_completo || ""}
                    onExamSaved={handleExamSaved}
                    canViewTechnicalInfo={userCanViewTechnicalInfo} // Passa a informação
                  />
                )
              )}
            </div>
          )}

          {filteredData?.length === 0 && !isPending && (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum exame encontrado</h3>
                <p className="text-gray-600">{filter ? "Tente ajustar os filtros de busca." : "Não há exames agendados para este paciente."}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingExams;
