const { jest } = require('@siberiacancode/jest');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync(`${__dirname}/.swcrc`, 'utf-8'));

module.exports = {
  ...jest,
  testEnvironment: 'node',
  transform: {
    // ✅ important:
    // 'swcrc: false' disable reading .swcrc config and override 'exclude' property https://github.com/swc-project/jest/issues/62
    '^.+\\.ts$': ['@swc/jest', { ...config, exclude: [], swcrc: false }]
  }
};
