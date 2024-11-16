#!/usr/bin/env node

import pleaseUpgradeNode from 'please-upgrade-node';

import packageJson from '../package.json';

pleaseUpgradeNode(packageJson);

// eslint-disable-next-line import/first
import { cli } from './cli';

cli();

export {};
