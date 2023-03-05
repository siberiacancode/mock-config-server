import path from 'path';

import { convertWin32PathToUnix } from '../convertWin32PathToUnix/convertWin32PathToUnix';

export const urlJoin = (...paths: string[]) => {
  let pathsToJoin = paths;

  if (pathsToJoin.some((path) => path.includes('\\'))) {
    pathsToJoin = paths.map((path) => convertWin32PathToUnix(path));
  }

  return path.posix.join(...pathsToJoin);
};
