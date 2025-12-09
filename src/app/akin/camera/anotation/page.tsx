"use client";

import { useState, useEffect, useCallback } from "react";
import { AnnotationCanvas } from "./components/annotation-canvas";
import { ImageCapture } from "./components/image-capture";
import { Toolbar } from "./components/toolbar";
import { AnnotationPanel } from "./components/annotation-panel";
import { FigureManager } from "./components/figure-manager";
import { StatusBar } from "./components/status-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export interface Figure {
  id: string;
  name: string;
  shape: "rectangle" | "circle" | "polygon" | "arrow" | "line" | "text";
  color: string;
}

export interface Annotation {
  id: string;
  figureId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  isOpen: boolean;
}

export type Tool = "select" | "draw" | "pan" | "zoom";

export default function Home() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [figures, setFigures] = useState<Figure[]>([
    { id: "1", name: "Retângulo", shape: "rectangle", color: "#ef4444" },
    { id: "2", name: "Círculo", shape: "circle", color: "#3b82f6" },
    { id: "3", name: "Polígono", shape: "polygon", color: "#10b981" },
    { id: "4", name: "Seta", shape: "arrow", color: "#f59e0b" },
    { id: "5", name: "Linha", shape: "line", color: "#8b5cf6" },
    { id: "6", name: "Texto", shape: "text", color: "#ec4899" },
  ]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });

  const deleteAnnotation = useCallback(
    (id: string) => {
      setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
      if (selectedAnnotation === id) {
        setSelectedAnnotation(null);
      }
    },
    [selectedAnnotation]
  );

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return; // Evitar conflitos com atalhos do navegador

      switch (e.key.toLowerCase()) {
        case "v":
          setActiveTool("select");
          break;
        case "d":
          setActiveTool("draw");
          break;
        case "h":
          setActiveTool("pan");
          break;
        case "z":
          setActiveTool("zoom");
          break;
        case "escape":
          setSelectedFigure(null);
          setSelectedAnnotation(null);
          break;
        case "delete":
        case "backspace":
          if (selectedAnnotation) {
            deleteAnnotation(selectedAnnotation);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAnnotation, deleteAnnotation]);

  const handleImageCapture = (imageData: string) => {
    setCurrentImage(imageData);
    setAnnotations([]);
    setSelectedAnnotation(null);
    setZoomLevel(100);
    setCanvasPosition({ x: 0, y: 0 });
  };

  const addAnnotation = (annotation: Omit<Annotation, "id">) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: Date.now().toString(),
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
  };

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setAnnotations((prev) => prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann)));
  };

  const addFigure = (figure: Omit<Figure, "id">) => {
    const newFigure: Figure = {
      ...figure,
      id: Date.now().toString(),
    };
    setFigures((prev) => [...prev, newFigure]);
  };

  const updateFigure = (id: string, updates: Partial<Figure>) => {
    setFigures((prev) => prev.map((fig) => (fig.id === id ? { ...fig, ...updates } : fig)));
  };

  const deleteFigure = (id: string) => {
    setFigures((prev) => prev.filter((fig) => fig.id !== id));
    setAnnotations((prev) => prev.filter((ann) => ann.figureId !== id));
    if (selectedFigure?.id === id) {
      setSelectedFigure(null);
    }
  };

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    if (tool !== "draw") {
      setSelectedFigure(null);
    }
  };

  const handleFigureSelect = (figure: Figure | null) => {
    setSelectedFigure(figure);
    if (figure) {
      setActiveTool("draw");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Ferramenta de Anotação Profissional</h1>
          <div className="text-sm text-gray-500">{currentImage ? `${annotations.length} anotações` : "Nenhuma imagem carregada"}</div>
        </div>
      </div>

      {/* Toolbar */}
      {currentImage && <Toolbar activeTool={activeTool} selectedFigure={selectedFigure} figures={figures} zoomLevel={zoomLevel} onToolChange={handleToolChange} onFigureSelect={handleFigureSelect} onZoomChange={setZoomLevel} onNewImage={() => setCurrentImage(null)} />}

      <div className="flex-1 flex">
        {/* Área principal */}
        <div className="flex-1 p-4">
          <Card className="h-full">
            {!currentImage ? (
              <div className="h-full flex items-center justify-center">
                <ImageCapture onImageCapture={handleImageCapture} />
              </div>
            ) : (
              <AnnotationCanvas
                imageUrl={currentImage}
                annotations={annotations}
                figures={figures}
                selectedFigure={selectedFigure}
                activeTool={activeTool}
                selectedAnnotation={selectedAnnotation}
                zoomLevel={zoomLevel}
                canvasPosition={canvasPosition}
                onAddAnnotation={addAnnotation}
                onUpdateAnnotation={updateAnnotation}
                onDeleteAnnotation={deleteAnnotation}
                onSelectAnnotation={setSelectedAnnotation}
                onCanvasPositionChange={setCanvasPosition}
              />
            )}
          </Card>
        </div>

        {/* Painel lateral */}
        {currentImage && (
          <div className="w-80 border-l border-gray-200 bg-white">
            <Tabs defaultValue="annotations" className="h-full flex flex-col">
              <div className="border-b border-gray-200">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="annotations">Anotações</TabsTrigger>
                  <TabsTrigger value="figures">Figuras</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="annotations" className="h-full m-0">
                  {/* @ts-ignore */}
                  <AnnotationPanel annotations={annotations} figures={figures} selectedAnnotation={selectedAnnotation} onSelectAnnotation={setSelectedAnnotation} onUpdateAnnotation={updateAnnotation} onDeleteAnnotation={deleteAnnotation} />
                </TabsContent>

                <TabsContent value="figures" className="h-full m-0">
                  <FigureManager figures={figures} selectedFigure={selectedFigure} onAddFigure={addFigure} onUpdateFigure={updateFigure} onDeleteFigure={deleteFigure} onSelectFigure={handleFigureSelect} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {currentImage && <StatusBar activeTool={activeTool} selectedFigure={selectedFigure} selectedAnnotation={selectedAnnotation} zoomLevel={zoomLevel} annotationsCount={annotations.length} canvasPosition={canvasPosition} />}
    </div>
  );
}
