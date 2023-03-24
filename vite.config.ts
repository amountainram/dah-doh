import {defineConfig} from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: ['src/index.ts', 'src/promises.ts'],
      name: 'dah-doh',
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      output: {
        chunkFileNames: ({name}) => `assets/${name}.js`
      }
    },
    emptyOutDir: true,
    outDir: 'dist'
  }
})