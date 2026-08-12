import { spawnSync } from 'node:child_process'

const result = spawnSync('pnpm', ['exec', 'next', 'build', '--webpack'], {
  encoding: 'utf8',
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
})

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
process.stdout.write(output)

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

const warningLines = output
  .split(/\r?\n/)
  .filter((line) => /^\s*(?:warning\b|warn\b|⚠)/i.test(line))
  .filter((line) => !/No build cache found\. Please configure build caching/i.test(line))

if (warningLines.length > 0) {
  console.error(`Production build emitted warnings:\n${warningLines.join('\n')}`)
  process.exit(1)
}

console.log('Production build completed without product warnings.')
