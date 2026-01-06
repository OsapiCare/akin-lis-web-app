enum StatusClinico {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
}
interface ScheduleType {
  id: number;
  id_paciente: string;
  id_unidade_de_saude: number;
  data_agendamento: string;
  hora_agendamento: string;
  status: StatusClinico;
  id_tecnico_alocado: number|null;//after remove null
  data_pagamento: string|null //after remove null;
  Exame: ExamsType[];
  Paciente:PatientType
}
