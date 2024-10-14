interface PatientType {
  id: string;
  numero_identificacao: string;
  nome: string;
  data_nascimento: string;
  contacto_telefonico: string;
  data_registro: string;
  data_ultima_visita: string;
  id_sexo: number;
  id_usuario: string;
  sexo: sexoType;
}

interface sexoType {
  nome: string;
}
