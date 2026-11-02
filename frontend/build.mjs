import { cp, mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const frontendRoot = fileURLToPath(new URL('.', import.meta.url))
const dist = join(frontendRoot, 'dist')

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(join(frontendRoot, 'index.html'), join(dist, 'index.html'))
await cp(join(frontendRoot, 'src'), join(dist, 'src'), { recursive: true })

console.log(`Built frontend into ${dist}`)
