import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  outDir: 'dist',
  minify: true,
  format: 'esm',
  platform: 'node',
  clean: true,
});
