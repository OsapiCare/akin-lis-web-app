"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellRing, ExternalLink, Clock } from "lucide-react";
import { NotificationData, PrioridadeNotificacao } from "@/Api/types/notification.d";
import { useRouter } from "next/navigation";

interface NotificationPreviewProps {
  notifications: NotificationData[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  className?: string;
}

export function NotificationPreview({ notifications, unreadCount, onMarkAsRead, className = "" }: NotificationPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // 🔥 Garante que criado_aos é Date válido
  const recentNotifications = [...notifications].sort((a, b) => new Date(b.criado_aos).getTime() - new Date(a.criado_aos).getTime()).slice(0, 5);

  // Cores da prioridade
  const getPriorityColor = (priority: PrioridadeNotificacao) => {
    const colors: Record<PrioridadeNotificacao, string> = {
      CRITICA: "bg-red-500",
      ALTA: "bg-orange-500",
      NORMAL: "bg-blue-500",
      BAIXA: "bg-gray-500",
    };
    return colors[priority];
  };

  // Formatar "há X minutos"
  const formatTimeAgo = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));

    if (diff < 60) return `${diff}min`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.lida) {
      onMarkAsRead(notification.id);
    }

    if (notification.acao_url) {
      router.push(notification.acao_url);
    }

    setIsOpen(false);
  };

  const handleViewAll = () => {
    router.push("/akin/notifications");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          {unreadCount > 0 ? <BellRing className="h-6 w-6 text-akin-turquoise" /> : <Bell className="h-6 w-6" />}

          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1 rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notificações</h3>

            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} não lidas
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="p-2">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentNotifications.map((notification: NotificationData) => (
                  <div key={notification.id} className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${!notification.lida ? "bg-blue-50 border-l-2 border-l-akin-turquoise" : ""}`} onClick={() => handleNotificationClick(notification)}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(notification.prioridade)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-medium truncate ${!notification.lida ? "text-gray-900" : "text-gray-700"}`}>{notification.titulo}</p>

                          {!notification.lida && <div className="w-2 h-2 bg-akin-turquoise rounded-full ml-2" />}
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{notification.mensagem}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(notification.criado_aos)}
                          </div>

                          {notification.acao_url && <ExternalLink className="h-3 w-3 text-gray-400" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {recentNotifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" size="sm" onClick={handleViewAll} className="w-full text-akin-turquoise hover:bg-akin-turquoise/80 hover:bg-akin-turquoise/10">
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationPreview;
