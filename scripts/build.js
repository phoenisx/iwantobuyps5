/* eslint-disable @typescript-eslint/no-var-requires */
require('esbuild')
  .build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    external: ['puppeteer'],
    outfile: './dist/out.js',
  })
  .catch(() => process.exit(1));
