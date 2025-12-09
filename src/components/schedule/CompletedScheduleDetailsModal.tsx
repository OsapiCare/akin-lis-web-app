"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, User, Phone, Stethoscope, CheckCircle, XCircle, AlertCircle, Edit3, Mail, Calendar, Users } from "lucide-react";
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

export function CompletedScheduleDetailsModal({ schedule, isOpen, onClose }: CompletedScheduleDetailsModalProps) {
  const [editingExam, setEditingExam] = useState<number | null>(null);
  const [editedExam, setEditedExam] = useState<EditableExam | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [selectedChief, setSelectedChief] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const userRole = getAllDataInCookies().userRole;
  const isReceptionist = userRole === "RECEPCIONISTA";
  const isLabChief = userRole === "CHEFE";

  const { data: technicians } = useQuery({
    queryKey: ["lab-technicians"],
    queryFn: async () => (await labTechniciansRoutes.getAllLabTechnicians()).data,
    enabled: isLabChief,
  });

  const { data: labChiefs } = useQuery({
    queryKey: ["lab-chiefs"],
    queryFn: async () => await labChiefRoutes.getAllLabChief(),
    enabled: isReceptionist,
  });

  const updateExamMutation = useMutation({
    mutationFn: async (data: { examId: number; updates: EditableExam }) => await examRoutes.editExam(data.examId, data.updates),
    onSuccess: () => {
      ___showSuccessToastNotification({ message: "Exame atualizado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      setEditingExam(null);
      setEditedExam(null);
    },
    onError: () => ___showErrorToastNotification({ message: "Erro ao atualizar exame." }),
  });

  const allocateTechnicianMutation = useMutation({
    mutationFn: async (data: { examId: number; technicianId: string }) => (await _axios.patch(`/exams/${data.examId}`, { id_tecnico_alocado: data.technicianId })).data,
    onSuccess: () => {
      ___showSuccessToastNotification({ message: "Técnico alocado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      setSelectedTechnician(null);
    },
    onError: () => ___showErrorToastNotification({ message: "Erro ao alocar técnico." }),
  });

  const allocateChiefMutation = useMutation({
    mutationFn: async (data: { scheduleId: number; chiefId: string }) => labChiefRoutes.allocateLabChief(data.scheduleId, data.chiefId),
    onSuccess: () => {
      ___showSuccessToastNotification({ message: "Chefe alocado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["completed-schedules"] });
      setSelectedChief(null);
    },
    onError: () => ___showErrorToastNotification({ message: "Erro ao alocar chefe." }),
  });

  if (!schedule) return null;

  // Filtra exames pendentes ou não concluídos para só exibir agendamentos ativos
  const activeExams = schedule.Exame?.filter((exam) => exam.status !== "CONCLUIDO") || [];
  if (activeExams.length === 0) return null; // Se todos os exames concluídos, não mostrar o bloco

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
    if (status === "CONCLUIDO") return null; // Não mostrar badge concluído
    const mapping = {
      PENDENTE: { text: "Pendente", color: "yellow" },
      CANCELADO: { text: "Cancelado", color: "red" },
    } as any;
    const info = mapping[status] || { text: status, color: "gray" };
    const Icon = status === "PENDENTE" ? AlertCircle : XCircle;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Detalhes do Agendamento #{schedule.id}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
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
                  {/* <div>
                    <Label>Status</Label>
                    <div className="mt-1 font-semibold">{"Sem status"}</div>
                  </div> */}
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
                      <Button onClick={() => selectedChief && allocateChiefMutation.mutate({ scheduleId: schedule.id, chiefId: selectedChief })} disabled={!selectedChief}>
                        Alocar
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingExam(exam.id);
                            setEditedExam({ ...exam });
                          }}
                        >
                          <Edit3 className="w-3 h-3 mr-1" /> Editar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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
                        <Label>Preço</Label>
                        <p className="font-medium text-green-600">{new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(exam.Tipo_Exame?.preco || 0)}</p>
                      </div>
                      {isLabChief && (
                        <div>
                          <Label>Técnico Alocado</Label>
                          <p className="font-medium">{getTechnicianName(exam.id_tecnico_alocado)}</p>
                        </div>
                      )}
                    </div>

                    {isLabChief && (
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
                          <Button onClick={() => selectedTechnician && allocateTechnicianMutation.mutate({ examId: exam.id, technicianId: selectedTechnician })} disabled={!selectedTechnician}>
                            Alocar
                          </Button>
                        </div>
                      </div>
                    )}

                    {index < activeExams.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
