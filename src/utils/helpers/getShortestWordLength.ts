export const getShortestWordLength = (words: string[]) => {
  if (!words.length) return 0;
  return words.map((word) => word.length).reduce((a, b) => (a <= b ? a : b));
};
