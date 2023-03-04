import path from 'path';

export const urlJoin = (...paths: string[]) => path.posix.join(...paths);
