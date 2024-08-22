import { _randomFakeData } from "../lib/chance";

const { randomFullName, randomUUID, randomAvatar, randomEmail, randomPhome,randomRole
   } = _randomFakeData(); 

export const MOCK_LOGGED_USER = {
  id: randomUUID,
  avatar: randomAvatar,
  fullName: randomFullName,
  email: randomEmail,
  phoneNumber:randomPhome,
  role: randomRole,
  token: "PZo8YHe9iGMeEZuwZYqbJf5CeYeKIkBv9IzT86dJVXgLc1lNMIIXw2GjPch1"
};
 