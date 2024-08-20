import { _randomFakeData } from "./data/random";

const { randomFullName, randomUUID, randomPhome, randomAvatar } = _randomFakeData();

export const MOCK_PATIENTS = [
  { id: randomUUID, avatar: randomAvatar, name: randomFullName, createdAt: "2023-03-01", lastVisit: "2023-03-02", lastExame: "2023-03-03", phoneNumber: randomPhome },
  { id: randomUUID, avatar: randomAvatar, name: randomFullName, createdAt: "2023-03-01", lastVisit: "2023-03-02", lastExame: "2023-03-03", phoneNumber: randomPhome },
  { id: randomUUID, avatar: randomAvatar, name: randomFullName, createdAt: "2023-03-01", lastVisit: "2023-03-02", lastExame: "2023-03-03", phoneNumber: randomPhome },
  { id: randomUUID, avatar: randomAvatar, name: randomFullName, createdAt: "2023-03-01", lastVisit: "2023-03-02", lastExame: "2023-03-03", phoneNumber: randomPhome },
  { id: randomUUID, avatar: randomAvatar, name: randomFullName, createdAt: "2023-03-01", lastVisit: "2023-03-02", lastExame: "2023-03-03", phoneNumber: randomPhome },
  { id: randomUUID, avatar: randomAvatar, name: randomFullName, createdAt: "2023-03-01", lastVisit: "2023-03-02", lastExame: "2023-03-03", phoneNumber: randomPhome },
  { id: randomUUID, avatar: randomAvatar, name: randomFullName, createdAt: "2023-03-01", lastVisit: "2023-03-02", lastExame: "2023-03-03", phoneNumber: randomPhome },
];
