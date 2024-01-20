const { jest } = require('@siberiacancode/jest');
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.dev.json');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...jest,
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: false,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })
};
