import eslint from '../.eslintrc';

module.exports = {
  ...eslint,
  overrides: [
    ...eslint.overrides,
    {
      files: ['*.ts'],
      parserOptions: {
        project: './examples/tsconfig.json'
      }
    }
  ]
};
