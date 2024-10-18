import { eslint } from '@siberiacancode/eslint';

export default eslint(
  {
    typescript: true
  },
  {
    name: 'siberiacancode/md',
    files: ['**/*.md'],
    rules: {
      'style/max-len': 'off'
    }
  },
  {
    name: 'siberiacancode/typescript',
    rules: {
      'node/prefer-global/process': 'off',
      'ts/consistent-type-imports': 'off'
    }
  },
  {
    name: 'siberiacancode/views',
    files: ['**/static/views/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off'
    }
  }
);
