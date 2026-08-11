import { describe, expect, it } from 'vitest'
import { createImageOutputName } from '../src/features/tools/image/shared/image-output-name'

describe('createImageOutputName', () => {
  it('replaces the original extension with the selected format', () => {
    expect(createImageOutputName('holiday.photo.PNG', 'image/webp')).toBe(
      'holiday.photo-lighttools.webp',
    )
  })

  it('drops supplied path segments', () => {
    expect(createImageOutputName('../private/photo.jpg', 'image/jpeg')).toBe('photo-lighttools.jpg')
  })
})
