"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Mic, MicOff, Minimize2, Maximize2, X, Bot, User, Volume2, VolumeX, Loader2, Paperclip, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { _axios } from "@/Api/axios.config";
import { iaAgentRoutes } from "@/Api/Routes/IA_Agent/index.routes";
import { useAuthStore } from "@/utils/zustand-store/authStore";
import { chatbotToast } from "./chatbot-toast";
import { TypingIndicator } from "./TypingIndicator";

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
  type: "text" | "audio";
  audioUrl?: string;
  isTyping?: boolean;
}

interface ChatbotProps {
  isChatOpen: boolean;
  onClose: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isChatOpen, onClose }) => {
  const { user, token } = useAuthStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dados do usuário
  const { data: userData } = useQuery({
    queryKey: ["user-data"],
    queryFn: async () => {
      return await _axios.get(`/users/${user?.id}`);
    },
    refetchInterval: 1000 * 60 * 5,
    enabled: !!user?.id,
  });

  const tipo = userData?.data?.tipo === "CHEFE" ? "chefe_laboratorio" : userData?.data?.tipo === "RECEPCIONISTA" ? "recepsionista" : "tecnico";

  // Scroll automático para mensagens
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mutação para enviar mensagem
  const mutation = useMutation({
    mutationFn: async ({ message, audio }: { message: string; audio?: File }) => {
      if (!user || !token || !userData?.data) {
        throw new Error("Dados de autenticação ausentes.");
      }

      return await iaAgentRoutes.sendMessageToAgent(
        {
          message,
          // user_id: user.id,
          token_acess: token,
          email_recepcionista: userData.data.email,
          senha_recepcionista: userData.data.senha,
          // audioFile: audio,
        },
        tipo
      );
    },
    onMutate: () => {
      // Adicionar indicador de digitação
      const typingMessage: Message = {
        id: `typing-${Date.now()}`,
        sender: "agent",
        text: "",
        timestamp: new Date(),
        type: "text",
        isTyping: true,
      };
      setMessages((prev) => [...prev, typingMessage]);
    },
    onSuccess: (data) => {
      // Remover indicador de digitação
      setMessages((prev) => prev.filter((msg) => !msg.isTyping));

      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: data.response || "Sem resposta do agente.",
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, agentMessage]);
      setInput("");
      setAudioFile(null);

      // Reproduzir som de notificação se não estiver silenciado
      if (!isMuted) {
        playNotificationSound();
      }
    },
    onError: (error) => {
      // Remover indicador de digitação
      setMessages((prev) => prev.filter((msg) => !msg.isTyping));

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: "agent",
        text: "Desculpe, houve um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, errorMessage]);
      chatbotToast.error("Erro ao enviar mensagem");
    },
  });

  const handleSendMessage = () => {
    if (!input.trim() && !audioFile) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input || (audioFile ? "Mensagem de áudio" : ""),
      timestamp: new Date(),
      type: audioFile ? "audio" : "text",
      audioUrl: audioFile ? URL.createObjectURL(audioFile) : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    mutation.mutate({ message: input, audio: audioFile ?? undefined });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        const audioFile = new File([audioBlob], "audio.mp3", { type: "audio/mp3" });
        setAudioFile(audioFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      chatbotToast.success("Gravação iniciada");
    } catch (error) {
      chatbotToast.error("Erro ao acessar o microfone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      chatbotToast.success("Gravação finalizada");
    }
  };

  const clearAudio = () => {
    setAudioFile(null);
  };

  const playNotificationSound = () => {
    // Implementar som de notificação
    const audio = new Audio("/sounds/notification.mp3");
    audio.play().catch(() => {
      // Ignorar erros de reprodução automática
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearChat = () => {
    setMessages([]);
    chatbotToast.success("Conversa limpa");
  };

  if (!isChatOpen) return null;

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`fixed bottom-20 right-6 z-50 bg-white shadow-2xl rounded-xl border border-gray-200 flex flex-col overflow-hidden ${isMinimized ? "w-80 h-16" : "w-96 h-[500px]"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-akin-turquoise to-akin-turquoise/80 text-white">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-white/20 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">Chat-kin</h3>
                  <p className="text-xs opacity-90">{mutation.isPending ? "Digitando..." : "Assistente Virtual"}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)} className="text-white hover:bg-white/20 w-8 h-8 p-0">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isMuted ? "Ativar som" : "Silenciar"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="text-white hover:bg-white/20 w-8 h-8 p-0">
                      {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isMinimized ? "Expandir" : "Minimizar"}</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 w-8 h-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={clearChat}>Limpar conversa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 w-8 h-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <Bot className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500 text-sm">Olá! Sou o Chat-kin, seu assistente virtual.</p>
                        <p className="text-gray-400 text-xs mt-1">Como posso ajudá-lo hoje?</p>
                      </div>
                    )}

                    {messages.map((message) => (
                      <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                        {message.sender === "agent" && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-akin-turquoise text-white">
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={`max-w-[75%] ${message.sender === "user" ? "order-1" : ""}`}>
                          <div className={`px-4 py-2 rounded-2xl ${message.sender === "user" ? "bg-akin-turquoise text-white" : "bg-gray-100 text-gray-900"}`}>
                            {message.isTyping ? (
                              <TypingIndicator />
                            ) : message.type === "audio" && message.audioUrl ? (
                              <div className="flex items-center gap-2">
                                <audio controls className="max-w-full">
                                  <source src={message.audioUrl} type="audio/mp3" />
                                </audio>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 px-1">{formatTime(message.timestamp)}</p>
                        </div>

                        {message.sender === "user" && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-500 text-white">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <Separator />

                {/* Audio Preview */}
                {audioFile && (
                  <div className="p-3 bg-gray-50 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Mic className="w-3 h-3" />
                          Áudio gravado
                        </Badge>
                        <audio controls className="h-8">
                          <source src={URL.createObjectURL(audioFile)} type="audio/mp3" />
                        </audio>
                      </div>
                      <Button variant="ghost" size="sm" onClick={clearAudio} className="text-red-500 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-gray-50">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <Input ref={inputRef} type="text" placeholder="Digite sua mensagem..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} disabled={mutation.isPending} className="pr-12 resize-none" />
                      {/* <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" disabled>
                              <Paperclip className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Anexar arquivo</TooltipContent>
                        </Tooltip>
                      </div> */}
                    </div>

                    {/* <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={isRecording ? stopRecording : startRecording} disabled={mutation.isPending} className={`w-10 h-10 p-0 ${isRecording ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : ""}`}>
                          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isRecording ? "Parar gravação" : "Gravar áudio"}</TooltipContent>
                    </Tooltip> */}

                    <Button onClick={handleSendMessage} disabled={(!input.trim() && !audioFile) || mutation.isPending} className="bg-akin-turquoise hover:bg-akin-turquoise/80 w-10 h-10 p-0">
                      {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};
