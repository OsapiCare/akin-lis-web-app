import { _randomFakeData } from "../lib/chance";

const { randomFullName, randomUUID, randomAvatar, randomEmail } = _randomFakeData();

export const MOCK_LOGGED_USER = {
  id: randomUUID,
  avatar: randomAvatar,
  fullName: randomFullName,
  email: randomEmail,
  token: "PZo8YHe9iGMeEZuwZYqbJf5CeYeKIkBv9IzT86dJVXgLc1lNMIIXw2GjPch1"
};
