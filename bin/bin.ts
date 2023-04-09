#!/usr/bin/env node

const pleaseUpgradeNode = require('please-upgrade-node');
const packageJson = require('../../package.json');

pleaseUpgradeNode(packageJson);

const { parseCli } = require('./cli');

parseCli();

export {}
