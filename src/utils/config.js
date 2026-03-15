import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

const defaults = {
  scan: {
    largeFileThreshold: '500kb',
    ignore: ['dist/', 'node_modules/', '.git/', 'coverage/'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue'],
  },
  clean: {
    tempPatterns: ['**/*.tmp', '**/*.cache', '**/.DS_Store', '**/Thumbs.db'],
  },
  deps: {
    checkBundleSize: true,
  },
  security: {
    scanPatterns: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.env*'],
  },
};

export async function loadConfig() {
  const configPath = path.resolve(process.cwd(), 'boost.config.js');
  if (fs.existsSync(configPath)) {
    const userConfig = await import(pathToFileURL(configPath).href);
    return deepMerge(defaults, userConfig.default);
  }
  return defaults;
}

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
      result[key] = deepMerge(base[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}