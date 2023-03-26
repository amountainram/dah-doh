import type {
  BuildOptions, DepOptimizationOptions, LibraryOptions, OptimizedDepInfo
} from 'vite'
import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const entry: LibraryOptions['entry'] = [
  resolve(__dirname, '../src/index.ts'),
  resolve(__dirname, '../src/polyfill.ts'),
]

const makeRollupOptions = (chunkExtension: 'js' | 'cjs'): BuildOptions['rollupOptions'] => ({
  external: ['node:buffer', 'node:fs', 'node:http', 'node:https', 'node:net', 'node:path', 'node:stream', 'node:url', 'node:util', 'node:zlib'],
  output: {
    minifyInternalExports: false,
    chunkFileNames: ({name}) => `${name}.${chunkExtension}`,
    manualChunks: (info) => {
      if(info === resolve(__dirname, '../src/index.ts')) {
        return 'index'
      }

      if(info === resolve(__dirname, '../src/polyfill.ts') || !info.match(/dah-doh\/src/)) {
        return 'polyfill'
      }

      return 'promises'
    }
  }
})

const buildOptions: BuildOptions = {
  emptyOutDir: true,
  minify: false,
  modulePreload: false,
  target: 'ES2018'
}

const optimizeDeps: DepOptimizationOptions = {
  disabled: true
}

export {entry, makeRollupOptions, buildOptions, optimizeDeps}