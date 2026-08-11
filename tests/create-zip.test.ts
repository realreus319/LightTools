import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import { createZipBlob } from '../src/lib/files/create-zip'

describe('createZipBlob', () => {
  it('creates a readable archive with safe unique names', async () => {
    const blob = await createZipBlob([
      { name: '../report.txt', blob: new Blob(['first']) },
      { name: '../report.txt', blob: new Blob(['second']) },
    ])
    const archive = unzipSync(new Uint8Array(await blob.arrayBuffer()))
    const names = Object.keys(archive)

    expect(names).toEqual(['report.txt', 'report-2.txt'])
    expect(strFromU8(archive['report.txt'] ?? new Uint8Array())).toBe('first')
    expect(strFromU8(archive['report-2.txt'] ?? new Uint8Array())).toBe('second')
  })
})
