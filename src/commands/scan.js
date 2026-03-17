import { scanConsoleLogs } from '../scanners/consoleLogs.js';
import { scanLargeFiles } from '../scanners/largeFiles.js';
import { scanUnusedAssets } from '../scanners/unusedAssets.js';
import { scanUnusedFiles } from '../scanners/unusedFiles.js';
import { scanDuplicateCode } from '../scanners/duplicateCode.js';
import { logger } from '../utils/logger.js';
import { startSpinner, stopSpinner } from '../utils/spinner.js';

export async function runScan() {
  logger.title('boost scan — Project Analysis');

  const checks = [
    { label: 'Scanning for unused files...', fn: scanUnusedFiles },
    { label: 'Scanning for large files...', fn: scanLargeFiles },
    { label: 'Scanning for duplicate code...', fn: scanDuplicateCode },
    { label: 'Scanning for unused assets...', fn: scanUnusedAssets },
    { label: 'Scanning for console.logs...', fn: scanConsoleLogs },
  ];

  const results = [];

  for (const check of checks) {
    startSpinner(check.label);
    try {
      const result = await check.fn();
      stopSpinner(true, check.label.replace('...', ' ✔'));
      results.push(result);
    } catch (err) {
      stopSpinner(false, check.label.replace('...', ' ✖'));
      results.push({
        label: check.label,
        status: 'error',
        count: 0,
        data: [],
        summary: err.message,
      });
    }
  }

  logger.blank();
  logger.title('Scan Results');
  results.forEach((r) => logger.result(r));
  logger.blank();

  return results;
}