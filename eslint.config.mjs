import { eslint } from '@siberiacancode/eslint';

export default eslint(
  {
    typescript: true
  },
  {
    name: 'mock-config-server/md',
    files: ['**/*.md'],
    rules: {
      'style/max-len': 'off'
    }
  },
  {
    name: 'mock-config-server/typescript',
    rules: {
      'node/prefer-global/process': 'off'
    }
  },
  {
    name: 'mock-config-server/views',
    files: ['**/static/views/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off'
    }
  }
);
