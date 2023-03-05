import path from 'path';

export const urlJoin = (...paths: string[]) => {
  const joinedPaths = path.posix.join(...paths);
  return joinedPaths.startsWith('/') ? joinedPaths : `/${joinedPaths}`;
};
