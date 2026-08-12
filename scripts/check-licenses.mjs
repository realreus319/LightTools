import { execFileSync } from 'node:child_process'

const output = execFileSync('pnpm', ['licenses', 'list', '--prod', '--json'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
})
const report = JSON.parse(output)
const blocked = []
const reviewedCopyleft = new Map([
  ['@img/sharp-libvips-linux-x64@1.2.4', 'LGPL-3.0-or-later'],
  ['@img/sharp-libvips-linuxmusl-x64@1.2.4', 'LGPL-3.0-or-later'],
])

function isBlockedLicense(license) {
  const normalized = license.toUpperCase()
  if (normalized === 'UNKNOWN') return true
  if (normalized.includes('AGPL')) return true
  if (normalized.includes('SSPL')) return true
  if (normalized.includes('BUSL')) return true
  if (normalized.includes('PROPRIETARY') || normalized.includes('UNLICENSED')) return true
  return normalized.includes('GPL') && !normalized.includes('LGPL')
}

for (const [license, packages] of Object.entries(report)) {
  if (isBlockedLicense(license)) {
    for (const pkg of packages) {
      blocked.push(`${pkg.name}@${pkg.versions.join(',')} — ${license}`)
    }
    continue
  }

  if (license.toUpperCase().includes('LGPL')) {
    for (const pkg of packages) {
      for (const version of pkg.versions) {
        const key = `${pkg.name}@${version}`
        if (reviewedCopyleft.get(key) !== license) {
          blocked.push(`${key} — ${license} (unreviewed copyleft dependency)`)
        }
      }
    }
  }
}

if (blocked.length > 0) {
  console.error(`Blocked, unknown, or unreviewed production licenses:\n${blocked.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(
    `Production license scan passed across ${Object.keys(report).length} license groups; reviewed copyleft versions are pinned.`,
  )
}
