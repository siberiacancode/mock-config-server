import fs from 'node:fs';
import path from 'node:path';

import { APP_PATH, DEFAULT } from '@/utils/constants';

interface CreateTemplateOptions {
  withTypescript: boolean;
  baseUrl: string;
  staticPath: string;
  port: number;
  apiType: 'rest' | 'graphql' | 'full';
}

export const createTemplate = (options: CreateTemplateOptions) => {
  const language = options.withTypescript ? 'ts' : 'js';
  const templatePath = path.join(__dirname, '..', `templates/${language}/${options.apiType}`);

  fs.cpSync(`${templatePath}/mock-requests`, `${APP_PATH}/mock-requests`, {
    recursive: true,
    force: true
  });

  let mockServerConfig = fs.readFileSync(`${templatePath}/mock-server.config.${language}`, 'utf8');

  if (options.staticPath !== '/') {
    mockServerConfig = mockServerConfig.replace(
      `port: ${DEFAULT.PORT}`,
      `port: ${DEFAULT.PORT},\n    staticPath: '${options.staticPath}'`
    );
  }

  mockServerConfig = mockServerConfig.replace(
    `port: ${DEFAULT.PORT}`,
    `port: ${options.port.toString()}`
  );

  mockServerConfig = mockServerConfig.replace("baseUrl: '/'", `baseUrl: '${options.baseUrl}'`);

  fs.writeFileSync(`${APP_PATH}/mock-server.config.${language}`, mockServerConfig);
};
