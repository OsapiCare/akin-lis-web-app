import Chance from "chance";

const chance = new Chance();

export function _randomFakeData() {
  const randomFullName = chance.name();
  const randomEmail = chance.email();
  const randomAvatar = chance.avatar({ protocol: "https", fileExtension: "jpg" });
  const randomPhome = chance.phone();
  const randomUUID = chance.guid();
  const randomSex = chance.gender();
  //   faker.date.birthdate()
  //   const firstRandom = faker.number.int();
  // faker.seed(123);
  // const secondRandom = faker.number.int();

  return {
    randomFullName,
    randomEmail,
    randomPhome,
    randomAvatar,
    randomUUID,
    randomSex,
  };
}
