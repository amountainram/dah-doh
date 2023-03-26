import {defineConfig} from 'vite'
import {fileURLToPath} from 'url'
import {dirname, resolve} from 'path'
import {reverseProxy} from './config/reverse-proxy'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    target: 'ES2015',
    lib: {
      entry: [
        resolve(__dirname, 'src/index.ts'),
      ],
      name: 'dahDoh',
      formats: ['es', 'umd'],
      fileName: (format, entryName) => `${entryName}.${format}.js`
    },
    emptyOutDir: true,
    outDir: 'dist'
  },
  plugins: [reverseProxy()]
})
