import { execSync } from 'child_process';
import path from 'path';
import { loadConfig } from '../utils/config.js';

export async function scanDuplicateCode() {
  const config = await loadConfig();
  const extensions = config.scan.extensions.map((e) => e.replace('.', '')).join(',');

  try {
    const output = execSync(
      `npx jscpd ${process.cwd()} --min-lines 5 --min-tokens 50 --reporters json --silent --ignore "node_modules/**,dist/**,.git/**"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    );

    let duplicates = [];
    try {
      const json = JSON.parse(output);
      duplicates = json.duplicates || [];
    } catch {}

    return {
      label: 'Duplicate Code',
      status: duplicates.length > 0 ? 'warn' : 'ok',
      count: duplicates.length,
      data: duplicates.map((d) => {
        const fileA = d.firstFile?.name?.replace(process.cwd() + '/', '') || '';
        const fileB = d.secondFile?.name?.replace(process.cwd() + '/', '') || '';
        return `${fileA} ↔ ${fileB}`;
      }),
      summary: duplicates.length > 0 ? `${duplicates.length} duplicate block(s) found` : 'No duplicate code found',
    };
  } catch {
    return {
      label: 'Duplicate Code',
      status: 'ok',
      count: 0,
      data: [],
      summary: 'Could not run duplicate check',
    };
  }
}