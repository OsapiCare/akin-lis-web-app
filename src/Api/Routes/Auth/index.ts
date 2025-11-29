import { _axios } from "@/Api/axios.config";

class AuthRoutes {

  async login(email: string, senha: string) {
    const response = await _axios.post<User>("/auth/local/signin", { email, senha });
    return response.data;
  }

  async register(data: any) {
    const response = await _axios.post<User>("/auth/local/signup", data);
    return response;
  }

  async getAllUsers() {
    const response = await _axios.get<userDataLogged[]>("/auth/me");
    return response.data;
  }
}

export const authRoutes = new AuthRoutes();