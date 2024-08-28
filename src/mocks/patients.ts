import { _randomFakeData } from "../lib/chance";

// { id: randomUUID, avatar: randomAvatar, name: randomFullName, createdAt: "2023-03-01", lastVisit: "2023-03-02", lastExame: "2023-03-03", phoneNumber: randomPhome },

export const MOCK_PATIENTS = Array.from({ length: 50 }).map((_) => {
  const { randomFullName, randomUUID, randomAvatar, randomFloat, randomTechRole, randomDate, randomInteger, randomDateTime, randomPhome, randomEmail } = _randomFakeData();

  return {
    id: randomUUID,
    avatar: randomAvatar,
    name: randomFullName,
    contacto: randomPhome,
    email: randomEmail,
    createdAt: randomDateTime,
    exames: Array.from({ length: randomInteger }).map((_) => ({
      id: randomUUID,
      exame: randomTechRole,
      data: randomDate,
      hora: randomDateTime,
      status: randomInteger < 75 ? (randomInteger < 25 ? "Cancelado" : "Pendente") : "Concluido",
      valor: randomFloat,
      
    })),
  };
});
