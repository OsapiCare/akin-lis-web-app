import { agentUrl } from "@/Api/api";

interface IA_AgentRoutesInterface {
  user_id?:string;
  session_id?:string;
  message: string;
  email_recepcionista: string;
  senha_recepcionista: string;
  token_acess: string;
}

type UserTipo = "CHEFE" | "RECEPCIONISTA" | "RECEPSIONISTA" | "TECNICO";

const AGENT_ROUTE_MAP: Record<UserTipo, string> = {
  CHEFE: "chefe_laboratorio",
  RECEPCIONISTA: "recepsionista",
  RECEPSIONISTA: "recepsionista",
  TECNICO: "tecnico",
};

class IA_AgentRoutes {
  async sendMessageToAgent(data: IA_AgentRoutesInterface, userTipo: string) {
    const normalizedTipo = userTipo?.toUpperCase() as UserTipo;
    const route = AGENT_ROUTE_MAP[normalizedTipo];

    if (!route) throw new Error(`Invalid user type: ${userTipo}`);

    // Envia JSON diretamente
    const response = await agentUrl.post(`/${route}`, {
      message: data.message,
      email_recepcionista: data.email_recepcionista,
      senha_recepcionista: data.senha_recepcionista,
      token_acess: data.token_acess,
    }, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  }
}

export const iaAgentRoutes = new IA_AgentRoutes();
