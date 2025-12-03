"use client";

import { useState, useEffect } from "react";
import { NotificationData } from "@/Api/types/notification.d";
import { notificationRoutes } from "@/Api/Routes/notification/index.routes";
import { NotificationPreview } from "./NotificationPreview";

interface NotificationIndicatorProps {
  id_usuario?: string;
  className?: string;
  showPreview?: boolean;
}

export function NotificationIndicator({ id_usuario, className = "", showPreview = true }: NotificationIndicatorProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationRoutes.getAllNotifications();
        const notificationsArray: NotificationData[] = Array.isArray(response.notificacoes) ? response.notificacoes : [];

        setNotifications(notificationsArray);

        const unread = notificationsArray.filter((n) => !n.lida);
        setUnreadCount(unread.length);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    };

    fetchNotifications();
  }, [id_usuario]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationRoutes.updateNotificationStatus(notificationId);

      setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, lida: true } : notif)));

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  if (showPreview) {
    return <NotificationPreview notifications={notifications} unreadCount={unreadCount} onMarkAsRead={handleMarkAsRead} className={className} />;
  }

  return null;
}

export default NotificationIndicator;