import fs from 'node:fs';

import { APP_PATH, DEFAULT } from '@/utils/constants';

interface RenderTemplateOptions {
  withTypescript: boolean;
  baseUrl: string;
  port: number;
  apiType: 'rest' | 'graphql' | 'full';
}

export const createTemplate = (options: RenderTemplateOptions) => {
  const language = options.withTypescript ? 'ts' : 'js';
  const templatePath = `dist/bin/templates/${language}/${options.apiType}`;

  fs.cpSync(`${templatePath}/mock-requests`, `${APP_PATH}/mock-requests`, { recursive: true });

  let mockServerConfig = fs.readFileSync(`${templatePath}/mock-server.config.${language}`, 'utf8');

  if (options.port) {
    mockServerConfig = mockServerConfig.replace(
      new RegExp(`port: ${DEFAULT.PORT}`),
      `port: ${options.port.toString()}`
    );
  } else {
    mockServerConfig = mockServerConfig.replace(new RegExp(`\\n\\s*port: ${DEFAULT.PORT},`), '');
  }

  if (options.baseUrl) {
    mockServerConfig = mockServerConfig.replace(/baseUrl: '\/'/, `baseUrl: '${options.baseUrl}'`);
  } else {
    mockServerConfig = mockServerConfig.replace(/\n\s*baseUrl: '\/',/, '');
  }

  fs.writeFileSync(`${APP_PATH}/mock-server.config.${language}`, mockServerConfig);
};
