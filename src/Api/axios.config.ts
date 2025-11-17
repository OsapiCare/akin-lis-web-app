
import { useAuthStore } from "@/utils/zustand-store/authStore";
import axios from "axios";
export const API_BASE_URL = "https://magnetic-buzzard-osapicare-a83d5229.koyeb.app";

export const _axios = axios.create({
  baseURL: API_BASE_URL,
});

_axios.interceptors.request.use(
  async (config) => {
    const { user, logout } = useAuthStore.getState();

    if (user?.access_token) {
      config.headers['Authorization'] = `Bearer ${user.access_token}`;
    }
    return config;
  },
  (error) => {

    return Promise.reject(error);
  }
);

_axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Evita loops infinitos

      const { user, logout, login, token } = useAuthStore.getState();

      if (user?.id) {
        try {
          // Faz a chamada para renovar o token
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { id: user.id },
            {
              headers: {
                Authorization: `Bearer ${user.refresh_token}`,
              },
            }
          );

          const { access_token, refresh_token } = response.data;

          // Atualiza o estado no zustand com o novo token
          login(access_token, {
            ...user,
            access_token,
            refresh_token,
          });

          // Atualiza o cabeçalho Authorization no request original
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

          // Reenvia a requisição original
          return _axios(originalRequest);

        } catch (refreshError) {
          // Falha ao renovar o token, realiza logout
          // ___showErrorToastNotification({
          //   message: "Erro ao renovar o token",
          //   messages: ["Falha ao renovar o token, por favor fa a o login novamente."],
          // });
          logout();
          return Promise.reject(refreshError);
        }
      } else {
        // Se não houver ID ou refresh_token, realiza logout
        // ___showErrorToastNotification({
        //   message: "Erro ao renovar o token",
        //   messages: ["Falha ao renovar o token, por favor fa a o login novamente."],
        // });
      }
      logout();
    }

    return Promise.reject(error);
  }
);