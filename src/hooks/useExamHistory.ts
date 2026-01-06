
export const mockExamHistory: ExamsType[] = [
  {
    id: 1,
    status: "CONCLUIDO",
    status_financeiro: "PAGO",
    status_reembolso: "SEM_REEMBOLSO",
    data_agendamento: "2024-01-15",
    hora_agendamento: "09:00",
    data_formatada: "2024-01-15T09:00:00.000Z",
    duracao: null,
    status_pagamento: "PAGO",
    criado_aos: "2024-01-14T00:00:00.000Z",
    atualizado_aos: "2024-01-15T00:00:00.000Z",
    id_agendamento: 1,
    id_tipo_exame: 1,
    id_tecnico_alocado: "TEC001",
    Tipo_Exame: {
      id: 1,
      nome: "Hemograma Completo",
      preco: 150.0
    },
    Tecnico_Laboratorio: {
      id: "TEC001",
      nome: "Dr. João Silva",
      email: "joao@exemplo.com",
      hash: "",
      hashedRt: "",
      tipo: "TECNICO",
      status: "ATIVO",
      criado_aos: "2024-01-01T00:00:00.000Z",
      atualizado_aos: "2024-01-01T00:00:00.000Z",
      id_unidade_saude: "OSA2025",
      Tecnico_Laboratorio: []
    },
    Agendamento: {
      id: 1,
      id_paciente: 1,
      id_unidade_de_saude: "OSA2025",
      id_recepcionista: null,
      id_chefe_alocado: null,
      status: "CONCLUIDO",
      criado_aos: "2024-01-14T00:00:00.000Z",
      atualizado_aos: "2024-01-15T00:00:00.000Z",
      Paciente: {
        id: 1,
        nome_completo: "Maria Silva",
        id_sexo: 2,
        criado_aos: new Date(),
      },
      Chefe_Laboratorio: null
    }
  },
  {
    id: 2,
    status: "CONCLUIDO",
    status_financeiro: "PAGO",
    status_reembolso: "POR_REEMBOLSAR",
    data_agendamento: "2024-01-14",
    hora_agendamento: "10:30",
    data_formatada: "2024-01-14T10:30:00.000Z",
    duracao: null,
    status_pagamento: "PAGO",
    criado_aos: "2024-01-13T00:00:00.000Z",
    atualizado_aos: "2024-01-14T00:00:00.000Z",
    id_agendamento: 2,
    id_tipo_exame: 2,
    id_tecnico_alocado: "TEC002",
    Tipo_Exame: {
      id: 2,
      nome: "Glicemia de Jejum",
      preco: 80.0
    },
    Tecnico_Laboratorio: {
      id: "TEC002",
      nome: "Dr. Ana Santos",
      email: "ana@exemplo.com",
      hash: "",
      hashedRt: "",
      tipo: "TECNICO",
      status: "ATIVO",
      criado_aos: "2024-01-01T00:00:00.000Z",
      atualizado_aos: "2024-01-01T00:00:00.000Z",
      id_unidade_saude: "OSA2025",
      Tecnico_Laboratorio: []
    },
    Agendamento: {
      id: 2,
      id_paciente: 2,
      id_unidade_de_saude: "OSA2025",
      id_recepcionista: null,
      id_chefe_alocado: null,
      status: "CONCLUIDO",
      criado_aos: "2024-01-13T00:00:00.000Z",
      atualizado_aos: "2024-01-14T00:00:00.000Z",
      Paciente: {
        id: 2,
        nome_completo: "João Santos",
        id_sexo: 1,
        criado_aos: new Date(),
      },
      Chefe_Laboratorio: null
    }
  },
  {
    id: 3,
    status: "CANCELADO",
    status_financeiro: "CANCELADO",
    status_reembolso: "REEMBOLSADO",
    data_agendamento: "2024-01-13",
    hora_agendamento: "14:00",
    data_formatada: "2024-01-13T14:00:00.000Z",
    duracao: null,
    status_pagamento: "NAO_PAGO",
    criado_aos: "2024-01-12T00:00:00.000Z",
    atualizado_aos: "2024-01-13T00:00:00.000Z",
    id_agendamento: 3,
    id_tipo_exame: 3,
    id_tecnico_alocado: "TEC001",
    Tipo_Exame: {
      id: 3,
      nome: "Urina Tipo I",
      preco: 120.0
    },
    Tecnico_Laboratorio: {
      id: "TEC001",
      nome: "Dr. João Silva",
      email: "joao@exemplo.com",
      hash: "",
      hashedRt: "",
      tipo: "TECNICO",
      status: "ATIVO",
      criado_aos: "2024-01-01T00:00:00.000Z",
      atualizado_aos: "2024-01-01T00:00:00.000Z",
      id_unidade_saude: "OSA2025",
      Tecnico_Laboratorio: []
    },
    Agendamento: {
      id: 3,
      id_paciente: 3,
      id_unidade_de_saude: "OSA2025",
      id_recepcionista: null,
      id_chefe_alocado: null,
      status: "CANCELADO",
      criado_aos: "2024-01-12T00:00:00.000Z",
      atualizado_aos: "2024-01-13T00:00:00.000Z",
      Paciente: {
        id: 3,
        nome_completo: "Ana Costa",
        id_sexo: 2,
        criado_aos: new Date(),
      },
      Chefe_Laboratorio: null
    }
  }
];
