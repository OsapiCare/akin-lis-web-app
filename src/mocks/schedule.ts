export const MOCK_SCHEDULE_DATA: ScheduleType[] = [
    {
      id: 1,
      id_paciente: "P12345",
      id_unidade_de_saude: 101,
      data_agendamento: "2024-09-20",
      hora_agendamento: "08:30",
      status: "ATIVO",
      id_tecnico_alocado: 201,
      data_pagamento: "2024-09-18",
      Exame: [
        {
          id: 1,
          preco: 150.00,
          status: "ATIVO",
          id_agendamento: 1,
          id_tipo_Exame: 1,
          exame: { id: 1, nome: "Covid-19", descricao: "Exame para detecção do coronavírus." }
        }
      ]
    },
    {
      id: 2,
      id_paciente: "P12346",
      id_unidade_de_saude: 102,
      data_agendamento: "2024-09-21",
      hora_agendamento: "09:00",
      status: "ATIVO",
      id_tecnico_alocado: 202,
      data_pagamento: "2024-09-19",
      Exame: [
        {
          id: 2,
          preco: 120.00,
          status: "ATIVO",
          id_agendamento: 2,
          id_tipo_Exame: 2,
          exame: { id: 2, nome: "Hepatite B", descricao: "Exame para diagnóstico de Hepatite B." }
        }
      ]
    },
    {
      id: 3,
      id_paciente: "P12347",
      id_unidade_de_saude: 103,
      data_agendamento: "2024-09-22",
      hora_agendamento: "10:30",
      status: "DESATIVO",
      id_tecnico_alocado: 203,
      data_pagamento: "2024-09-19",
      Exame: [
        {
          id: 3,
          preco: 140.00,
          status: "ATIVO",
          id_agendamento: 3,
          id_tipo_Exame: 3,
          exame: { id: 3, nome: "Hepatite C", descricao: "Exame para diagnóstico de Hepatite C." }
        }
      ]
    },
    {
      id: 4,
      id_paciente: "P12348",
      id_unidade_de_saude: 104,
      data_agendamento: "2024-09-23",
      hora_agendamento: "11:00",
      status: "DESATIVO",
      id_tecnico_alocado: 204,
      data_pagamento: "2024-09-20",
      Exame: [
        {
          id: 4,
          preco: 130.00,
          status: "ATIVO",
          id_agendamento: 4,
          id_tipo_Exame: 4,
          exame: { id: 4, nome: "Hepatite D", descricao: "Exame para diagnóstico de Hepatite D." }
        }
      ]
    },
    {
      id: 5,
      id_paciente: "P12349",
      id_unidade_de_saude: 105,
      data_agendamento: "2024-09-24",
      hora_agendamento: "08:00",
      status: "ATIVO",
      id_tecnico_alocado: 205,
      data_pagamento: "",
      Exame: [
        {
          id: 5,
          preco: 125.00,
          status: "ATIVO",
          id_agendamento: 5,
          id_tipo_Exame: 5,
          exame: { id: 5, nome: "Hepatite E", descricao: "Exame para diagnóstico de Hepatite E." }
        }
      ]
    },
    {
      id: 6,
      id_paciente: "P12350",
      id_unidade_de_saude: 106,
      data_agendamento: "2024-09-25",
      hora_agendamento: "14:00",
      status: "ATIVO",
      id_tecnico_alocado: 206,
      data_pagamento: "2024-09-21",
      Exame: [
        {
          id: 6,
          preco: 110.00,
          status: "ATIVO",
          id_agendamento: 6,
          id_tipo_Exame: 6,
          exame: { id: 6, nome: "Gripe A", descricao: "Exame para diagnóstico da Gripe A." }
        }
      ]
    },
    {
      id: 7,
      id_paciente: "P12351",
      id_unidade_de_saude: 107,
      data_agendamento: "2024-09-26",
      hora_agendamento: "09:30",
      status: "ATIVO",
      id_tecnico_alocado: 207,
      data_pagamento: "2024-09-22",
      Exame: [
        {
          id: 7,
          preco: 100.00,
          status: "ATIVO",
          id_agendamento: 7,
          id_tipo_Exame: 7,
          exame: { id: 7, nome: "Zika Vírus", descricao: "Exame para diagnóstico de Zika Vírus." }
        }
      ]
    },
    {
      id: 8,
      id_paciente: "P12352",
      id_unidade_de_saude: 108,
      data_agendamento: "2024-09-27",
      hora_agendamento: "10:00",
      status: "ATIVO",
      id_tecnico_alocado: 208,
      data_pagamento: "",
      Exame: [
        {
          id: 8,
          preco: 115.00,
          status: "ATIVO",
          id_agendamento: 8,
          id_tipo_Exame: 8,
          exame: { id: 8, nome: "Dengue", descricao: "Exame para diagnóstico de Dengue." }
        }
      ]
    },
    {
      id: 9,
      id_paciente: "P12353",
      id_unidade_de_saude: 109,
      data_agendamento: "2024-09-28",
      hora_agendamento: "08:30",
      status: "ATIVO",
      id_tecnico_alocado: 209,
      data_pagamento: "2024-09-24",
      Exame: [
        {
          id: 9,
          preco: 135.00,
          status: "ATIVO",
          id_agendamento: 9,
          id_tipo_Exame: 9,
          exame: { id: 9, nome: "Chikungunya", descricao: "Exame para diagnóstico de Chikungunya." }
        }
      ]
    },
    {
      id: 10,
      id_paciente: "P12354",
      id_unidade_de_saude: 110,
      data_agendamento: "2024-09-29",
      hora_agendamento: "15:00",
      status: "ATIVO",
      id_tecnico_alocado: 210,
      data_pagamento: "",
      Exame: [
        {
          id: 10,
          preco: 145.00,
          status: "ATIVO",
          id_agendamento: 10,
          id_tipo_Exame: 10,
          exame: { id: 10, nome: "Febre Amarela", descricao: "Exame para diagnóstico de Febre Amarela." }
        }
      ]
    }
  ];
  