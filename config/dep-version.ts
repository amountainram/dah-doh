import {readFile} from 'fs/promises'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)

function getArgs() {
  const {argv: [,,dep]} = process
  const ctx: {dep?: string} = {}

  if(typeof dep === 'string') {
    ctx.dep = dep
  }

  return ctx
}

async function main(): Promise<string> {
  const {dep: packageName} = getArgs()

  if (packageName === undefined) {
    throw new TypeError('must select a dependency')
  }

  const pathToPackageJSON = require.resolve(`${packageName}/package.json`)
  const buffer = await readFile(pathToPackageJSON)
  const {version} = JSON.parse(buffer.toString()) as {version: string}
  return version
}

main()
  .then(console.log)
  .catch(console.error)
