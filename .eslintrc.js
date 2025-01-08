const { eslint } = require('@siberiacancode/eslint');

module.exports = {
  ...eslint.node,
  overrides: [
    ...eslint.node.overrides,
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-enum-comparison': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
        'no-underscore-dangle': 'off',
        'no-restricted-syntax': 'off',
        'no-continue': 'off',
        'promise/always-return': ['error', { ignoreLastCallback: true }],
        'arrow-body-style': ['error', 'as-needed'],
        'no-console': ['warn', { allow: ['info', 'dir', 'error'] }],
        'no-await-in-loop': 'off'
      }
    }
  ]
};
