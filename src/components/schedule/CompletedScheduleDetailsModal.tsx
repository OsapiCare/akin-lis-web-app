"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, User, Phone, Stethoscope, CheckCircle, XCircle, AlertCircle, Edit3, Mail, Calendar, Users, Save, X, X as CloseIcon, CalendarOff } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { _axios } from "@/Api/axios.config";
import { ___showSuccessToastNotification, ___showErrorToastNotification } from "@/lib/sonner";
import { getAllDataInCookies } from "@/utils/get-data-in-cookies";
import { labTechniciansRoutes } from "@/Api/Routes/lab-technicians/index.routes";
import { labChiefRoutes } from "@/Api/Routes/lab-chief/index.routes";
import { examRoutes } from "@/Api/Routes/Exam/index.route";

interface CompletedScheduleDetailsModalProps {
  schedule: CompletedScheduleType | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EditableExam {
  id: number;
  data_agendamento: string;
  hora_agendamento: string;
  status: string;
  observacoes?: string;
  id_tecnico_alocado?: string | null;
}

export function CompletedScheduleDetailsModal({ schedule, isOpen, onClose }: CompletedScheduleDetailsModalProps) {
  const [editingExam, setEditingExam] = useState<number | null>(null);
  const [editedExam, setEditedExam] = useState<EditableExam | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [selectedChief, setSelectedChief] = useState<string | null>(null);
  const [localExams, setLocalExams] = useState<any[]>([]);

  const queryClient = useQueryClient();
  const userRole = getAllDataInCookies().userRole;
  const isReceptionist = userRole === "RECEPCIONISTA";
  const isLabChief = userRole === "CHEFE";
  const isLabTechnician = userRole === "TECNICO";

  const { data: technicians } = useQuery({
    queryKey: ["lab-technicians"],
    queryFn: async () => (await labTechniciansRoutes.getAllLabTechnicians()).data,
    enabled: isLabChief || isLabTechnician,
  });

  const { data: labChiefs } = useQuery({
    queryKey: ["lab-chiefs"],
    queryFn: async () => await labChiefRoutes.getAllLabChief(),
    enabled: isReceptionist,
  });

  // Atualiza os exames locais quando o schedule muda
  useEffect(() => {
    if (schedule?.Exame) {
      // Filtra exames que não estão concluídos (conforme regra 1)
      const activeExams = schedule.Exame.filter((exam) => exam.status !== "CONCLUIDO");
      setLocalExams(activeExams);
    }
  }, [schedule]);

  const updateExamMutation = useMutation({
    mutationFn: async (data: { examId: number; updates: Partial<EditableExam> }) => {
      const updatePayload: any = { ...data.updates };
      
      // Se o usuário é recepcionista, não pode marcar como CONCLUIDO
      if (isReceptionist && updatePayload.status === "CONCLUIDO") {
        ___showErrorToastNotification({ 
          message: "Recepcionistas não podem marcar exames como concluídos." 
        });
        throw new Error("Recepcionistas não podem marcar exames como concluídos.");
      }
      
      return await examRoutes.editExam(data.examId, updatePayload);
    },
    onSuccess: (response, variables) => {
      ___showSuccessToastNotification({ message: "Exame atualizado com sucesso!" });
      
      // Atualiza o cache do React Query
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      
      // Atualiza o estado local imediatamente
      setLocalExams(prev => prev.map(exam => 
        exam.id === variables.examId 
          ? { ...exam, ...variables.updates }
          : exam
      ));
      
      setEditingExam(null);
      setEditedExam(null);
    },
    onError: (error: any) => {
      console.error("Update exam error:", error);
      ___showErrorToastNotification({ 
        message: error.response?.data?.message || "Erro ao atualizar exame." 
      });
    },
  });

  const allocateTechnicianMutation = useMutation({
    mutationFn: async (data: { examId: number; technicianId: string }) => 
      (await _axios.patch(`/exams/${data.examId}`, { id_tecnico_alocado: data.technicianId })).data,
    onSuccess: (response, variables) => {
      ___showSuccessToastNotification({ message: "Técnico alocado com sucesso!" });
      
      // Atualiza o cache
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      
      // Atualiza o estado local
      setLocalExams(prev => prev.map(exam => 
        exam.id === variables.examId 
          ? { ...exam, id_tecnico_alocado: variables.technicianId }
          : exam
      ));
      
      setSelectedTechnician(null);
    },
    onError: () => ___showErrorToastNotification({ message: "Erro ao alocar técnico." }),
  });

  const allocateChiefMutation = useMutation({
    mutationFn: async (data: { scheduleId: number; chiefId: string }) => 
      labChiefRoutes.allocateLabChief(data.scheduleId, data.chiefId),
    onSuccess: () => {
      ___showSuccessToastNotification({ message: "Chefe alocado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      setSelectedChief(null);
    },
    onError: () => ___showErrorToastNotification({ message: "Erro ao alocar chefe." }),
  });

  if (!schedule) return null;

  // Verifica se há pagamento pendente (regra 02)
  const hasPendingPayment = schedule.Exame?.some(exam => exam.status_pagamento === "PENDENTE");

  // Calcula o status geral do bloco (conforme regras)
  const calculateOverallScheduleStatus = () => {
    const exams = schedule.Exame || [];
    
    // Regra: Se pelo menos um exame está pendente, status geral é pendente
    if (exams.some(exam => exam.status === "PENDENTE")) {
      return "PENDENTE";
    }
    
    // Regra: Se todos os exames são concluídos, status geral é concluído
    if (exams.every(exam => exam.status === "CONCLUIDO")) {
      return "CONCLUIDO";
    }
    
    // Regra: Se há exame "POR_REAGENDAR" e outros "CANCELADO" ou "CONCLUIDO", status é "POR_REAGENDAR"
    if (exams.some(exam => exam.status === "POR_REAGENDAR")) {
      return "POR_REAGENDAR";
    }
    
    // Regra: Se todos os exames são cancelados, status geral é cancelado
    if (exams.every(exam => exam.status === "CANCELADO")) {
      return "CANCELADO";
    }
    
    return "PENDENTE"; // default
  };

  const overallStatus = calculateOverallScheduleStatus();

  // Usa os exames locais (que podem ter sido atualizados) ou os originais do schedule
  const activeExams = localExams.length > 0 ? localExams : 
    (schedule.Exame?.filter((exam) => exam.status !== "CONCLUIDO") || []);
  
  // Se todos os exames estão concluídos, não mostrar (regra 1)
  if (overallStatus === "CONCLUIDO") return null;

  const getPatientAge = () => {
    if (!schedule.Paciente?.data_nascimento) return "N/A";
    const birthDate = new Date(schedule.Paciente.data_nascimento);
    const now = new Date();
    const diffTime = now.getTime() - birthDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + now.getMonth() - birthDate.getMonth();
    const diffYears = now.getFullYear() - birthDate.getFullYear();
    if (diffYears > 0) return `${diffYears} ano${diffYears > 1 ? "s" : ""}`;
    if (diffMonths > 0) return `${diffMonths} mês${diffMonths > 1 ? "es" : ""}`;
    return `${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  };

  const getPatientInitials = () =>
    (schedule.Paciente?.nome_completo || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getExamStatusBadge = (status: string) => {
    const mapping = {
      PENDENTE: { text: "Pendente", color: "yellow", icon: AlertCircle },
      CANCELADO: { text: "Cancelado", color: "red", icon: XCircle },
      POR_REAGENDAR: { text: "Por Reagendar", color: "orange", icon: CalendarOff },
      EM_ANDAMENTO: { text: "Em Andamento", color: "blue", icon: Clock },
      CONCLUIDO: { text: "Concluído", color: "green", icon: CheckCircle },
    } as any;
    
    const info = mapping[status] || { text: status, color: "gray", icon: AlertCircle };
    const Icon = info.icon;
    
    return (
      <Badge variant="default" className={`bg-${info.color}-100 text-${info.color}-800 border-${info.color}-200 flex items-center gap-1`}>
        <Icon className="w-3 h-3" /> {info.text}
      </Badge>
    );
  };

  const getTechnicianName = (id: string | null) => {
    if (!id || !technicians) return "Não alocado";
    return technicians.find((t) => t.id === id)?.nome || "Técnico não encontrado";
  };

  const getChiefName = (id: string | null) => {
    if (!id || !labChiefs) return "Não alocado";
    return labChiefs.find((c) => c.id === id)?.nome || "Chefe não encontrado";
  };

  const totalValue = activeExams?.reduce((acc, exam) => acc + (exam.Tipo_Exame?.preco || 0), 0) || 0;

  const handleEditExam = (exam: any) => {
    setEditingExam(exam.id);
    setEditedExam({
      id: exam.id,
      data_agendamento: exam.data_agendamento,
      hora_agendamento: exam.hora_agendamento,
      status: exam.status,
      id_tecnico_alocado: exam.id_tecnico_alocado || null,
    });
  };

  const handleSaveExam = () => {
    if (!editedExam) return;
    
    updateExamMutation.mutate({
      examId: editedExam.id,
      updates: {
        data_agendamento: editedExam.data_agendamento,
        hora_agendamento: editedExam.hora_agendamento,
        status: editedExam.status,
        id_tecnico_alocado: editedExam.id_tecnico_alocado,
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingExam(null);
    setEditedExam(null);
  };

  const handleExamFieldChange = (field: keyof EditableExam, value: any) => {
    if (!editedExam) return;
    setEditedExam({ ...editedExam, [field]: value });
  };

  // Função para verificar se pode inicializar exame (regra 02)
  const canInitializeExam = (exam: any) => {
    if (exam.status_pagamento !== "PAGO") return false;
    if (!isLabChief && !isLabTechnician) return false;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Detalhes do Agendamento #{schedule.id}
            <span className="ml-2">
              {getExamStatusBadge(overallStatus)}
            </span>
          </DialogTitle>
          
          {/* Botão de fechar no canto superior direito */}
          <DialogClose className="absolute right-4 -top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <CloseIcon className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Status do Bloco */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Status do Bloco</Label>
                    <div className="mt-1">
                      {getExamStatusBadge(overallStatus)}
                    </div>
                  </div>
                  <div>
                    <Label>Pagamento</Label>
                    <div className={`text-sm mt-1 font-semibold ${hasPendingPayment ? 'text-yellow-600' : 'text-green-600'}`}>
                      {hasPendingPayment ? 'Pendente' : 'Pago'}
                    </div>
                  </div>
                  <div>
                    <Label>Pode Inicializar Exames</Label>
                    <div className={`text-sm mt-1 font-semibold ${!hasPendingPayment && (isLabChief || isLabTechnician) ? 'text-green-600' : 'text-red-600'}`}>
                      {!hasPendingPayment && (isLabChief || isLabTechnician) ? 'Sim' : 'Não'}
                      {hasPendingPayment && ' (Aguardando pagamento)'}
                      {!hasPendingPayment && !isLabChief && !isLabTechnician && ' (Apenas chefe/técnico)'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-start">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="" alt={schedule.Paciente?.nome_completo} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">{getPatientInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div>
                      <Label>Nome</Label>
                      <p className="font-semibold">{schedule.Paciente?.nome_completo}</p>
                    </div>
                    <div>
                      <Label>Idade</Label>
                      <p className="font-semibold">{getPatientAge()}</p>
                    </div>
                    <div>
                      <Label>BI</Label>
                      <p className="font-semibold">{schedule.Paciente?.numero_identificacao}</p>
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <p className="font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {schedule.Paciente?.contacto_telefonico}
                      </p>
                    </div>
                    {schedule.Paciente?.email && (
                      <div>
                        <Label>Email</Label>
                        <p className="font-semibold flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {schedule.Paciente.email}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label>Sexo</Label>
                      <p className="font-semibold">{schedule.Paciente?.sexo?.nome}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agendamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Data de Criação</Label>
                    <p className="font-semibold">{format(new Date(schedule.criado_aos), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  </div>
                  <div>
                    <Label>Valor Total</Label>
                    <p className="font-semibold text-green-600">{new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(totalValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chefe alocado */}
            {isReceptionist && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Chefe de Laboratório Alocado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Chefe Atual</Label>
                      <p className="font-semibold">{getChiefName(schedule.id_chefe_alocado || null)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Select value={selectedChief || ""} onValueChange={setSelectedChief}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecionar novo chefe" />
                        </SelectTrigger>
                        <SelectContent>
                          {labChiefs?.map((chief) => (
                            <SelectItem key={chief.id} value={chief.id}>
                              {chief.nome} - {chief.tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={() => selectedChief && allocateChiefMutation.mutate({ scheduleId: schedule.id, chiefId: selectedChief })} 
                        disabled={!selectedChief || allocateChiefMutation.isPending}
                      >
                        {allocateChiefMutation.isPending ? "Alocando..." : "Alocar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exames ativos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> Exames ({activeExams.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeExams.map((exam, index) => (
                  <div key={exam.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{exam.Tipo_Exame?.nome || "Exame não especificado"}</h4>
                      <div className="flex gap-2 items-center">
                        {getExamStatusBadge(exam.status)}
                        {editingExam === exam.id ? (
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleSaveExam}
                              disabled={updateExamMutation.isPending}
                            >
                              <Save className="w-3 h-3 mr-1" /> 
                              {updateExamMutation.isPending ? "Salvando..." : "Salvar"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={updateExamMutation.isPending}
                            >
                              <X className="w-3 h-3 mr-1" /> Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditExam(exam)}
                          >
                            <Edit3 className="w-3 h-3 mr-1" /> Editar
                          </Button>
                        )}
                        
                        {/* Botão para inicializar exame (apenas chefe/técnico com pagamento pago) */}
                        {(isLabChief || isLabTechnician) && canInitializeExam(exam) && (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              // Aqui você implementaria a lógica para inicializar o exame
                              console.log("Inicializar exame:", exam.id);
                            }}
                          >
                            <Clock className="w-3 h-3 mr-1" /> Inicializar
                          </Button>
                        )}
                      </div>
                    </div>

                    {editingExam === exam.id && editedExam ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label>Data</Label>
                          <Input
                            type="date"
                            value={editedExam.data_agendamento}
                            onChange={(e) => handleExamFieldChange("data_agendamento", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Hora</Label>
                          <Input
                            type="time"
                            value={editedExam.hora_agendamento}
                            onChange={(e) => handleExamFieldChange("hora_agendamento", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Select
                            value={editedExam.status}
                            onValueChange={(value) => handleExamFieldChange("status", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDENTE">Pendente</SelectItem>
                              <SelectItem value="CANCELADO">Cancelado</SelectItem>
                              {!isReceptionist && (
                                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label>Data e Hora</Label>
                          <p className="font-medium flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {format(new Date(exam.data_agendamento), "dd/MM/yyyy", { locale: ptBR })}
                            <Clock className="w-3 h-3 ml-2" />
                            {exam.hora_agendamento}
                          </p>
                        </div>
                        <div>
                          <Label className="font-semibold">Preço</Label>
                          <p className="font-medium text-green-600">{new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(exam.Tipo_Exame?.preco || 0)}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Pagamento</Label>
                          <p className={`font-medium ${exam.status_pagamento === 'PAGO' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {exam.status_pagamento === 'PAGO' ? 'Pago' : 'Pendente'}
                          </p>
                        </div>
                        {(isLabChief || isLabTechnician) && (
                          <div>
                            <Label>Técnico Alocado</Label>
                            <p className="font-medium">{getTechnicianName(exam.id_tecnico_alocado)}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {isLabChief && editingExam !== exam.id && (
                      <div className="mt-4 pt-4 border-t">
                        <Label>Alocar Técnico</Label>
                        <div className="flex gap-2">
                          <Select value={selectedTechnician || ""} onValueChange={setSelectedTechnician}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecionar técnico" />
                            </SelectTrigger>
                            <SelectContent>
                              {technicians?.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.nome} - {t.tipo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={() => selectedTechnician && allocateTechnicianMutation.mutate({ examId: exam.id, technicianId: selectedTechnician })} 
                            disabled={!selectedTechnician || allocateTechnicianMutation.isPending}
                          >
                            {allocateTechnicianMutation.isPending ? "Alocando..." : "Alocar"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {index < activeExams.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Botão de fechar na parte inferior (opcional) */}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}