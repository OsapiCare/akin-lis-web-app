/* eslint-disable jsx-a11y/alt-text */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Mail, Link as LinkIcon, MessageCircle, Download, Eye, Plus, Trash2, QrCode } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface LaudoModalProps {
  laudoModalOpen: boolean;
  setLaudoModalOpen: (isOpen: boolean) => void;
}

interface ExamParameter {
  id: string;
  parameter: string;
  result: string;
  unit: string;
  reference: string;
}

interface PatientData {
  name: string;
  id: string;
  birthDate: string;
  sex: string;
  collectionDate: string;
  issueDate: string;
  requestingDoctor: string;
}

interface ReportData {
  institution: string;
  examType: string;
  patient: PatientData;
  parameters: ExamParameter[];
  observations: string;
  technician: string;
  registration: string;
}

interface InfoPatient {
  nomePaciente: string;
  idadePaciente: number;
  identificacaoPaciente: string;
  detalhesAnalise: string;
  assinaturaDoutor: string;
  conclusao: string;
  tipoExame: string;
  dataNascimento: string;
  sexo: string;
  dataColeta: string;
  medicoSolicitante: string;
}


const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 12 },
  section: { marginBottom: 10, borderBottom: '1px solid #ccc', paddingBottom: 10 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  text: { marginBottom: 5 },
  image: { width: 150, height: 150, margin: 5 },
  imgDiv: {
    display: 'flex',
    flexDirection: "row",
    justifyContent: 'space-between',
    gap: 5
  }
});

const getDate = new Date();
const LaudoPDF: React.FC<InfoPatient> = ({
  nomePaciente, idadePaciente, identificacaoPaciente, detalhesAnalise, conclusao,
  assinaturaDoutor, tipoExame, dataNascimento, sexo, dataColeta, medicoSolicitante
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={[styles.title, { textAlign: 'center' }]}>Laudo de Microscopia</Text>
        <Text style={{ textAlign: 'center' }}>Tipo de Exame: {tipoExame}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Dados do Paciente</Text>
        <Text>Nome: {nomePaciente}</Text>
        <Text>ID do Paciente: {identificacaoPaciente}</Text>
        <Text>Data de Nascimento: {dataNascimento}   Sexo: {sexo}</Text>
        <Text>Data de Coleta: {dataColeta}   Data de Emissão: {new Date().toLocaleDateString()}</Text>
        <Text>Médico Solicitante: {medicoSolicitante}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Resultados do Exame</Text>
        <Text>Parâmetro | Resultado | Unidade | Intervalo de Referência</Text>
        <Text>_______________________________________________________</Text>
        <Text>{detalhesAnalise}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Observações e Interpretações</Text>
        <Text>{conclusao}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Imagens Anexas</Text>
        <Text>Adicionar imagens capturadas durante o exame:</Text>
        <View style={styles.imgDiv}>
          <Image src="https://via.placeholder.com/150" style={styles.image} />
          <Image src="https://via.placeholder.com/150" style={styles.image} />
        </View>
      </View>

      <View style={{ ...styles.section, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text>_______________________________</Text>
          <Text>Técnico Responsável</Text>
        </View>
        <Image
          src="https://api.qrserver.com/v1/create-qr-code/?data=https://meuslaudos.com/laudo/abc123&size=100x100"
          style={{ width: 80, height: 80 }}
        />
      </View>

      <Text style={{ marginTop: 10, fontStyle: 'italic', textAlign: 'center' }}>
        Laudo válido somente com assinatura do responsável técnico.
      </Text>
    </Page>
  </Document>
);


export const LaudoModal = ({ laudoModalOpen, setLaudoModalOpen }: LaudoModalProps) => {
  const [reportData, setReportData] = useState<ReportData>({
    institution: "Hospital Central",
    examType: "Análise Citopatológica",
    patient: {
      name: "João da Silva",
      id: "#12345",
      birthDate: "1978-03-15",
      sex: "Masculino",
      collectionDate: "2025-06-15",
      issueDate: new Date().toISOString().split("T")[0],
      requestingDoctor: "Dr. Rafael Almeida",
    },
    parameters: [
      { id: "1", parameter: "Hemoglobina", result: "14.2", unit: "g/dL", reference: "12.0-16.0" }
    ],
    observations: "Durante a análise microscópica, foi possível observar estruturas celulares compatíveis com um tecido saudável. Não foram identificados sinais de anormalidades significativas.",
    technician: "Carlos Eduardo Silva",
    registration: "CRF-12345",
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const addParameter = () => {
    const newParameter: ExamParameter = {
      id: Date.now().toString(),
      parameter: "",
      result: "",
      unit: "",
      reference: "",
    };
    setReportData((prev) => ({
      ...prev,
      parameters: [...prev.parameters, newParameter],
    }));
  };

  const removeParameter = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      parameters: prev.parameters.filter((p) => p.id !== id),
    }));
  };

  const updateParameter = (id: string, field: keyof ExamParameter, value: string) => {
    setReportData((prev) => ({
      ...prev,
      parameters: prev.parameters.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedImages((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Laudo_${reportData.patient.name.replace(/\s+/g, "_")}_${reportData.patient.issueDate}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    }
  };

  const shareReport = {
    copyLink: () => {
      const link = `https://meuslaudos.com/laudo/${reportData.patient.id}`;
      navigator.clipboard.writeText(link);
      alert('Link copiado para a área de transferência!');
    },
    whatsapp: () => {
      const mensagem = encodeURIComponent(`Confira o laudo de ${reportData.patient.name}: https://meuslaudos.com/${reportData.patient.id}`);
      window.open(`https://wa.me/?text=${mensagem}`, '_blank');
    },
    email: () => {
      const assunto = encodeURIComponent('Laudo Médico');
      const corpo = encodeURIComponent(`Segue o laudo de ${reportData.patient.name}: https://meuslaudos.com/${reportData.patient.id}`);
      window.location.href = `mailto:?subject=${assunto}&body=${corpo}`;
    }
  };

  const isFormValid = () => {
    return (
      reportData.institution &&
      reportData.examType &&
      reportData.patient.name &&
      reportData.patient.id &&
      reportData.technician &&
      reportData.registration
    );
  };

  if (showPreview) {
    return (
      <Dialog open={laudoModalOpen} onOpenChange={() => setLaudoModalOpen(false)}>
        <DialogContent className="max-w-6xl w-full h-[95%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Preview do Laudo</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button onClick={generatePDF} disabled={!isFormValid()}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Preview do Laudo */}
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg" ref={reportRef}>
              <CardContent className="p-8">
                {/* Cabeçalho */}
                <div className="text-center mb-8 border-2 border-blue-500 p-6">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                      <span className="text-xs text-gray-500">Logo</span>
                    </div>
                    <p className="text-sm text-gray-600">{reportData.institution}</p>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">Laudo de {reportData.examType}</h1>
                  <div className="text-left">
                    <p>
                      <strong>Tipo de Exame:</strong> {reportData.examType}
                    </p>
                  </div>
                </div>

                {/* Dados do Paciente */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-blue-600 mb-4 border-b-2 border-blue-600 pb-1">
                    Dados do Paciente
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Nome:</strong> {reportData.patient.name}</p>
                    </div>
                    <div>
                      <p><strong>ID do Paciente:</strong> {reportData.patient.id}</p>
                    </div>
                    <div>
                      <p>
                        <strong>Data de Nascimento:</strong>{" "}
                        {reportData.patient.birthDate ? new Date(reportData.patient.birthDate).toLocaleDateString("pt-BR") : "__/__/____"}{" "}
                        <strong>Sexo:</strong> {reportData.patient.sex}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Data de Coleta:</strong>{" "}
                        {reportData.patient.collectionDate ? new Date(reportData.patient.collectionDate).toLocaleDateString("pt-BR") : "__/__/____"}{" "}
                        <strong>Data de Emissão:</strong>{" "}
                        {reportData.patient.issueDate ? new Date(reportData.patient.issueDate).toLocaleDateString("pt-BR") : "__/__/____"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p><strong>Médico Solicitante:</strong> {reportData.patient.requestingDoctor}</p>
                    </div>
                  </div>
                </div>

                {/* Resultados do Exame */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-blue-600 mb-4 border-b-2 border-blue-600 pb-1">
                    Resultados do Exame
                  </h2>
                  <div className="border border-gray-300">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-3 text-left font-semibold">Parâmetro</th>
                          <th className="border border-gray-300 p-3 text-left font-semibold">Resultado</th>
                          <th className="border border-gray-300 p-3 text-left font-semibold">Unidade</th>
                          <th className="border border-gray-300 p-3 text-left font-semibold">Intervalo de Referência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.parameters.map((param, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 p-3">{param.parameter}</td>
                            <td className="border border-gray-300 p-3 bg-yellow-50 font-semibold">{param.result}</td>
                            <td className="border border-gray-300 p-3">{param.unit}</td>
                            <td className="border border-gray-300 p-3">{param.reference}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Observações */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-2">Observações e Interpretações:</h3>
                  <div className="min-h-[100px] border-b border-gray-300 pb-4">
                    <p className="text-sm leading-relaxed">{reportData.observations}</p>
                  </div>
                </div>

                {/* Imagens Anexas */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-blue-600 mb-4 border-b-2 border-blue-600 pb-1">Imagens Anexas</h2>
                  <p className="text-sm text-gray-600 mb-4">Imagens capturadas durante o exame:</p>
                  <div className="grid grid-cols-2 gap-4">
                    {uploadedImages.length > 0 ? (
                      uploadedImages.slice(0, 4).map((image, index) => (
                        <div key={index} className="border border-gray-300 h-32 flex items-center justify-center bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Imagem ${index + 1}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="border-2 border-dashed border-gray-300 h-32 flex items-center justify-center bg-gray-50">
                          <span className="text-gray-500 text-sm">Imagem 1</span>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 h-32 flex items-center justify-center bg-gray-50">
                          <span className="text-gray-500 text-sm">Imagem 2</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Rodapé */}
                <div className="flex justify-between items-end mt-12">
                  <div>
                    <div className="border-b border-gray-400 w-64 mb-2"></div>
                    <p className="text-sm"><strong>Técnico Responsável:</strong> {reportData.technician}</p>
                    <p className="text-sm"><strong>Nº Reg. Prof.:</strong> {reportData.registration}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 border border-gray-400 flex items-center justify-center mb-2">
                      <QrCode className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">QR Code</p>
                  </div>
                </div>

                <div className="text-center mt-8 pt-4 border-t border-gray-300">
                  <p className="text-xs text-gray-500">Laudo válido somente com assinatura do responsável técnico.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={shareReport.copyLink}
                  >
                    <LinkIcon className="w-4 h-4" /> Copiar Link
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={shareReport.whatsapp}
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={shareReport.email}
                  >
                    <Mail className="w-4 h-4" /> Email
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
            <Button variant="outline" onClick={() => setLaudoModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog open={laudoModalOpen} onOpenChange={() => setLaudoModalOpen(false)}>
      <DialogContent className="max-w-6xl w-full h-[95%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Laudo de Análise Microscópica</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} disabled={!isFormValid()}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              <Button onClick={generatePDF} disabled={!isFormValid()}>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Configurações Gerais */}
            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Configurações Gerais</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Instituição</label>
                  <Input
                    value={reportData.institution}
                    onChange={(e) => setReportData(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="Nome da instituição"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Exame</label>
                  <Input
                    value={reportData.examType}
                    onChange={(e) => setReportData(prev => ({ ...prev, examType: e.target.value }))}
                    placeholder="Tipo do exame"
                  />
                </div>
              </div>
            </div>

            {/* Dados do Paciente */}
            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold text-blue-600 mb-4">Dados do Paciente</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome Completo</label>
                    <Input
                      value={reportData.patient.name}
                      onChange={(e) => setReportData(prev => ({ ...prev, patient: { ...prev.patient, name: e.target.value } }))}
                      placeholder="Nome do paciente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ID do Paciente</label>
                    <Input
                      value={reportData.patient.id}
                      onChange={(e) => setReportData(prev => ({ ...prev, patient: { ...prev.patient, id: e.target.value } }))}
                      placeholder="Identificação do paciente"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
                    <Input
                      type="date"
                      value={reportData.patient.birthDate}
                      onChange={(e) => setReportData(prev => ({ ...prev, patient: { ...prev.patient, birthDate: e.target.value } }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sexo</label>
                    <Input
                      value={reportData.patient.sex}
                      onChange={(e) => setReportData(prev => ({ ...prev, patient: { ...prev.patient, sex: e.target.value } }))}
                      placeholder="M/F"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Data de Coleta</label>
                    <Input
                      type="date"
                      value={reportData.patient.collectionDate}
                      onChange={(e) => setReportData(prev => ({ ...prev, patient: { ...prev.patient, collectionDate: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Médico Solicitante</label>
                    <Input
                      value={reportData.patient.requestingDoctor}
                      onChange={(e) => setReportData(prev => ({ ...prev, patient: { ...prev.patient, requestingDoctor: e.target.value } }))}
                      placeholder="Nome do médico"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Data de Emissão</label>
                    <Input
                      type="date"
                      value={reportData.patient.issueDate}
                      onChange={(e) => setReportData(prev => ({ ...prev, patient: { ...prev.patient, issueDate: e.target.value } }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resultados do Exame */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-blue-600">Resultados do Exame</h2>
                <Button onClick={addParameter} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Parâmetro
                </Button>
              </div>
              <div className="space-y-4">
                {reportData.parameters.map((param) => (
                  <div key={param.id} className="grid grid-cols-5 gap-2 items-end">
                    <div>
                      <label className="block text-sm font-medium mb-1">Parâmetro</label>
                      <Input
                        value={param.parameter}
                        onChange={(e) => updateParameter(param.id, 'parameter', e.target.value)}
                        placeholder="Nome do parâmetro"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Resultado</label>
                      <Input
                        value={param.result}
                        onChange={(e) => updateParameter(param.id, 'result', e.target.value)}
                        placeholder="Valor"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Unidade</label>
                      <Input
                        value={param.unit}
                        onChange={(e) => updateParameter(param.id, 'unit', e.target.value)}
                        placeholder="g/dL, mg/mL..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Referência</label>
                      <Input
                        value={param.reference}
                        onChange={(e) => updateParameter(param.id, 'reference', e.target.value)}
                        placeholder="12.0-16.0"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeParameter(param.id)}
                      disabled={reportData.parameters.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Observações e Interpretações</h2>
              <Textarea
                value={reportData.observations}
                onChange={(e) => setReportData(prev => ({ ...prev, observations: e.target.value }))}
                placeholder="Descreva as observações e interpretações dos resultados..."
                rows={6}
              />
            </div>

            {/* Imagens Anexas */}
            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold text-blue-600 mb-4">Imagens Anexas</h2>
              <div className="space-y-4">
                <div>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-4"
                  />
                </div>
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative border rounded-lg p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Responsável Técnico</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome Completo</label>
                  <Input
                    value={reportData.technician}
                    onChange={(e) => setReportData(prev => ({ ...prev, technician: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Registro Profissional</label>
                  <Input
                    value={reportData.registration}
                    onChange={(e) => setReportData(prev => ({ ...prev, registration: e.target.value }))}
                    placeholder="Número do registro"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Ações</h2>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => setShowPreview(true)}
                  disabled={!isFormValid()}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar Laudo
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={generatePDF}
                  disabled={!isFormValid()}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Compartilhar</h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={shareReport.copyLink}
                  >
                    <LinkIcon className="w-4 h-4" /> Copiar Link
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={shareReport.whatsapp}
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={shareReport.email}
                  >
                    <Mail className="w-4 h-4" /> Email
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setLaudoModalOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
