const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.dev.json');

/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
  rootDir: './',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })
};
module.exports = jestConfig;
