import { exec } from 'child_process';
import { build } from 'esbuild';
import { promisify } from 'util';

const TSC_PATH = './node_modules/.bin/tsc';
const FORMATS = ['cjs', 'esm'];

const main = async () => {
  await promisify(exec)(TSC_PATH).then(() => FORMATS.forEach((format) => build({
    entryPoints: ['src/index.js'], bundle: true, outfile: `lib/index.${format}.js`, format, minify: true, target: 'esnext',
  })));
};

main().then(() => console.log('[+] build successful')).catch((error) => console.error('[-] build failed with', error));