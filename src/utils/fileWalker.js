import fs from 'fs';
import path from 'path';
import { loadGitignore } from './gitignoreParser.js';

export function walkFiles(dir, extensions = [], extraIgnore = []) {
  const ig = loadGitignore(process.cwd());
  ig.add(extraIgnore);

  const results = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(process.cwd(), fullPath);

      if (ig.ignores(relativePath)) continue;

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.length === 0 || extensions.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return results;
}