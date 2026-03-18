import chalk from 'chalk';
import { computeHealthScore } from '../scorer/healthScore.js';
import { logger } from '../utils/logger.js';
import { startSpinner, stopSpinner } from '../utils/spinner.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 90) return chalk.green;
  if (score >= 70) return chalk.cyan;
  if (score >= 50) return chalk.yellow;
  return chalk.red;
}

function gradeColor(grade) {
  if (grade === 'A') return chalk.green;
  if (grade === 'B') return chalk.cyan;
  if (grade === 'C') return chalk.yellow;
  if (grade === 'D') return chalk.red;
  return chalk.bgRed.white;
}

function statusIcon(status) {
  if (status === 'ok')    return chalk.green('✔');
  if (status === 'warn')  return chalk.yellow('⚠');
  if (status === 'error') return chalk.red('✖');
  return chalk.dim('–');
}

function bar(pct, width = 24) {
  const filled = Math.round((pct / 100) * width);
  const empty  = width - filled;
  const col    = scoreColor(pct);
  return col('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));
}

function formatItem(item) {
  if (typeof item === 'string') return item;
  if (item.name && item.suggestion) return `${item.name}  →  ${item.suggestion}`;
  if (item.name && item.gzipKb)    return `${item.name}  ${item.gzipKb} KB gzip`;
  return JSON.stringify(item);
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function printScoreCard(score, grade) {
  const col  = scoreColor(score);
  const gcol = gradeColor(grade);
  console.log('');
  console.log(
    '  ' + col(chalk.bold(`${score}`)) + chalk.dim('/100') +
    '    ' + gcol(chalk.bold(`Grade ${grade}`))
  );
  console.log('');
}

function printCategories(categories) {
  for (const cat of Object.values(categories)) {
    console.log(
      '  ' + bar(cat.pct) +
      '  ' + scoreColor(cat.pct)(`${String(cat.pct).padStart(3)}%`) +
      '  ' + chalk.white(cat.label) +
      chalk.dim(`  ${cat.earned}/${cat.maxPts} pts`)
    );
  }
  console.log('');
}

function printChecks(checks) {
  logger.title('Check breakdown');
  console.log('');

  for (const [, val] of Object.entries(checks)) {
    const { result, pts, maxPts } = val;

    console.log(
      '  ' + statusIcon(result.status) +
      '  ' + chalk.white(result.label) +
      chalk.dim(`  — ${result.summary}`) +
      chalk.dim(`  [${pts}/${maxPts}]`)
    );

    if (result.status === 'warn' && result.data?.length) {
      const preview = result.data.slice(0, 3);
      preview.forEach((item) => {
        console.log(chalk.dim(`       • ${formatItem(item)}`));
      });
      if (result.data.length > 3) {
        console.log(chalk.dim(`       … and ${result.data.length - 3} more`));
      }
    }
  }

  console.log('');
}

function printFooter(score) {
  if (score >= 90) {
    logger.success('Excellent project health!');
  } else if (score >= 70) {
    logger.info('Good shape — a few things to tighten up.');
  } else if (score >= 50) {
    logger.warn('Some issues need attention.');
  } else {
    logger.error('Project needs significant work.');
  }
  console.log('');
}

// ─── Command entry ────────────────────────────────────────────────────────────

export async function runScore() {
  logger.title('Project health score');
  startSpinner('Running all checks...');

  let health;
  try {
    health = await computeHealthScore();
  } catch (err) {
    stopSpinner(false, 'Health score failed');
    logger.error(err.message);
    return;
  }

  stopSpinner(true, 'All checks complete');

  printScoreCard(health.score, health.grade);
  printCategories(health.categories);
  printChecks(health.checks);
  printFooter(health.score);

  return health;
}