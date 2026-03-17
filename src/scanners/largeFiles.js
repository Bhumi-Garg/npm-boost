import fs from 'fs';
import { walkFiles } from '../utils/fileWalker.js';
import { loadConfig } from '../utils/config.js';

function parseThreshold(threshold) {
  const units = { kb: 1024, mb: 1024 * 1024 };
  const match = threshold.toLowerCase().match(/^(\d+)(kb|mb)$/);
  if (!match) return 500 * 1024;
  return parseInt(match[1]) * units[match[2]];
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / 1024).toFixed(2) + ' KB';
}

export async function scanLargeFiles() {
  const config = await loadConfig();
  const threshold = parseThreshold(config.scan.largeFileThreshold);
  const files = walkFiles(process.cwd(), [], config.scan.ignore);

  const found = [];

  for (const file of files) {
    const stat = fs.statSync(file);
    if (stat.size > threshold) {
      found.push({
        file: file.replace(process.cwd() + '/', ''),
        size: formatSize(stat.size),
        bytes: stat.size,
      });
    }
  }

  found.sort((a, b) => b.bytes - a.bytes);

  return {
    label: 'Large Files',
    status: found.length > 0 ? 'warn' : 'ok',
    count: found.length,
    data: found.map((f) => `${f.file} (${f.size})`),
    summary: found.length > 0 ? `${found.length} file(s) above ${config.scan.largeFileThreshold}` : 'No large files found',
  };
}