import path from 'path';

const convertWin32PathToUnix = (win32Path: string) => {
  // handle the edge-case of Window's long file names
  // See: https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file#short-vs-long-names
  let unixPath = win32Path.replace(/^\\\\\?\\/, '');

  // convert the separators, valid since both \ and / can't be in a windows filename
  unixPath = unixPath.replace(/\\/g, '/');

  // compress any // or /// to be just /, which is a safe open under POSIX
  // and prevents accidental errors caused by manually doing path1+path2
  unixPath = unixPath.replace(/\/\/+/g, '/');

  return unixPath;
};

export const urlJoin = (...paths: string[]) => {
  let pathsToJoin = paths;

  if (pathsToJoin.some((path) => path.includes('\\'))) {
    pathsToJoin = paths.map((path) => convertWin32PathToUnix(path));
  }

  return path.posix.join(...pathsToJoin);
};
