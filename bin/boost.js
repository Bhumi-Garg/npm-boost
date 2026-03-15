#!/usr/bin/env node

import { program } from 'commander';
import { runScan } from '../src/commands/scan.js';

program
  .name('boost')
  .description('Project health toolkit')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan for unused files, large files, duplicate code, unused assets, console.logs')
  .action(runScan);

// default: run everything (more commands will be added here)
if (process.argv.length === 2) {
  await runScan();
} else {
  program.parse();
}