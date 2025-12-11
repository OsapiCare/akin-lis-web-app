interface PatientType {
  id: string;
  numero_identificacao: string;
  email?: string | undefined;
  nome_completo: string;
  data_nascimento: string;
  contacto_telefonico: string;
  data_registro: string;
  data_ultima_visita: string;
  dias_desde_ultima_visita:string;
  id_sexo: number;
  id_usuario: string;
  sexo: sexoType;
  criado_aos: Date
}

interface sexoType {
  nome: string;
}
