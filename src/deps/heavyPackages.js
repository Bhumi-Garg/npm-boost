import { readFile } from 'fs/promises';
import { join } from 'path';
import { loadConfig } from '../utils/config.js';

const BUNDLEPHOBIA_API = 'https://bundlephobia.com/api/size?package=';
const DEFAULT_THRESHOLD_KB = 100;

async function fetchBundleSize(pkg) {
  try {
    const res = await fetch(
      `${BUNDLEPHOBIA_API}${encodeURIComponent(pkg)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.gzip) return null;
    return {
      name: pkg,
      gzipKb: parseFloat((json.gzip / 1024).toFixed(1)),
      sizeKb: parseFloat((json.size / 1024).toFixed(1)),
    };
  } catch {
    return null;
  }
}

export async function checkHeavyPackages() {
  const config = await loadConfig();

  if (config.deps?.checkBundleSize === false) {
    return {
      label: 'Heavy packages',
      status: 'ok',
      count: 0,
      data: [],
      summary: 'Bundle size check disabled in config',
    };
  }

  try {
    const pkgRaw = await readFile(join(process.cwd(), 'package.json'), 'utf8');
    const pkg = JSON.parse(pkgRaw);
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

    const thresholdKb = config.deps?.heavyThresholdKb ?? DEFAULT_THRESHOLD_KB;

    // Fetch in batches of 5 to avoid hammering bundlephobia
    const results = [];
    for (let i = 0; i < deps.length; i += 5) {
      const batch = deps.slice(i, i + 5);
      const sizes = await Promise.all(batch.map(fetchBundleSize));
      results.push(...sizes.filter(Boolean));
    }

    const heavy = results
      .filter((p) => p.gzipKb > thresholdKb)
      .sort((a, b) => b.gzipKb - a.gzipKb);

    return {
      label: 'Heavy packages',
      status: heavy.length > 0 ? 'warn' : 'ok',
      count: heavy.length,
      data: heavy,
      summary: heavy.length > 0
        ? `${heavy.length} package(s) over ${thresholdKb} KB gzip`
        : `All packages under ${thresholdKb} KB gzip`,
    };
  } catch (err) {
    return {
      label: 'Heavy packages',
      status: 'error',
      count: 0,
      data: [],
      summary: `Bundle size check failed: ${err.message}`,
    };
  }
}