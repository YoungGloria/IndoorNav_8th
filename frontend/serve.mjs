import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)))
const portArgumentIndex = process.argv.indexOf('--port')
const portFromArgument = portArgumentIndex >= 0 ? process.argv[portArgumentIndex + 1] : undefined
const port = Number(portFromArgument || process.env.PORT || 8080)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid port: ${port}`)
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || '/').split('?')[0])
  const requestedFile = resolve(join(root, requestPath === '/' ? 'index.html' : requestPath))
  const relativePath = relative(root, requestedFile)

  if (relativePath.startsWith('..') || relativePath.includes(`${relative.sep}..${relative.sep}`)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  const file = existsSync(requestedFile) && statSync(requestedFile).isFile()
    ? requestedFile
    : join(root, 'index.html')

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(file)] || 'application/octet-stream',
  })
  createReadStream(file).pipe(response)
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server listening on http://localhost:${port}`)
})
