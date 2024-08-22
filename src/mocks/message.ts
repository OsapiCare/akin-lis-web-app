import { _randomFakeData } from "@/lib/chance";

export const MOCK_MESSAGES = Array.from({ length: 50 }).map((_) => {
  const { randomFullName, randomUUID, randomAvatar, randomParagraph, randomDate, randomDateTime } = _randomFakeData();

  return { id: randomUUID, avatar: randomAvatar, name: randomFullName, createdAt: randomDateTime, message: randomParagraph };
});
