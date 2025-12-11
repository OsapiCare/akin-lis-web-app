"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import AutomatedAnalysis from "../modalAutomatiImage";
import { ManualExam } from "../manualExam";
import { ImageModal, Shape } from "../components/selectedCaptureImages";
import { CapturedImages } from "../components/listCaptureImages";
import { LaudoModal } from "../laudo";
import { _axios } from "@/Api/axios.config";
import {
  User,
  Calendar,
  FileText,
  Images,
  ClipboardList
} from "lucide-react";

interface PatientType {
  id: string;
  numero_identificacao: string;
  nome_completo: string;
  data_nascimento: string;
  contacto_telefonico: string;
  data_registro: string;
  data_ultima_visita: string;
  id_sexo: number;
  id_usuario: string;
  sexo: {
    nome: string;
  };
}

export default function SampleVisualizationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAutomatedAnalysisOpen, setIsAutomatedAnalysisOpen] = useState(false);
  const [imageAnnotations, setImageAnnotations] = useState<Record<string, Shape[]>>({});
  const [laudoModalOpen, setLaudoModalOpen] = useState(false);

  //@ts-ignore
  const { id, exam_id } = useParams();

  const getPatientInfo = useQuery({
    queryKey: ['patient-info', id],
    queryFn: async () => {
      return await _axios.get<PatientType>(`/pacients/${id}`);
    },
    enabled: !!id,
    retry: 1
  })

  const getExamById = useQuery({
    queryKey: ['Exam-Info', exam_id],
    queryFn: async () => {
      return await _axios.get(`/exam-types/${exam_id}`);
    },
    enabled: !!exam_id,
    retry: 1
  })

  // Helper functions
  const getInitials = (name?: string) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data não disponível";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const handleDeleteImage = (image: string) => {
    setCapturedImages((prev) => prev.filter((img) => img !== image));
    setNotes((prev) => {
      const updatedNotes = { ...prev };
      delete updatedNotes[image];
      return updatedNotes;
    });
  };

  const handleNoteChange = (image: string, value: string) => {
    setNotes((prev) => ({ ...prev, [image]: value }));
  };

  const handleAutomatedAnalysisOpen = () => {
    setIsAutomatedAnalysisOpen(true);
  };

  const handleClickOnGenerateLaudo = () => {
    setLaudoModalOpen(true);
  }
  const handleGenerateReport = () => {
    const reportData = capturedImages.map((image) => ({
      image,
      notes: notes[image] || "",
      //@ts-ignore
      annotations: imageAnnotations[image]?.shapes.map((shape) => ({
        ...shape,
        //@ts-ignore
        note: imageAnnotations[image]?.shapeNotes[shape.id] || "",
      })) || [],
    }));

    console.log("📌 Relatório de Anotações:", reportData);
  };

  const handleSendToAI = () => {
    const imagesWithNotes = capturedImages.map((image) => ({
      image,
      note: notes[image] || "",
    }));
    console.log("Enviando à IA:", imagesWithNotes);
  };

  // Dados auxiliares para evitar repetição
  const patientData = getPatientInfo.data?.data;
  const examData = getExamById.data?.data?.data || getExamById.data?.data;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {getPatientInfo.isLoading || getExamById.isLoading || !getPatientInfo.data || !getExamById.data ? (
          /* Loading State */
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full rounded-lg" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : getPatientInfo.isError || getExamById.isError ? (
          /* Error State */
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar dados</h3>
                  <p className="text-gray-600">
                    {getPatientInfo.isError && "Erro ao carregar informações do paciente. "}
                    {getExamById.isError && "Erro ao carregar informações do exame."}
                  </p>
                  <Button 
                    onClick={() => {
                      getPatientInfo.refetch();
                      getExamById.refetch();
                    }}
                    className="mt-4"
                    variant="outline"
                  >
                    Tentar novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Header Card */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Patient Info */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                        {getInitials(patientData?.nome_completo || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <h2 className="text-xl font-semibold text-gray-900">
                          {patientData?.nome_completo || "Nome não disponível"}
                        </h2>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-600 font-medium">
                          {examData?.nome || "Exame não disponível"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-500">
                          {formatDate(new Date().toISOString())}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                      size="lg"
                    >
                      Análise Manual
                    </Button>
                    <Button
                      onClick={handleAutomatedAnalysisOpen}
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-50"
                      size="lg"
                    >
                      Análise Automática
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Images className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Imagens Capturadas</p>
                      <p className="text-2xl font-bold text-gray-900">{capturedImages.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ClipboardList className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Anotações</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Object.keys(notes).filter(key => notes[key]).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <Badge className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                        Em Andamento
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Automated Analysis Modal */}
            {isAutomatedAnalysisOpen && (
              <div id="modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="max-w-7xl w-full h-full lg:h-[96%] bg-white rounded-lg overflow-y-auto shadow-lg">
                  <AutomatedAnalysis
                    isAutomatedAnalysisOpen={isAutomatedAnalysisOpen}
                    setIsAutomatedAnalysisOpen={setIsAutomatedAnalysisOpen}
                  />
                </div>
              </div>
            )}

            {/* Manual Exam Modal */}
            {isModalOpen && (
              <ManualExam
                setIsModalOpen={setIsModalOpen}
                onCaptureImage={(images) => {
                  setCapturedImages((prevImages) => {
                    const newImages = images.filter((image) => !prevImages.includes(image));
                    return [...prevImages, ...newImages];
                  });
                }}
              />
            )}

            {/* Images Section */}
            <CapturedImages
              capturedImages={capturedImages}
              setSelectedImage={setSelectedImage}
              handleDeleteImage={handleDeleteImage}
              onCaptureImage={(images) => {
                setCapturedImages((prevImages) => {
                  const newImages = images.filter((image) => !prevImages.includes(image));
                  return [...prevImages, ...newImages];
                });
              }}
            />

            {/* Image Modal */}
            <ImageModal
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              notes={notes}
              handleNoteChanged={handleNoteChange}
              setImageAnnotations={setImageAnnotations}
              moreFuncIsShow={true}
            />

            {/* Generate Report Section */}
            {capturedImages.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-gray-900">Finalizar Análise</h3>
                      <p className="text-sm text-gray-600">
                        Gere o laudo médico com base nas análises realizadas
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        handleClickOnGenerateLaudo();
                        handleGenerateReport();
                      }}
                      className="bg-green-600 hover:bg-green-700 shadow-sm"
                      size="lg"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar Laudo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Laudo Modal */}
            <LaudoModal
              laudoModalOpen={laudoModalOpen}
              setLaudoModalOpen={setLaudoModalOpen}
            />
          </>
        )}
      </div>
    </div>
  );
};