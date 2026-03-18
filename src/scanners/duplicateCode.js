import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loadConfig } from '../utils/config.js';

export async function scanDuplicateCode() {
  const config = await loadConfig();
  const reportDir = path.join(process.cwd(), '.boost-temp');
  const reportFile = path.join(reportDir, 'jscpd-report.json');

  try {
    const srcDir = path.join(process.cwd(), 'src');
    const scanTarget = fs.existsSync(srcDir) ? srcDir : process.cwd();

    execSync(
      `npx jscpd "${scanTarget}" --min-lines 5 --min-tokens 50 --reporters json --silent --output "${reportDir}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    );

    let duplicates = [];
    if (fs.existsSync(reportFile)) {
      const json = JSON.parse(fs.readFileSync(reportFile, 'utf-8'));
      duplicates = json.duplicates || [];
    }

    return {
      label: 'Duplicate Code',
      status: duplicates.length > 0 ? 'warn' : 'ok',
      count: duplicates.length,
      data: duplicates.map((d) => {
        const fileA = d.firstFile?.name?.replace(process.cwd() + '/', '') || '';
        const fileB = d.secondFile?.name?.replace(process.cwd() + '/', '') || '';
        return `${fileA} ↔ ${fileB}`;
      }),
      summary: duplicates.length > 0
        ? `${duplicates.length} duplicate block(s) found`
        : 'No duplicate code found',
    };
  } catch {
    return {
      label: 'Duplicate Code',
      status: 'ok',
      count: 0,
      data: [],
      summary: 'Could not run duplicate check',
    };
  } finally {
    // always clean up temp folder after reading
    if (fs.existsSync(reportDir)) {
      fs.rmSync(reportDir, { recursive: true, force: true });
    }
  }
}
