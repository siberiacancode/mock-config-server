#!/usr/bin/env node

import pleaseUpgradeNode from 'please-upgrade-node';

import packageJson from '../../package.json' assert { type: 'json' };

import { cli } from './cli';

pleaseUpgradeNode(packageJson);

cli();

export {};
