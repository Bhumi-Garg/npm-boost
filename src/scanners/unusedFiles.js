import fs from 'fs';
import path from 'path';
import { walkFiles } from '../utils/fileWalker.js';
import { loadConfig } from '../utils/config.js';

function getImportsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  const imports = new Set();

  let match;
  while ((match = importRegex.exec(content)) !== null) imports.add(match[1]);
  while ((match = requireRegex.exec(content)) !== null) imports.add(match[1]);

  return imports;
}

function resolveImport(importPath, fromFile, allFiles) {
  if (!importPath.startsWith('.')) return null;

  const dir = path.dirname(fromFile);
  const resolved = path.resolve(dir, importPath);

  const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '/index.js', '/index.ts'];
  for (const ext of extensions) {
    const candidate = resolved + ext;
    if (allFiles.includes(candidate)) return candidate;
  }

  if (allFiles.includes(resolved)) return resolved;
  return null;
}

export async function scanUnusedFiles() {
  const config = await loadConfig();

  // get entry point from package.json
  let entryPoint = null;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));
    entryPoint = pkg.main ? path.resolve(process.cwd(), pkg.main) : null;
  } catch {}

  const allFiles = walkFiles(process.cwd(), config.scan.extensions, config.scan.ignore);

  if (!entryPoint || !fs.existsSync(entryPoint)) {
    return {
      label: 'Unused Files',
      status: 'warn',
      count: 0,
      data: [],
      summary: 'Could not detect entry point from package.json main',
    };
  }

  const visited = new Set();

  function traverse(filePath) {
    if (visited.has(filePath)) return;
    visited.add(filePath);

    const imports = getImportsFromFile(filePath);
    for (const imp of imports) {
      const resolved = resolveImport(imp, filePath, allFiles);
      if (resolved) traverse(resolved);
    }
  }

  traverse(entryPoint);

  const unused = allFiles.filter((f) => !visited.has(f));

  return {
    label: 'Unused Files',
    status: unused.length > 0 ? 'warn' : 'ok',
    count: unused.length,
    data: unused.map((f) => f.replace(process.cwd() + '/', '')),
    summary: unused.length > 0 ? `${unused.length} unused file(s) found` : 'No unused files found',
  };
}