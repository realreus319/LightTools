import { describe, expect, it } from 'vitest'
import { ToolDefinitionSchema } from '../src/lib/tool-registry/schema'
import { getRelatedTools, getToolBySlug, isToolSlug, tools } from '../src/lib/tool-registry/tools'

describe('tool registry', () => {
  it('contains schema-valid unique tools', () => {
    const slugs = tools.map((tool) => tool.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const tool of tools) {
      expect(ToolDefinitionSchema.safeParse(tool).success).toBe(true)
    }
  })

  it('resolves every related tool', () => {
    for (const tool of tools) {
      expect(getRelatedTools(tool)).toHaveLength(tool.related.length)
    }
  })

  it('exposes safe slug lookup', () => {
    expect(isToolSlug('image-compress')).toBe(true)
    expect(isToolSlug('../image-compress')).toBe(false)
    expect(getToolBySlug('image-compress')?.category).toBe('image')
    expect(getToolBySlug('missing')).toBeUndefined()
  })
})
