const eslint = require('../.eslintrc.js');

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
