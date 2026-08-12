import { describe, expect, it, vi } from 'vitest'
import { ObjectUrlManager } from '../src/lib/files/object-url-manager'

describe('ObjectUrlManager', () => {
  it('revokes tracked object URLs exactly once', () => {
    let id = 0
    const revoke = vi.fn()
    const manager = new ObjectUrlManager(() => `blob:test-${(id += 1)}`, revoke)
    const first = manager.create(new Blob(['a']))
    manager.create(new Blob(['b']))

    manager.revoke(first)
    manager.revoke(first)
    manager.revokeAll()

    expect(revoke).toHaveBeenCalledTimes(2)
    expect(manager.size).toBe(0)
  })
})
