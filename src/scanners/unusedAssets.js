import fs from 'fs';
import path from 'path';
import { walkFiles } from '../utils/fileWalker.js';
import { loadConfig } from '../utils/config.js';

const ASSET_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.ttf', '.woff', '.woff2', '.eot'];

export async function scanUnusedAssets() {
  const config = await loadConfig();
  const allFiles = walkFiles(process.cwd(), [], config.scan.ignore);

  const assetFiles = allFiles.filter((f) => ASSET_EXTENSIONS.includes(path.extname(f).toLowerCase()));
  const codeFiles = allFiles.filter((f) => config.scan.extensions.includes(path.extname(f)));

  const codeContent = codeFiles.map((f) => fs.readFileSync(f, 'utf-8')).join('\n');

  const unused = assetFiles.filter((assetPath) => {
    const assetName = path.basename(assetPath);
    return !codeContent.includes(assetName);
  });

  return {
    label: 'Unused Assets',
    status: unused.length > 0 ? 'warn' : 'ok',
    count: unused.length,
    data: unused.map((f) => f.replace(process.cwd() + '/', '')),
    summary: unused.length > 0 ? `${unused.length} unused asset(s) found` : 'No unused assets found',
  };
}