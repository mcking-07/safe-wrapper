import { build } from 'esbuild';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const TSC_PATH = './node_modules/.bin/tsc';
const FORMAT_CONFIG_MAP = { cjs: { platform: 'node', extension: 'cjs' }, esm: { platform: 'neutral', extension: 'mjs' } };

const SOURCE_DIR = 'src';
const OUTPUT_DIR = 'lib';

const main = async () => {
  await promisify(exec)(TSC_PATH).then(() => Object.keys(FORMAT_CONFIG_MAP).forEach((format) => build({
    entryPoints: [`${SOURCE_DIR}/index.ts`], bundle: true, outfile: `${OUTPUT_DIR}/index.${FORMAT_CONFIG_MAP[format]?.extension}`,
    format, platform: FORMAT_CONFIG_MAP[format]?.platform, minify: true, target: 'esnext', logLevel: 'info',
  })));
};

main().catch((error) => console.error('[-] build failed with', error));
