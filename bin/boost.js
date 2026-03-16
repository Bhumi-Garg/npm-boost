#!/usr/bin/env node
import { program } from 'commander';
import { runDeps } from '../src/commands/deps.js';

program
  .name('boost')
  .description('Project health toolkit')
  .version('1.0.0');

program
  .command('deps')
  .description('Analyse dependencies — unused, heavy, and alternatives')
  .action(runDeps);

// When no subcommand is passed, run everything
program
  .action(async () => {
    await runDeps();
    // other commands will go here as you build them
    // await runScan();
    // await runClean();
    // await runScore();
    // await runSecurity();
  });

program.parse();