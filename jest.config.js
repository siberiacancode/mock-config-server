/** @type {import('ts-jest').JestConfigWithTsJest} */

const jestConfig = {
  rootDir: './',
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig.dev.json' }]
  },
  moduleNameMapper: {
    '@/server': '<rootDir>/src/utils/helpers',
    '@/core/rest': '<rootDir>/src/core/rest',
    '@/core/graphql': '<rootDir>/src/core/graphql',
    '@/core/middlewares': '<rootDir>/src/core/middlewares',
    '@/utils/helpers': '<rootDir>/src/utils/helpers',
    '@/utils/types': '<rootDir>/src/utils/types',
    '@/utils/constants': '<rootDir>/src/utils/constants'
  }
};
module.exports = jestConfig;
