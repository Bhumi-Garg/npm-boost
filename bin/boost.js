#!/usr/bin/env node

import { program } from 'commander';
import { runScan } from '../src/commands/scan.js';
import { runDeps } from '../src/commands/deps.js';
import cleanCommand from '../src/commands/clean.js';
import securityCommand from '../src/commands/security.js';

program
  .name('boost')
  .description('Project health toolkit')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan for unused files, large files, duplicate code, unused assets, console.logs')
  .action(runScan);

program
  .command('deps')
  .description('Analyse dependencies — unused, heavy, and alternatives')
  .action(runDeps);

program
  .command('clean')
  .description('Remove temporary files and empty folders')
  .action(cleanCommand);

program
  .command('security')
  .description('Check project for security risks')
  .action(securityCommand);

// default: run everything when no command is passed
if (process.argv.length === 2) {
  await runScan();
  await runDeps();
  await cleanCommand();
  await securityCommand();
} else {
  program.parse();
}