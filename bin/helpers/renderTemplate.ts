import * as fs from 'node:fs';

import { DEFAULT } from '@/utils/constants';

interface RenderTemplateOptions {
  withTypescript: boolean;
  baseUrl: string;
  port: number;
  apiType: 'rest' | 'graphql' | 'full';
}

export const renderTemplate = (options: RenderTemplateOptions) => {
  const language = options.withTypescript ? 'ts' : 'js';
  const templatePath = `dist/bin/templates/${language}/${options.apiType}`;
  const appPath = process.cwd();

  fs.cpSync(`${templatePath}/mock-requests`, `${appPath}/mock-requests`, { recursive: true });

  let mockServerConfig = fs.readFileSync(`${templatePath}/mock-server.config.${language}`, 'utf8');

  if (options.port !== DEFAULT.PORT) {
    mockServerConfig = mockServerConfig.replace(`${DEFAULT.PORT}`, options.port.toString());
  } else {
    mockServerConfig = mockServerConfig.replace(new RegExp(`\\n\\s*port: ${DEFAULT.PORT},`), '');
  }

  if (options.baseUrl !== '/') {
    mockServerConfig = mockServerConfig.replace("'/'", `'${options.baseUrl}'`);
  } else {
    mockServerConfig = mockServerConfig.replace(/\n\s*baseUrl: '\/',/, '');
  }

  fs.writeFileSync(`${appPath}/mock-server.config.${language}`, mockServerConfig);
};
