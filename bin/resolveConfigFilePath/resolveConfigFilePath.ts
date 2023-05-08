import * as fs from 'fs';
import path from 'path';

export const resolveConfigFilePath = (configFilePath?: string) => {
  const appPath = process.cwd();

  if (configFilePath) return path.resolve(appPath, configFilePath);

  const configFileNameRegex = /mock-server.config.(?:ts|mts|cts|js|mjs|cjs)/;

  return fs.readdirSync(appPath).find((fileName) => configFileNameRegex.test(fileName));
};
