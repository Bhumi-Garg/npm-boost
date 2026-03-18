import { runScan } from './scan.js';
import { runDeps } from './deps.js';
import cleanCommand from './clean.js';
import securityCommand from './security.js';
import { calculateScore } from '../scorer/healthScore.js';
import { logger } from '../utils/logger.js';
import chalk from 'chalk';

function getScoreColor(score) {
  if (score >= 80) return chalk.green;
  if (score >= 50) return chalk.yellow;
  return chalk.red;
}

function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Needs Attention';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

export async function runScore() {
  logger.title('boost score — Project Health Score');
  logger.blank();

  // run sequentially, no spinners here — each command handles its own
  const scanResults = await runScan();
  const depsResults = await runDeps();
  const cleanResults = await cleanCommand();
  const securityResults = await securityCommand();

  const allResults = [scanResults, depsResults, cleanResults, securityResults];
  const { score, breakdown } = calculateScore(allResults);

  const colorFn = getScoreColor(score);
  const label = getScoreLabel(score);

  logger.blank();
  console.log(chalk.bold('  Project Health Score: ') + colorFn.bold(`${score}/100`) + '  ' + label);
  logger.blank();

  const oks    = breakdown.filter((b) => b.status === 'ok');
  const warns  = breakdown.filter((b) => b.status === 'warn');
  const errors = breakdown.filter((b) => b.status === 'error');

  for (const item of oks) {
    console.log(chalk.green('  ✔'), chalk.dim(item.label));
  }
  for (const item of warns) {
    console.log(chalk.yellow('  ⚠'), chalk.white(item.label), chalk.dim(`— ${item.summary}`));
  }
  for (const item of errors) {
    console.log(chalk.red('  ✖'), chalk.white(item.label), chalk.dim(`— ${item.summary}`));
  }

  logger.blank();

  return { score, breakdown };
}