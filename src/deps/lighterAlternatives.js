import { readFile } from 'fs/promises';
import { join } from 'path';

const ALTERNATIVES_MAP = {
  moment:       { suggestion: 'date-fns or dayjs',           reason: 'Much smaller and tree-shakable' },
  lodash:       { suggestion: 'lodash-es or native ES',      reason: 'Use partial imports or built-in array methods' },
  underscore:   { suggestion: 'lodash-es or native ES',      reason: 'Lodash is a strict superset with better tree-shaking' },
  request:      { suggestion: 'node-fetch or got',           reason: 'request is officially deprecated' },
  axios:        { suggestion: 'native fetch (Node 18+)',     reason: 'fetch is built into Node — no extra dep needed' },
  'node-fetch': { suggestion: 'native fetch (Node 18+)',     reason: 'fetch is built into Node — no extra dep needed' },
  bluebird:     { suggestion: 'native Promise',              reason: 'Native Promises are fast and fully featured now' },
  'node-uuid':  { suggestion: 'crypto.randomUUID()',         reason: 'Built into Node.js >= 14.17, zero deps' },
  uuid:         { suggestion: 'crypto.randomUUID()',         reason: 'Built into Node.js >= 14.17, zero deps' },
  mkdirp:       { suggestion: 'fs.mkdirSync({ recursive })', reason: 'Built into Node.js, no package needed' },
  rimraf:       { suggestion: 'fs.rmSync({ recursive })',    reason: 'Built into Node.js >= 14.14' },
  glob:         { suggestion: 'node:fs glob (Node 22+)',     reason: 'Built-in glob available in Node 22+' },
  chalk:        { suggestion: 'picocolors or kleur',         reason: '~10x smaller with near-identical API' },
  colors:       { suggestion: 'picocolors or kleur',         reason: 'colors has had supply-chain issues; picocolors is safer' },
  sprintf:      { suggestion: 'native template literals',    reason: 'Template literals cover most sprintf use cases' },
  'is-array':   { suggestion: 'Array.isArray()',             reason: 'Built-in JS, no package needed' },
};

export async function checkLighterAlternatives() {
  try {
    const pkgRaw = await readFile(join(process.cwd(), 'package.json'), 'utf8');
    const pkg = JSON.parse(pkgRaw);
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

    const found = deps
      .filter((d) => ALTERNATIVES_MAP[d])
      .map((d) => ({ name: d, ...ALTERNATIVES_MAP[d] }));

    return {
      label: 'Lighter alternatives',
      status: found.length > 0 ? 'warn' : 'ok',
      count: found.length,
      data: found,
      summary: found.length > 0
        ? `${found.length} package(s) have lighter alternatives`
        : 'No obvious replacements found',
    };
  } catch (err) {
    return {
      label: 'Lighter alternatives',
      status: 'error',
      count: 0,
      data: [],
      summary: `Could not read package.json: ${err.message}`,
    };
  }
}