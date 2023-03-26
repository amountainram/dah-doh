import {defineConfig} from 'vite'
import {
  entry, makeRollupOptions, optimizeDeps, buildOptions
} from './commons'

export default defineConfig({
  optimizeDeps,
  build: {
    ...buildOptions,
    minify: false,
    lib: {
      entry,
      name: 'dah-doh',
      formats: ['cjs'],
      fileName: (_, entryName) => `${entryName}.cjs`
    },
    rollupOptions: makeRollupOptions('cjs'),
    emptyOutDir: true,
    outDir: 'dist/cjs'
  },
})