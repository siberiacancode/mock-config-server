import fs from 'fs';

export const isFilePathValid = (path: string): boolean => {
  try {
    if (!fs.existsSync(path)) return false;
    if (!fs.statSync(path).isFile()) return false;

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
