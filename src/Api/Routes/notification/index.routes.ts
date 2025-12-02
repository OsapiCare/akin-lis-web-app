import { _axios } from "@/Api/axios.config";

class NotificationRoutes {

  async getAllNotifications() {
    const response = await _axios.get("/notification");
    return response.data;
  }
  
  async getNotificationsByUserId(id_usuario: string) {
    const response = await _axios.get(`/notification/${id_usuario}`);
    return response.data;
  }

  async updateNotificationStatus(notificationId: string) {
    const response = await _axios.patch(`/notification/${notificationId}/read`);
    return response.data;
  }
}

export const notificationRoutes = new NotificationRoutes();