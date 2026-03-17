import chalk from 'chalk';
import { checkUnusedPackages } from '../deps/unusedPackages.js';
import { checkHeavyPackages } from '../deps/heavyPackages.js';
import { checkLighterAlternatives } from '../deps/lighterAlternatives.js';
import { logger } from '../utils/logger.js';
import { startSpinner, stopSpinner, updateSpinner } from '../utils/spinner.js';

function printUnused(result) {
  logger.result({
    ...result,
    data: result.data, // already strings (package names)
  });
}

function printHeavy(result) {
  if (result.status !== 'warn') {
    logger.result(result);
    return;
  }

  logger.warn(chalk.yellow(result.label) + chalk.dim(` — ${result.summary}`));
  result.data.forEach((item) => {
    console.log(
      chalk.dim('   →'),
      chalk.white(item.name),
      chalk.dim(`${item.gzipKb} KB gzip`),
      chalk.dim(`/ ${item.sizeKb} KB raw`)
    );
  });
}

function printAlternatives(result) {
  if (result.status !== 'warn') {
    logger.result(result);
    return;
  }

  logger.warn(chalk.yellow(result.label) + chalk.dim(` — ${result.summary}`));
  result.data.forEach((item) => {
    console.log(
      chalk.dim('   →'),
      chalk.white(item.name),
      chalk.dim('→'),
      chalk.cyan(item.suggestion)
    );
    console.log(chalk.dim(`      ${item.reason}`));
  });
}

export async function runDeps() {
  logger.title('Dependency analysis');

  startSpinner('Checking unused packages...');
  const unused = await checkUnusedPackages();
  updateSpinner('Checking bundle sizes...');
  const heavy = await checkHeavyPackages();
  updateSpinner('Looking for lighter alternatives...');
  const alternatives = await checkLighterAlternatives();
  stopSpinner(true, 'Dependency analysis complete');

  logger.blank();
  printUnused(unused);
  printHeavy(heavy);
  printAlternatives(alternatives);
  logger.blank();

  const totalIssues = unused.count + heavy.count + alternatives.count;
  if (totalIssues === 0) {
    logger.success('All dependency checks passed');
  } else {
    logger.dim(`${totalIssues} issue(s) found across dependency checks`);
  }

  return [unused, heavy, alternatives];
}