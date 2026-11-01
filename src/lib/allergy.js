export const ALLERGY_MAP = {
  1: '난류',
  2: '우유',
  3: '메밀',
  4: '땅콩',
  5: '대두',
  6: '밀',
  7: '고등어',
  8: '게',
  9: '새우',
  10: '돼지고기',
  11: '복숭아',
  12: '토마토',
  13: '아황산염',
  14: '호두',
  15: '닭고기',
  16: '쇠고기',
  17: '오징어',
  18: '조개류',
  19: '잣'
};

export function parseDish(dishString) {
  // Example input: "쇠고기미역국(5.6.16.)" or "배추김치(9.13.)"
  
  // Extract the dish name (everything before the first parenthesis if it contains numbers)
  // Sometimes numbers are like * or dots. 
  // Standard NEIS format is DishName(1.2.3.)
  
  const match = dishString.match(/^(.*?)\(([\d\.]+)\)$/);
  
  if (match) {
    const name = match[1].trim();
    const allergyCodes = match[2].split('.').filter(Boolean).map(n => parseInt(n, 10));
    const allergyNames = allergyCodes.map(code => ALLERGY_MAP[code]).filter(Boolean);
    
    return {
      original: dishString,
      name,
      allergyCodes,
      allergyNames
    };
  }
  
  // No allergies detected or unexpected format
  return {
    original: dishString,
    name: dishString.trim(),
    allergyCodes: [],
    allergyNames: []
  };
}
