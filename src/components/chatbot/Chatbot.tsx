import { _axios } from "@/Api/axios.config";
import { iaAgentRoutes } from "@/Api/Routes/IA_Agent/index.routes";
import { useAuthStore } from "@/utils/zustand-store/authStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import React, { useState } from "react";

interface ChatbotProps {
  isChatOpen: boolean;
  onClose: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isChatOpen, onClose }) => {
  const { user, token } = useAuthStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ sender: "user" | "agent"; text: string }[]>([]);

  const { data } = useQuery({
    queryKey: ["user-data"],
    queryFn: async () => {
      return await _axios.get(`/users/${user?.id}`);
    },
    refetchInterval: 1000 * 60 * 5,
  });

  const tipo = data?.data?.tipo === "CHEFE" ? "chefe_laboratorio" : data?.data?.tipo === "RECEPCIONISTA" ? "recepsionista" : "tecnico";

  const mutation = useMutation({
    mutationFn: async (texto: string) => {
      if (!user || !token || !data?.data) {
        throw new Error("Usuário, token ou dados do usuário ausentes.");
      }
      return await iaAgentRoutes.sendMessageToAgent(
        {
          message: texto,
          user_id: user.id,
          session_id: token,
          email_recepcionista: data.data.email,
          senha_recepcionista: data.data.senha,
          token_acess: token,
        },
        tipo
      );
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { sender: "agent", text: data.response || "Sem nenhuma resposta do agente." }]);
      setInput("");
    },
    onError: (e) => {
      setMessages((prev) => [...prev, { sender: "agent", text: "Erro ao conectar com o agente." }]);
    },
  });

  const handleEnviar = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    mutation.mutate(input);
  };

  if (!isChatOpen) return null;

  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 right-6 z-50 w-80 h-96 bg-white shadow-xl rounded-lg border border-gray-300 flex flex-col"
        >
          <header className="flex justify-between items-center p-3 bg-akin-turquoise text-white rounded-t-lg">
            <h2 className="text-sm font-semibold">Chat-kin</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XIcon size={20} />
            </button>
          </header>
          <div className="p-4 overflow-y-auto flex-1 space-y-2 text-sm">
            {messages.length === 0 && <p className="text-gray-500">Comece sua conversa...</p>}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-lg max-w-[80%] ${msg.sender === "user" ? "bg-akin-turquoise text-white" : "bg-gray-100 text-gray-800"}`}>{msg.text}</div>
              </div>
            ))}
            {mutation.isPending && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-400 max-w-[80%]">A carregar resposta...</div>
              </div>
            )}
          </div>
          <footer className="p-3 border-t border-gray-300 flex">
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
              onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
              disabled={mutation.isPending}
            />
            <button onClick={handleEnviar} className="ml-2 px-3 py-2 bg-akin-turquoise text-white rounded-md hover:bg-akin-turquoise transition-all" disabled={mutation.isPending}>
              ➤
            </button>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
