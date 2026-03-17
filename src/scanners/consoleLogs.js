import fs from 'fs';
import { walkFiles } from '../utils/fileWalker.js';
import { loadConfig } from '../utils/config.js';

export async function scanConsoleLogs() {
  const config = await loadConfig();
  const files = walkFiles(process.cwd(), config.scan.extensions, config.scan.ignore);

  const found = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (/console\.(log|warn|error|info|debug)\s*\(/.test(line)) {
        found.push({
          file: file.replace(process.cwd() + '/', ''),
          line: index + 1,
          code: line.trim(),
        });
      }
    });
  }

  return {
    label: 'Console Logs',
    status: found.length > 0 ? 'warn' : 'ok',
    count: found.length,
    data: found.map((f) => `${f.file}:${f.line}  ${f.code}`),
    summary: found.length > 0 ? `${found.length} console.log(s) found` : 'No console logs found',
  };
}