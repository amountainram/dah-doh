import {readFileSync} from 'fs'
import {
  extname, join, resolve
} from 'path'
import type {PluginOption} from 'vite'
import {fileURLToPath} from 'url'
import {dirname} from 'path'

type Extension = '' | `.${string}`

const __dirname = dirname(fileURLToPath(import.meta.url))

const getMimeType = (ext: Extension): string | undefined => {
  switch (ext) {
  case '.html':
    return 'text/html'
  case '':
  default:
    return
  }
}

const reverseProxy = (): PluginOption => ({
  name: 'reverse-proxy',
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const {url = ''} = req
      if(url.startsWith('/e2e')) {
        let filepath = join(resolve(__dirname, '..'), url)
        let ext = extname(filepath) as Extension
        if(ext === '') {
          filepath = `${filepath}/index.html`
          ext = '.html'
        }

        try {
          const content = readFileSync(filepath).toString()
          const mimeType = getMimeType(ext)
          mimeType !== undefined && res.setHeader('content-type', mimeType)
          
          res.statusCode = 200
          res.write(content)
        } catch (err) {
          res.statusCode = 500
          res.write(err)
        }

        res.end()
        return
      }

      next()
    })
  }
})

export {reverseProxy}
