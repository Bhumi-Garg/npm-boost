import fs from 'fs';
import path from 'path';
import ignore from 'ignore';

export function loadGitignore(cwd = process.cwd()) {
  const ig = ignore();
  const gitignorePath = path.join(cwd, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    ig.add(content);
  }
  return ig;
}