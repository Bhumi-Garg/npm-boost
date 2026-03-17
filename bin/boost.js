#!/usr/bin/env node
import { program } from 'commander';
import { runDeps } from '../src/commands/deps.js';
import { runScore } from '../src/commands/score.js';
import cleanCommand from '../src/commands/clean.js';
import securityCommand from '../src/commands/security.js';

program
  .name('boost')
  .description('Project health toolkit')
  .version('1.0.0');

program
  .command('deps')
  .description('Analyse dependencies — unused, heavy, and alternatives')
  .action(runDeps);

program
  .command('security')
  .description('Check for committed secrets and vulnerabilities')
  .action(securityCommand);

program
  .command('clean')
  .description('Remove temporary files and empty folders')
  .action(cleanCommand);

program
  .command('score')
  .description('Show project health score out of 100')
  .action(runScore);

// No subcommand → run everything
program.action(async () => {
  await runDeps();
  await securityCommand();
  await cleanCommand();
  await runScore();
});

program.parse();