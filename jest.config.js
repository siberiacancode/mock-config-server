/** @type {import('ts-jest').JestConfigWithTsJest} */

const jestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.*\.ts$': [
      'ts-jest',
      { tsconfig: './tsconfig.dev.json' }
    ],
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
};

module.exports = jestConfig;
