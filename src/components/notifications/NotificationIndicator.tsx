"use client";

import { useState, useEffect } from "react";
import { NotificationData } from "@/Api/types/notification.d";
import { notificationRoutes } from "@/Api/Routes/notification/index.routes";
import { NotificationPreview } from "./NotificationPreview";

interface NotificationIndicatorProps {
  userId?: string;
  className?: string;
  showPreview?: boolean;
}

export function NotificationIndicator({
  userId,
  className = "",
  showPreview = true
}: NotificationIndicatorProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data para demonstração - substituir pela chamada real da API
  useEffect(() => {
    if(!userId) return;

    const fetchNotifications = async () => {
      try {
        const response = await notificationRoutes.getNotificationsByUserId(userId);
    // const mockNotifications: NotificationData[] = [
    //   {
    //     id: "1",
    //     titulo: "Estoque Baixo",
    //     mensagem: "O material 'Seringas 5ml' está com estoque baixo",
    //     lida: false,
    //     tipo_destinatario: "CHEFE",
    //     acao_url: "/akin/stock-control/product",
    //     prioridade: "ALTA",
    //     criado_aos: new Date(Date.now() - 1000 * 60 * 30),
    //     id_usuario: "user-1",
    //     usuario: { id: "user-1", nome: "Sistema", email: "sistema@akin.com" }
    //   },
    //   {
    //     id: "2",
    //     titulo: "Novo Agendamento",
    //     mensagem: "Paciente Maria Silva agendou exame de hemograma",
    //     lida: false,
    //     tipo_destinatario: "TECNICO",
    //     acao_url: "/akin/schedule/request",
    //     prioridade: "NORMAL",
    //     criado_aos: new Date(Date.now() - 1000 * 60 * 60 * 2),
    //     id_usuario: "user-2",
    //     usuario: { id: "user-2", nome: "Maria Silva", email: "maria@email.com" }
    //   },
    //   {
    //     id: "3",
    //     titulo: "Resultado Crítico",
    //     mensagem: "Resultado de exame com valores críticos detectados",
    //     lida: true,
    //     tipo_destinatario: "CHEFE",
    //     acao_url: "/akin/report",
    //     prioridade: "CRITICA",
    //     criado_aos: new Date(Date.now() - 1000 * 60 * 60 * 4),
    //     id_usuario: "user-3",
    //     usuario: { id: "user-3", nome: "Dr. Carlos", email: "carlos@akin.com" }
    //   }
    // ];

    setNotifications(response);
    const unread = response.filter((n: NotificationData) => !n.lida);
    setUnreadCount(unread.length);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    };

    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationRoutes.updateNotificationStatus(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, lida: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  if (showPreview) {
    return (
      <NotificationPreview
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        className={className}
      />
    );
  }

  // Versão simples sem preview
  return null;
}

export default NotificationIndicator;
