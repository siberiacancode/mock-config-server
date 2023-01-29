import { getLevenshteinDistance } from './getLevenshteinDistance';

export const typoToleranceSearch = (search: string, words: string[]) => {
  const wordsByLevenshteinDistance = words.reduce((acc, word) => {
    const distance = getLevenshteinDistance(search, word);

    if (!acc[distance]) {
      acc[distance] = [word];
      return acc;
    }

    // do not add same words
    if (!acc[distance].includes(word)) acc[distance].push(word);
    return acc;
  }, {} as Record<number, string[]>);

  const distances = Object.keys(wordsByLevenshteinDistance).map((distance) => +distance);

  // return one exact match if found
  if (wordsByLevenshteinDistance[0]) return wordsByLevenshteinDistance[0];

  // find the shortest word and use it's half-length as maximum typo tolerance
  const shortestWordLength = words.map((word) => word.length).reduce((a, b) => (a <= b ? a : b));

  const possibleWords = distances.reduce((acc, distance) => {
    if (distance < Math.floor(shortestWordLength / 2))
      acc.push(...wordsByLevenshteinDistance[distance]);
    return acc;
  }, [] as string[]);

  return possibleWords;
};
