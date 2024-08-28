import { _randomFakeData } from "../lib/chance";

export const MOCK_USERS = Array.from({ length: 50 }).map((_) => {
  const { randomFullName, randomUUID, randomAvatar, randomTechRole, randomDateTime, randomPhone, randomEmail } = _randomFakeData();

  return {
    id: randomUUID,
    avatar: randomAvatar,
    role: randomTechRole,
    name: randomFullName,
    contacto: randomPhone,
    email: randomEmail,
    createdAt: randomDateTime,
  };
});
