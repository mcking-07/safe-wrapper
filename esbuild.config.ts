import { build, type Format, type Platform } from 'esbuild';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const TSC_PATH = './node_modules/.bin/tsc';

const SOURCE_DIR = 'src';
const OUTPUT_DIR = 'lib';

type FormatConfigType = { format: Format; platform: Platform; extension: 'cjs' | 'mjs'; };

const FORMAT_CONFIGS = [
  { format: 'cjs', platform: 'node', extension: 'cjs' },
  { format: 'esm', platform: 'neutral', extension: 'mjs' }
] satisfies FormatConfigType[];

const main = async () => {
  await promisify(exec)(TSC_PATH).then(() => FORMAT_CONFIGS.map(({ format, platform, extension }) => build({
    entryPoints: [`${SOURCE_DIR}/index.ts`], bundle: true, outfile: `${OUTPUT_DIR}/index.${extension}`, format,
    platform, minify: true, target: 'esnext', color: true, treeShaking: true, logLevel: 'info',
  })));
};

main().catch((error) => { console.error('[-] build failed with', error); process.exit(1); });
