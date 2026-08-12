import { execFileSync } from 'node:child_process'

const output = execFileSync('pnpm', ['licenses', 'list', '--prod', '--json'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
})
const report = JSON.parse(output)
const forbidden = /(^|[^A-Z])(AGPL|GPL|LGPL|SSPL|BUSL|PROPRIETARY|UNLICENSED)([^A-Z]|$)/i
const blocked = []

for (const [license, packages] of Object.entries(report)) {
  if (license === 'Unknown' || forbidden.test(license)) {
    for (const pkg of packages) {
      blocked.push(`${pkg.name}@${pkg.versions.join(',')} — ${license}`)
    }
  }
}

if (blocked.length > 0) {
  console.error(`Blocked or unknown production licenses:\n${blocked.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`Production license scan passed across ${Object.keys(report).length} license groups.`)
}
