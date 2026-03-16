import depcheck from 'depcheck';
import { loadConfig } from '../utils/config.js';

export async function checkUnusedPackages() {
  const config = await loadConfig();
  const ignore = config.scan?.ignore ?? [];

  try {
    const result = await depcheck(process.cwd(), {
      ignoreDirs: ignore.map((p) => p.replace(/\/$/, '')),
      skipMissing: true,
    });

    const unused = [
      ...result.dependencies,
      ...result.devDependencies,
    ];

    return {
      label: 'Unused packages',
      status: unused.length > 0 ? 'warn' : 'ok',
      count: unused.length,
      data: unused,
      summary: unused.length > 0
        ? `${unused.length} unused package(s) found`
        : 'No unused packages',
    };
  } catch (err) {
    return {
      label: 'Unused packages',
      status: 'error',
      count: 0,
      data: [],
      summary: `depcheck failed: ${err.message}`,
    };
  }
}