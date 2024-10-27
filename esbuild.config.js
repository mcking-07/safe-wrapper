import { exec } from 'child_process';
import { build } from 'esbuild';
import { promisify } from 'util';

const TSC_PATH = './node_modules/.bin/tsc';
const FORMATS = ['cjs', 'esm'];
const FILE_EXTENSIONS_MAP = { cjs: 'cjs', esm: 'mjs' };

const main = async () => {
  await promisify(exec)(TSC_PATH).then(() => FORMATS.forEach((format) => build({
    entryPoints: ['src/index.js'], bundle: true, outfile: `lib/index.${FILE_EXTENSIONS_MAP[format]}`, format, minify: true, target: 'esnext', logLevel: 'info',
  })));
};

main().catch((error) => console.error('[-] build failed with', error));
