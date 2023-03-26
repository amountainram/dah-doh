import {defineConfig} from 'vite'
import {fileURLToPath} from 'url'
import {dirname, resolve} from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: [
        resolve(__dirname, '../src/index.ts'),
      ],
      name: 'dah-doh',
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      output: {
        minifyInternalExports: false,
        chunkFileNames: ({name}) => `${name}.js`,
        manualChunks: (info) => {
          if(info !== resolve(__dirname, '../src/index.ts')) {
            return 'promises'
          }
        }
      }
    },
    emptyOutDir: true,
    outDir: 'dist/es'
  },
})
