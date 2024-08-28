import Chance from "chance";

const chance = new Chance();

const startDate = new Date(2020, 0, 1); // 1 de janeiro de 2020
const endDate = new Date(); // Data e hora atuais

export function _randomFakeData() {
  const randomFullName = chance.name();
  const randomEmail = chance.email();
  const randomAvatar = chance.avatar({ protocol: "https", fileExtension: "jpg" });
  const randomPhone = chance.phone();
  const randomUUID = chance.guid();
  const randomSex = chance.gender();
  const randomInteger = chance.integer({ min: 1, max: 100 });
  const randomFloat = chance.floating({ min: 1, max: 1000000, fixed: 2 });
  const randomText = chance.sentence({ words: randomInteger });
  const randomParagraph = chance.paragraph({ sentences: randomInteger });
  const randomMessage = chance.sentence({ words: randomInteger });
  const randomDate = chance.birthday();
  const randomDateTime = chance.date();
  const randomBirthdayInRange = ""; //chance.birthday({ min: 1988, max: 2005 });
  const randomDateTimeInRange = ""; // chance.date({ year: startDate.getFullYear(), month: startDate.getMonth(), day: startDate.getDate() });
  const randomRole = chance.profession();
  const randomTechRole = chance.profession({ rank: true });
  //   faker.date.birthdate()
  //   const firstRandom = faker.number.int();
  // faker.seed(123);
  // const secondRandom = faker.number.int();

  return {
    randomFullName,
    randomEmail,
    randomPhone,
    randomAvatar,
    randomUUID,
    randomSex,
    randomFloat,
    randomText,
    randomParagraph,
    randomMessage,
    randomDate,
    randomBirthdayInRange,
    randomDateTime,
    randomDateTimeInRange,
    randomRole,
    randomInteger,
    randomTechRole,
  };
}
