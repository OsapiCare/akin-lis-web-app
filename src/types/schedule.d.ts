interface ScheduleType {
  id: number;
  id_paciente: string;
  id_unidade_de_saude: number;
  data_agendamento: string;
  hora_agendamento: string;
  status: string;
  id_tecnico_alocado: number;
  data_pagamento: string;
  patiente: PatientType;
  Exame: ExamsType[];
}




