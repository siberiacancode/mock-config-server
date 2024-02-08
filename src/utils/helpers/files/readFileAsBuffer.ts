import fs from 'fs';

export const readFileAsBuffer = (path: string): Buffer | null => {
  try {
    if (!fs.existsSync(path)) return null;

    const fileStats = fs.statSync(path);
    if (!fileStats.isFile()) return null;

    const fileData = fs.readFileSync(path);
    return fileData;
  } catch (e) {
    return null;
  }
};
