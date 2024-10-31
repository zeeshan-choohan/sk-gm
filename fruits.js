const FRUITS_HLW = [
  { name: "icons/00_cherry", radius: 20 },
  { name: "icons/01_strawberry", radius: 26 },
  { name: "icons/02_grape", radius: 22 },
  { name: "icons/03_orange", radius: 32 },
  { name: "icons/04_lemon", radius: 34 },
  { name: "icons/05_pear", radius: 38 },
  { name: "icons/06_apple", radius: 28 },
  { name: "icons/07_peach", radius: 40 },
  { name: "icons/08_pineapple", radius: 46 },
  { name: "icons/09_melon", radius: 50 },
  { name: "icons/10_watermelon", radius: 53 },
];

const CANDY_UPGRADE_MAP = {
  0: 2,  // Cherry -> Strawberry
  2: 1,  // Strawberry -> Grape
  1: 6,  // Grape -> Dekopon
  6: 3,  // Dekopon -> Orange
  3: 4,  // Orange -> Apple
  4: 5,  // Apple -> Pear
  5: 7,  // Pear -> Peach
  7: 8,  // Peach -> Pineapple
  8: 9,  // Pineapple -> Melon
  9: 10, // Melon -> Watermelon
};

export { FRUITS_HLW, CANDY_UPGRADE_MAP };
