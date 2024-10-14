interface ScheduleType {
  id: number;
  id_paciente: string;
  id_unidade_de_saude: number;
  data_agendamento: string;
  hora_agendamento: string;
  status: string;
  id_tecnico_alocado: number|null;//after remove null
  data_pagamento: string|null //after remove null;
  // patiente: PatientType;
  Exame: ExamsType[];
  Paciente:PatientType
}



