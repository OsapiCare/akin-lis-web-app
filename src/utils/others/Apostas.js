// 16 - 30.72  > 14,72 | 6,72
// 8  - 15.36  > 7,36

let start = 1;
let MULTIPLIER = 1.92;
let MY_ENTRIES = [0];

for (let i = start; i < 200; i++) {
  let actualStartValue = i;
  let earns = actualStartValue * MULTIPLIER;
  let profit = Number((earns - actualStartValue).toFixed(2));
  let totalOfLosses = MY_ENTRIES.reduce((value, currentValue) => value + currentValue, 0);
  let isAllowedAsGoodEntrie = profit - totalOfLosses;

//   console.log("E",actualStartValue);
//   console.log("P",profit);
//   console.log("L",totalOfLosses);
//   console.log(">>>",isAllowedAsGoodEntrie);
  
  if (isAllowedAsGoodEntrie >= 0) {
    console.log(actualStartValue, "-", earns, ">", profit, "|", isAllowedAsGoodEntrie, ">>>> ",totalOfLosses );
    MY_ENTRIES.push(actualStartValue);
  }
  //   console.log();
  // 1 - 1.92 > 0.92
  // 2 - 3,84 > 1,84 | 0.84
  // 4 - 7,68 > 3,68 | 0,68
  // 7 - 15,36 > 7,36 | 0,36
}

function canGo(val) {}

if (canGo(start)) {
}

console.log();
