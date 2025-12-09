"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Save } from "lucide-react"
import type { Figure, Annotation, Tool } from "../page"

interface AnnotationCanvasProps {
  imageUrl: string
  annotations: Annotation[]
  figures: Figure[]
  selectedFigure: Figure | null
  activeTool: Tool
  selectedAnnotation: string | null
  zoomLevel: number
  canvasPosition: { x: number; y: number }
  onAddAnnotation: (annotation: Omit<Annotation, "id">) => void
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void
  onDeleteAnnotation: (id: string) => void
  onSelectAnnotation: (id: string | null) => void
  onCanvasPositionChange: (position: { x: number; y: number }) => void
}

interface DrawingState {
  isDrawing: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface ResizeHandle {
  x: number
  y: number
  cursor: string
  position: "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"
}

export function AnnotationCanvas({
  imageUrl,
  annotations,
  figures,
  selectedFigure,
  activeTool,
  selectedAnnotation,
  zoomLevel,
  canvasPosition,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onSelectAnnotation,
  onCanvasPositionChange,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  })
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false)
  const [pendingAnnotation, setPendingAnnotation] = useState<Omit<Annotation, "id" | "text"> | null>(null)
  const [annotationText, setAnnotationText] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Event listener para exportar imagem
  useEffect(() => {
    const handleExport = () => {
      exportImage()
    }
    window.addEventListener("exportImage", handleExport)
    return () => window.removeEventListener("exportImage", handleExport)
  }, [])

  const getResizeHandles = useCallback(
    (annotation: Annotation): ResizeHandle[] => {
      const handles: ResizeHandle[] = []
      const { x, y, width, height } = annotation
      const scale = zoomLevel / 100

      handles.push(
        { x: (x - 4) * scale, y: (y - 4) * scale, cursor: "nw-resize", position: "nw" },
        { x: (x + width - 4) * scale, y: (y - 4) * scale, cursor: "ne-resize", position: "ne" },
        { x: (x - 4) * scale, y: (y + height - 4) * scale, cursor: "sw-resize", position: "sw" },
        { x: (x + width - 4) * scale, y: (y + height - 4) * scale, cursor: "se-resize", position: "se" },
        { x: (x + width / 2 - 4) * scale, y: (y - 4) * scale, cursor: "n-resize", position: "n" },
        { x: (x + width / 2 - 4) * scale, y: (y + height - 4) * scale, cursor: "s-resize", position: "s" },
        { x: (x - 4) * scale, y: (y + height / 2 - 4) * scale, cursor: "w-resize", position: "w" },
        { x: (x + width - 4) * scale, y: (y + height / 2 - 4) * scale, cursor: "e-resize", position: "e" },
      )

      return handles
    },
    [zoomLevel],
  )

  const drawShape = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      figure: Figure,
      x: number,
      y: number,
      width: number,
      height: number,
      isSelected = false,
    ) => {
      const scale = zoomLevel / 100
      const scaledX = x * scale
      const scaledY = y * scale
      const scaledWidth = width * scale
      const scaledHeight = height * scale

      ctx.strokeStyle = figure.color
      ctx.fillStyle = figure.color + "20"
      ctx.lineWidth = (isSelected ? 3 : 2) * scale

      switch (figure.shape) {
        case "rectangle":
          ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight)
          ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight)
          break
        case "circle":
          const centerX = scaledX + scaledWidth / 2
          const centerY = scaledY + scaledHeight / 2
          const radius = Math.min(Math.abs(scaledWidth), Math.abs(scaledHeight)) / 2
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
          ctx.stroke()
          ctx.fill()
          break
        case "polygon":
          const hexCenterX = scaledX + scaledWidth / 2
          const hexCenterY = scaledY + scaledHeight / 2
          const hexRadius = Math.min(Math.abs(scaledWidth), Math.abs(scaledHeight)) / 2
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3
            const pointX = hexCenterX + hexRadius * Math.cos(angle)
            const pointY = hexCenterY + hexRadius * Math.sin(angle)
            if (i === 0) ctx.moveTo(pointX, pointY)
            else ctx.lineTo(pointX, pointY)
          }
          ctx.closePath()
          ctx.stroke()
          ctx.fill()
          break
        case "arrow":
          const arrowStartX = scaledX
          const arrowStartY = scaledY + scaledHeight / 2
          const arrowEndX = scaledX + scaledWidth
          const arrowEndY = scaledY + scaledHeight / 2
          const headLength = Math.min(scaledWidth * 0.3, 20 * scale)

          ctx.beginPath()
          ctx.moveTo(arrowStartX, arrowStartY)
          ctx.lineTo(arrowEndX, arrowEndY)
          ctx.moveTo(arrowEndX, arrowEndY)
          ctx.lineTo(arrowEndX - headLength, arrowEndY - headLength / 2)
          ctx.moveTo(arrowEndX, arrowEndY)
          ctx.lineTo(arrowEndX - headLength, arrowEndY + headLength / 2)
          ctx.stroke()
          break
        case "line":
          ctx.beginPath()
          ctx.moveTo(scaledX, scaledY)
          ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight)
          ctx.stroke()
          break
        case "text":
          ctx.fillStyle = figure.color
          ctx.font = `${Math.max(12, Math.min(scaledWidth / 8, 24)) * scale}px Arial`
          ctx.fillText("Texto", scaledX + 5 * scale, scaledY + scaledHeight / 2)
          ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight)
          break
      }
    },
    [zoomLevel],
  )

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const scale = zoomLevel / 100
    canvas.width = image.width * scale
    canvas.height = image.height * scale

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    // Desenhar anotações existentes
    annotations.forEach((annotation, index) => {
      const figure = figures.find((f) => f.id === annotation.figureId)
      if (!figure) return

      const isSelected = selectedAnnotation === annotation.id
      drawShape(ctx, figure, annotation.x, annotation.y, annotation.width, annotation.height, isSelected)

      // Desenhar número da anotação
      ctx.fillStyle = figure.color
      ctx.font = `${14 * scale}px Arial`
      ctx.fillText((index + 1).toString(), (annotation.x + 5) * scale, (annotation.y + 20) * scale)

      // Desenhar handles de redimensionamento se selecionado
      if (isSelected && activeTool === "select") {
        const handles = getResizeHandles(annotation)
        ctx.fillStyle = "#3b82f6"
        ctx.strokeStyle = "#1e40af"
        ctx.lineWidth = 1

        handles.forEach((handle) => {
          ctx.fillRect(handle.x, handle.y, 8 * scale, 8 * scale)
          ctx.strokeRect(handle.x, handle.y, 8 * scale, 8 * scale)
        })
      }
    })

    // Desenhar forma sendo desenhada
    if (drawingState.isDrawing && selectedFigure && activeTool === "draw") {
      const width = drawingState.currentX - drawingState.startX
      const height = drawingState.currentY - drawingState.startY
      drawShape(ctx, selectedFigure, drawingState.startX, drawingState.startY, width, height)
    }
  }, [
    annotations,
    figures,
    drawingState,
    selectedFigure,
    selectedAnnotation,
    activeTool,
    zoomLevel,
    drawShape,
    getResizeHandles,
  ])

  useEffect(() => {
    const image = new Image()
    image.onload = () => {
      drawImage()
    }
    image.src = imageUrl
    //@ts-ignore
    imageRef.current = image
  }, [imageUrl, drawImage])

  useEffect(() => {
    drawImage()
  }, [drawImage])

  const getCanvasCoordinates = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scale = zoomLevel / 100
      const scaleX = canvas.width / scale / rect.width
      const scaleY = canvas.height / scale / rect.height

      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      }
    },
    [zoomLevel],
  )

  const getClickedAnnotation = useCallback(
    (x: number, y: number) => {
      return annotations.find((annotation) => {
        return (
          x >= annotation.x &&
          x <= annotation.x + annotation.width &&
          y >= annotation.y &&
          y <= annotation.y + annotation.height
        )
      })
    },
    [annotations],
  )

  const getClickedHandle = useCallback(
    (x: number, y: number, annotation: Annotation) => {
      const handles = getResizeHandles(annotation)
      const scale = zoomLevel / 100
      return handles.find(
        (handle) =>
          x * scale >= handle.x &&
          x * scale <= handle.x + 8 * scale &&
          y * scale >= handle.y &&
          y * scale <= handle.y + 8 * scale,
      )
    },
    [getResizeHandles, zoomLevel],
  )

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCanvasCoordinates(event)

      if (activeTool === "pan") {
        setIsPanning(true)
        setPanStart({ x: event.clientX - canvasPosition.x, y: event.clientY - canvasPosition.y })
        return
      }

      if (activeTool === "select") {
        const clickedAnnotation = getClickedAnnotation(coords.x, coords.y)

        if (clickedAnnotation) {
          if (selectedAnnotation === clickedAnnotation.id) {
            const handle = getClickedHandle(coords.x, coords.y, clickedAnnotation)
            if (handle) {
              setIsResizing(true)
              setResizeHandle(handle.position)
              return
            }
          }

          onSelectAnnotation(clickedAnnotation.id)
          setIsDragging(true)
          setDragOffset({
            x: coords.x - clickedAnnotation.x,
            y: coords.y - clickedAnnotation.y,
          })
        } else {
          onSelectAnnotation(null)
        }
      } else if (activeTool === "draw" && selectedFigure) {
        setDrawingState({
          isDrawing: true,
          startX: coords.x,
          startY: coords.y,
          currentX: coords.x,
          currentY: coords.y,
        })
      }
    },
    [
      getCanvasCoordinates,
      activeTool,
      canvasPosition.x,
      canvasPosition.y,
      getClickedAnnotation,
      selectedAnnotation,
      getClickedHandle,
      onSelectAnnotation,
      selectedFigure,
    ],
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPanning) {
        onCanvasPositionChange({
          x: event.clientX - panStart.x,
          y: event.clientY - panStart.y,
        })
        return
      }

      const coords = getCanvasCoordinates(event)

      if (activeTool === "select" && selectedAnnotation) {
        const annotation = annotations.find((a) => a.id === selectedAnnotation)
        if (!annotation) return

        if (isDragging) {
          const newX = coords.x - dragOffset.x
          const newY = coords.y - dragOffset.y
          onUpdateAnnotation(selectedAnnotation, { x: newX, y: newY })
        } else if (isResizing && resizeHandle) {
          let newX = annotation.x
          let newY = annotation.y
          let newWidth = annotation.width
          let newHeight = annotation.height

          switch (resizeHandle) {
            case "nw":
              newWidth = annotation.width + (annotation.x - coords.x)
              newHeight = annotation.height + (annotation.y - coords.y)
              newX = coords.x
              newY = coords.y
              break
            case "ne":
              newWidth = coords.x - annotation.x
              newHeight = annotation.height + (annotation.y - coords.y)
              newY = coords.y
              break
            case "sw":
              newWidth = annotation.width + (annotation.x - coords.x)
              newHeight = coords.y - annotation.y
              newX = coords.x
              break
            case "se":
              newWidth = coords.x - annotation.x
              newHeight = coords.y - annotation.y
              break
            case "n":
              newHeight = annotation.height + (annotation.y - coords.y)
              newY = coords.y
              break
            case "s":
              newHeight = coords.y - annotation.y
              break
            case "w":
              newWidth = annotation.width + (annotation.x - coords.x)
              newX = coords.x
              break
            case "e":
              newWidth = coords.x - annotation.x
              break
          }

          if (newWidth > 10 && newHeight > 10) {
            onUpdateAnnotation(selectedAnnotation, {
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
            })
          }
        }
      } else if (activeTool === "draw" && drawingState.isDrawing) {
        setDrawingState((prev) => ({
          ...prev,
          currentX: coords.x,
          currentY: coords.y,
        }))
      }
    },
    [
      isPanning,
      panStart.x,
      panStart.y,
      onCanvasPositionChange,
      getCanvasCoordinates,
      activeTool,
      selectedAnnotation,
      annotations,
      isDragging,
      dragOffset,
      onUpdateAnnotation,
      isResizing,
      resizeHandle,
      drawingState.isDrawing,
    ],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)

    if (activeTool === "select") {
      setIsDragging(false)
      setIsResizing(false)
      setResizeHandle(null)
    } else if (activeTool === "draw" && drawingState.isDrawing && selectedFigure) {
      const width = drawingState.currentX - drawingState.startX
      const height = drawingState.currentY - drawingState.startY

      if (Math.abs(width) > 10 && Math.abs(height) > 10) {
        setPendingAnnotation({
          figureId: selectedFigure.id,
          x: Math.min(drawingState.startX, drawingState.currentX),
          y: Math.min(drawingState.startY, drawingState.currentY),
          width: Math.abs(width),
          height: Math.abs(height),
          isOpen: false,
        })
        setShowAnnotationDialog(true)
      }

      setDrawingState({
        isDrawing: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
      })
    }
  }, [activeTool, drawingState, selectedFigure])

  const handleSaveAnnotation = useCallback(() => {
    if (pendingAnnotation) {
      onAddAnnotation({
        ...pendingAnnotation,
        text: annotationText,
      })
      setPendingAnnotation(null)
      setAnnotationText("")
      setShowAnnotationDialog(false)
    }
  }, [pendingAnnotation, annotationText, onAddAnnotation])

  const exportImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "imagem-anotada.png"
    link.href = canvas.toDataURL()
    link.click()
  }, [])

  const getCursorStyle = useCallback(() => {
    switch (activeTool) {
      case "draw":
        return "cursor-crosshair"
      case "pan":
        return isPanning ? "cursor-grabbing" : "cursor-grab"
      case "zoom":
        return "cursor-zoom-in"
      default:
        return "cursor-pointer"
    }
  }, [activeTool, isPanning])

  return (
    <div className="h-full flex flex-col">
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-50 p-4"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      >
        <div
          className="inline-block shadow-lg"
          style={{
            transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px)`,
          }}
        >
          <canvas
            ref={canvasRef}
            className={`border border-gray-300 bg-white ${getCursorStyle()}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>
      </div>

      <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Anotação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Texto da anotação:</label>
              <Textarea
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                placeholder="Digite sua anotação aqui..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAnnotationDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAnnotation}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}