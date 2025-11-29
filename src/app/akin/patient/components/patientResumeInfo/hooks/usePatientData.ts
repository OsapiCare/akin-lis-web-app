import { getAgeText } from "@/utils/get-yearUser";

export const usePatientData = (patient: PatientType) => {
  const currentYear = new Date().getFullYear();

  const personalInfo = [
    {
      label: "Nome do paciente",
      value: patient.nome_completo,
      icon: "user"
    },
    {
      label: "Bilhete de Identidade",
      value: patient.numero_identificacao,
      icon: "id-card"
    },
    {
      label: "Gênero",
      value: patient.id_sexo === 1 ? "Masculino" : "Feminino",
      icon: "users"
    },
    {
      label: "Data de nascimento",
      value: new Date(patient.data_nascimento).toLocaleDateString("pt-BR"),
      icon: "calendar"
    },
    {
      label: "Idade",
      value: `${getAgeText(patient.data_nascimento)}`,
      icon: "clock"
    },
    {
      label: "Contacto",
      value: patient.contacto_telefonico,
      icon: "phone"
    },
  ];

  const formatLastVisit = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatRegistrationDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return {
    personalInfo,
    formatLastVisit,
    formatRegistrationDate,
  };
};
