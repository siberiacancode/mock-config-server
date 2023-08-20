import fs from 'fs';
import path from 'path';

export const resolveConfigFilePath = (cliConfigFilePath?: string) => {
  const appPath = process.cwd();

  if (cliConfigFilePath) return path.resolve(appPath, cliConfigFilePath);

  const configFileNameRegex = /mock-server.config.(?:ts|mts|cts|js|mjs|cjs)/;

  return fs.readdirSync(appPath).find((fileName) => configFileNameRegex.test(fileName));
};
