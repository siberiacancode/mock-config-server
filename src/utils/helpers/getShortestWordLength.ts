export const getShortestWordLength = (words: string[]) => {
  if (!words.length) return 0;
  return Math.min(...words.map((word) => word.length));
};
