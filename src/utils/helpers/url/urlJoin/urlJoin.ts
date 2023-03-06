import os from 'os';
import path from 'path';

import { convertWin32PathToUnix } from '../convertWin32PathToUnix/convertWin32PathToUnix';

export const urlJoin = (...paths: string[]) => {
  const pathsToJoin = os.platform() === 'win32' ? paths.map((path) => convertWin32PathToUnix(path)) : paths;

  return path.posix.join(...pathsToJoin);
};
