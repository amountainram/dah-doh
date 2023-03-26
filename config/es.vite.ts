import {defineConfig} from 'vite'
import {
  buildOptions, entry, makeRollupOptions, optimizeDeps
} from './commons'

export default defineConfig({
  optimizeDeps,
  build: {
    ...buildOptions,
    lib: {
      entry,
      name: 'dah-doh',
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`
    },
    rollupOptions: makeRollupOptions('js'),
    outDir: 'dist/es'
  },
})
