import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const ROOTS = ['app', 'src']
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx'])
const FORBIDDEN = [
  { pattern: /dangerouslySetInnerHTML/, reason: 'dangerouslySetInnerHTML requires an explicit security review' },
  { pattern: /\bsrcDoc\s*=/, reason: 'srcDoc can introduce HTML injection paths' },
  { pattern: /\.innerHTML\s*=/, reason: 'direct innerHTML assignment can introduce HTML injection paths' },
]
const CONSOLE_PATTERN = /console\.(log|info|warn|error)\s*\(/
const SAFE_CONSOLE_FILE = 'src/lib/debug/debug-logger.ts'

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await collectFiles(path)))
    else if (EXTENSIONS.has(extname(entry.name))) files.push(path)
  }
  return files
}

const violations = []
for (const root of ROOTS) {
  for (const file of await collectFiles(root)) {
    const source = await readFile(file, 'utf8')
    const displayPath = relative(process.cwd(), file).replaceAll('\\', '/')
    for (const rule of FORBIDDEN) {
      if (rule.pattern.test(source)) violations.push(`${displayPath}: ${rule.reason}`)
    }
    if (displayPath !== SAFE_CONSOLE_FILE && CONSOLE_PATTERN.test(source)) {
      violations.push(`${displayPath}: production source must use the safe debug/error adapters`)
    }
  }
}

const nextConfig = await readFile('next.config.ts', 'utf8')
if (!nextConfig.includes("object-src 'none'")) {
  violations.push("next.config.ts: CSP must include object-src 'none'")
}

if (violations.length > 0) {
  console.error(violations.join('\n'))
  process.exitCode = 1
} else {
  console.log('Source safety checks passed.')
}
