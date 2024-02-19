import fs from 'fs';
import os from 'os';
import path from 'path';

export const createTmpDir = () => {
  const tmpDirPath = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  return tmpDirPath;
};
