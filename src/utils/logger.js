import chalk from 'chalk';

export const logger = {
  info: (msg) => console.log(chalk.cyan('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✔'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.log(chalk.red('✖'), msg),
  title: (msg) => console.log('\n' + chalk.bold.white(msg)),
  dim: (msg) => console.log(chalk.dim(msg)),
  blank: () => console.log(''),

  result: (result) => {
    if (result.status === 'ok') {
      logger.success(chalk.green(result.label) + chalk.dim(` — ${result.summary}`));
    } else if (result.status === 'warn') {
      logger.warn(chalk.yellow(result.label) + chalk.dim(` — ${result.summary}`));
      if (result.data?.length) {
        result.data.forEach((item) => {
          console.log(chalk.dim('   →'), chalk.white(typeof item === 'string' ? item : JSON.stringify(item)));
        });
      }
    } else if (result.status === 'error') {
      logger.error(chalk.red(result.label) + chalk.dim(` — ${result.summary}`));
    }
  },
};